import io

import httpx
import openai

from backend.core.config import settings


async def transcribe_voice_note(media_id: str) -> str:
    """Download a WhatsApp voice note and transcribe it with Whisper."""
    async with httpx.AsyncClient() as client:
        # Resolve the media download URL from Meta
        url_resp = await client.get(
            f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{media_id}",
            headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
            timeout=10.0,
        )
        url_resp.raise_for_status()
        media_url = url_resp.json()["url"]

        # Download the audio file
        audio_resp = await client.get(
            media_url,
            headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
            timeout=30.0,
        )
        audio_resp.raise_for_status()
        audio_bytes = audio_resp.content

    oai = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    result = await oai.audio.transcriptions.create(
        model="whisper-1",
        file=("audio.ogg", io.BytesIO(audio_bytes), "audio/ogg"),
    )
    return result.text
