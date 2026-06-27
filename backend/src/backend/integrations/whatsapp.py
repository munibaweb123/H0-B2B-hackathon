from __future__ import annotations

from typing import TYPE_CHECKING

from pywa_async import WhatsApp

from backend.core.config import settings

if TYPE_CHECKING:
    from fastapi import FastAPI

# Module-level singleton — populated by init_whatsapp() called from main.py
wa: WhatsApp | None = None


def init_whatsapp(app: FastAPI) -> WhatsApp:
    global wa
    wa = WhatsApp(
        phone_id=settings.WHATSAPP_PHONE_NUMBER_ID,
        token=settings.WHATSAPP_ACCESS_TOKEN,
        server=app,
        webhook_endpoint="/webhook",
        verify_token=settings.WHATSAPP_VERIFY_TOKEN,
        app_id=int(settings.WHATSAPP_APP_ID) if settings.WHATSAPP_APP_ID else None,
        app_secret=settings.WHATSAPP_APP_SECRET,
        api_version=float(str(settings.WHATSAPP_API_VERSION).lstrip("v")) if settings.WHATSAPP_API_VERSION else 19.0,
        validate_updates=True,
    )
    return wa


async def send_whatsapp(to: str, message: str) -> None:
    """Send a WhatsApp text message via pywa_async client."""
    if wa is None or not settings.WHATSAPP_PHONE_NUMBER_ID:
        return
    await wa.send_message(to=to, text=message)
