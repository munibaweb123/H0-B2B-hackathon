from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.client import Client
from backend.models.interaction_log import InteractionType
from backend.schemas.interaction import InteractionCreate
from backend.services.interaction_service import log_interaction

router = APIRouter(tags=["whatsapp"])


class SendRequest(BaseModel):
    to: str
    message: str


@router.post("/whatsapp/send")
async def send_message(
    body: SendRequest,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    # Deferred import — wa is None until init_whatsapp() runs in main.py
    from backend.integrations.whatsapp import send_whatsapp

    await send_whatsapp(to=body.to, message=body.message)

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
