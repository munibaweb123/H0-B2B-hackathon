from agents import Runner
from pywa_async import WhatsApp, filters
from pywa_async.types import Message
from sqlmodel import select

from backend.ai.agent import detect_language, propflow_agent
from backend.ai.tools import AgentContext
from backend.core.database import AsyncSessionLocal
from backend.integrations.whisper import transcribe_bytes
from backend.models.agency import Agency

# Deduplication — Meta can send duplicate webhook events
_processed_ids: set[str] = set()


async def _reply_with_ai(client: WhatsApp, msg: Message, text: str) -> None:
    # Mark as read + show typing indicator in one call
    try:
        await client.indicate_typing(message_id=msg.id)
    except Exception:
        pass

    async with AsyncSessionLocal() as session:
        agency_result = await session.exec(select(Agency).limit(1))
        agency = agency_result.first()
        if not agency:
            return
        lang = detect_language(text)
        ctx = AgentContext(tenant_id=agency.id, session=session, language=lang)
        result = await Runner.run(propflow_agent, input=text, context=ctx)
        await msg.reply_text(result.final_output)


async def handle_text_message(client: WhatsApp, msg: Message) -> None:
    if not msg.text or msg.id in _processed_ids:
        return
    _processed_ids.add(msg.id)
    try:
        await _reply_with_ai(client, msg, msg.text)
    except Exception:
        pass


async def handle_audio_message(client: WhatsApp, msg: Message) -> None:
    if msg.id in _processed_ids:
        return
    _processed_ids.add(msg.id)
    try:
        await client.indicate_typing(message_id=msg.id)
    except Exception:
        pass
    try:
        audio_bytes = await msg.audio.get_bytes()
        transcript = await transcribe_bytes(audio_bytes, msg.audio.mime_type or "audio/ogg")
    except Exception:
        return
    try:
        await _reply_with_ai(client, msg, transcript)
    except Exception:
        pass


def register_handlers(wa: WhatsApp) -> None:
    wa.on_message(filters.text)(handle_text_message)
    wa.on_message(filters.audio)(handle_audio_message)
