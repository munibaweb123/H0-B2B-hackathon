import json

from agents import Runner
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.ai.agent import detect_language, propflow_agent
from backend.ai.tools import AgentContext
from backend.core.auth import get_current_user
from backend.core.config import settings
from backend.core.database import get_session
from backend.integrations.whatsapp import send_whatsapp, verify_signature
from backend.integrations.whisper import transcribe_voice_note
from backend.models.agency import Agency
from backend.models.client import Client
from backend.models.interaction_log import InteractionType
from backend.schemas.interaction import InteractionCreate
from backend.services.interaction_service import log_interaction

router = APIRouter(tags=["whatsapp"])


class SendRequest(BaseModel):
    to: str
    message: str


@router.get("/whatsapp/webhook")
async def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/whatsapp/webhook", status_code=200)
async def receive_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    body = await request.body()
    sig = request.headers.get("x-hub-signature-256", "")

    if settings.WHATSAPP_APP_SECRET and not verify_signature(body, sig):
        raise HTTPException(status_code=403, detail="Invalid signature")

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {"status": "ok"}

    # Use first agency as the demo tenant
    agency_result = await session.exec(select(Agency).limit(1))
    agency = agency_result.first()
    if not agency:
        return {"status": "ok"}

    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            messages = change.get("value", {}).get("messages", [])
            for msg in messages:
                sender = msg.get("from", "")
                msg_type = msg.get("type", "")

                text: str | None = None
                if msg_type == "text":
                    text = msg.get("text", {}).get("body", "")
                elif msg_type == "audio":
                    media_id = msg.get("audio", {}).get("id", "")
                    if media_id:
                        try:
                            text = await transcribe_voice_note(media_id)
                        except Exception:
                            text = None

                if not text or not sender:
                    continue

                lang = detect_language(text)
                ctx = AgentContext(
                    tenant_id=agency.id,
                    session=session,
                    language=lang,
                )
                try:
                    ai_result = await Runner.run(propflow_agent, input=text, context=ctx)
                    reply = ai_result.final_output
                    await send_whatsapp(to=sender, message=reply)
                except Exception:
                    pass

    return {"status": "ok"}


@router.post("/whatsapp/send")
async def send_message(
    body: SendRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    await send_whatsapp(to=body.to, message=body.message)

    # Log interaction if we can identify the client by phone
    client_result = await session.exec(
        select(Client).where(
            Client.tenant_id == current_user.tenant_id,
            Client.phone == body.to,
        )
    )
    client = client_result.first()
    if client:
        await log_interaction(
            client_id=client.id,
            agent_id=current_user.id,
            data=InteractionCreate(type=InteractionType.whatsapp, content=body.message),
            tenant_id=current_user.tenant_id,
            session=session,
        )

    return {"sent": True}
