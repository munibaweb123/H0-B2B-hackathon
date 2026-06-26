"""Bridges a Meta WhatsApp Calling SDP session to OpenAI Realtime via Pipecat.
One CallSession = one live phone call.

Requires public UDP reachability for WebRTC RTP media.
"""
from __future__ import annotations

import asyncio
import io
import wave
from uuid import uuid4

from pipecat.frames.frames import Frame, LLMRunFrame, LLMTextFrame, TranscriptionFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.processors.audio.audio_buffer_processor import AudioBufferProcessor
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.openai.realtime import events
from pipecat.services.openai.realtime.llm import OpenAIRealtimeLLMService
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport
from pipecat.workers.runner import WorkerRunner

from backend.core.config import settings

_ICE_SERVERS = ["stun:stun.l.google.com:19302"]
_CALL_AUDIO_SAMPLE_RATE = 8000  # WhatsApp uses narrowband 8kHz

_PROPFLOW_PROMPT = (
    "You are PropFlow AI, a real estate assistant for a Pakistani real estate agency on a WhatsApp voice call. "
    "Greet the caller warmly and immediately ask how you can help. "
    "If they are looking for property, ask: city, type (house/apartment/plot), bedrooms, and budget in PKR/lakh. "
    "Suggest they visit the office or speak to an agent for a site visit. "
    "Keep responses short and conversational — this is a phone call. "
    "Respond in the same language the caller uses (English or Roman Urdu)."
)


def _normalize_answer_sdp(sdp: str) -> str:
    # Meta rejects >1 fingerprint line; also needs explicit ptime/maxptime
    lines = sdp.split("\r\n")
    result: list[str] = []
    kept_fingerprint = False
    for line in lines:
        if line.startswith("a=fingerprint:"):
            if not kept_fingerprint and "sha-256" in line:
                result.append(line)
                kept_fingerprint = True
        else:
            result.append(line)
    if "a=ptime:20" not in sdp:
        insert_at = next(
            (i for i, ln in enumerate(result) if ln.startswith("a=candidate:") or ln.startswith("a=end-of-candidates")),
            len(result),
        )
        result.insert(insert_at, "a=ptime:20")
        result.insert(insert_at, "a=maxptime:20")
    return "\r\n".join(result)


class _TranscriptCollector(FrameProcessor):
    def __init__(self, lines: list[str]):
        super().__init__()
        self._lines = lines

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if isinstance(frame, TranscriptionFrame) and frame.text.strip():
            self._lines.append(f"Caller: {frame.text.strip()}")
        elif isinstance(frame, LLMTextFrame) and frame.text.strip():
            self._lines.append(f"AI: {frame.text.strip()}")
        await self.push_frame(frame, direction)


def _pcm_to_wav(pcm_bytes: bytes, sample_rate: int, num_channels: int) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as f:
        f.setnchannels(num_channels)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(pcm_bytes)
    return buf.getvalue()


class CallSession:
    """One live bridged call. Created on CallConnect, torn down on CallTerminate."""

    def __init__(self):
        self.id = str(uuid4())
        self.transcript_lines: list[str] = []
        self.recorded_wav: bytes | None = None
        self._connection: SmallWebRTCConnection | None = None
        self._audio_buffer: AudioBufferProcessor | None = None
        self._runner: WorkerRunner | None = None
        self._run_task: asyncio.Task | None = None

    async def build_answer(self, offer_sdp: str) -> str:
        self._connection = SmallWebRTCConnection(ice_servers=_ICE_SERVERS)
        await self._connection.initialize(sdp=offer_sdp, type="offer")
        answer = self._connection.get_answer()
        raw_sdp = answer["sdp"].replace("a=setup:actpass", "a=setup:active")
        return _normalize_answer_sdp(raw_sdp)

    async def start(self) -> None:
        if self._connection is None:
            raise RuntimeError("build_answer() must be called before start()")

        transport = SmallWebRTCTransport(
            webrtc_connection=self._connection,
            params=TransportParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                audio_in_sample_rate=24000,   # upsample Meta's 8kHz for OpenAI Realtime
                audio_out_sample_rate=_CALL_AUDIO_SAMPLE_RATE,
            ),
        )

        context = LLMContext(messages=[{"role": "system", "content": _PROPFLOW_PROMPT}])
        user_agg, assistant_agg = LLMContextAggregatorPair(context, realtime_service_mode=True)

        # Use OpenAI Realtime with audio output — no ElevenLabs needed
        # OpenAI handles STT (Whisper-based VAD) + LLM + TTS natively
        llm = OpenAIRealtimeLLMService(
            api_key=settings.OPENAI_API_KEY,
            settings=OpenAIRealtimeLLMService.Settings(
                session_properties=events.SessionProperties(
                    instructions=_PROPFLOW_PROMPT,
                    output_modalities=["audio"],
                    voice="nova",
                    audio=events.AudioConfiguration(
                        input=events.AudioInput(
                            transcription=events.InputAudioTranscription()
                        ),
                    ),
                ),
            ),
        )

        self._audio_buffer = AudioBufferProcessor(sample_rate=_CALL_AUDIO_SAMPLE_RATE)

        @self._audio_buffer.event_handler("on_audio_data")
        async def _on_audio_data(_proc, audio: bytes, sample_rate: int, num_channels: int) -> None:
            self.recorded_wav = _pcm_to_wav(audio, sample_rate, num_channels)

        transcript_collector = _TranscriptCollector(self.transcript_lines)

        pipeline = Pipeline([
            transport.input(),
            transcript_collector,
            user_agg,
            llm,
            self._audio_buffer,
            transport.output(),
            assistant_agg,
        ])

        task = PipelineTask(pipeline)
        self._runner = WorkerRunner(handle_sigint=False, handle_sigterm=False)
        await self._runner.add_workers(task)
        self._run_task = asyncio.create_task(self._runner.run())
        await self._audio_buffer.start_recording()

        # Let runner call setup() on transport before connect()
        await asyncio.sleep(0.3)
        await self._connection.connect()

        # Trigger immediate greeting without waiting for caller to speak first
        await task.queue_frame(LLMRunFrame())

    async def stop(self) -> None:
        try:
            if self._audio_buffer:
                await self._audio_buffer.stop_recording()
            if self._runner:
                await self._runner.end()
            if self._connection:
                await self._connection.disconnect()
        except Exception:
            pass

    def transcript(self) -> str | None:
        return "\n".join(self.transcript_lines) if self.transcript_lines else None


active_sessions: dict[str, CallSession] = {}
