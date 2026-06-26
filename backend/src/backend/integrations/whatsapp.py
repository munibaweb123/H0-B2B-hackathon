import hashlib
import hmac

import httpx

from backend.core.config import settings


async def send_whatsapp(to: str, message: str) -> None:
    """Send a WhatsApp text message via Meta Graph API."""
    if not settings.WHATSAPP_ACCESS_TOKEN or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}"
            f"/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
            headers={
                "Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": message},
            },
            timeout=10.0,
        )


def verify_signature(payload: bytes, signature: str) -> bool:
    """Verify Meta webhook X-Hub-Signature-256 header."""
    if not settings.WHATSAPP_APP_SECRET or not signature:
        return False
    mac = hmac.new(
        settings.WHATSAPP_APP_SECRET.encode(), payload, hashlib.sha256
    )
    expected = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected, signature)
