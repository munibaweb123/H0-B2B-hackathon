import asyncio
import json
from uuid import UUID

from agents import Runner
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.ai.agent import _direct_agent
from backend.ai.tools import AgentContext, _serialize_client
from backend.core.auth import get_current_user
from backend.core.config import settings
from backend.core.database import get_session
from backend.models.interaction_log import InteractionType
from backend.schemas.interaction import InteractionCreate
from backend.services import client_service, interaction_service
from backend.services.interaction_service import list_interactions

router = APIRouter(tags=["email"])


@router.post("/email/followup/{client_id}")
async def email_followup(
    client_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    if not settings.RESEND_API_KEY:
        return {"sent": False, "reason": "RESEND_API_KEY not configured"}

    client = await client_service.get_client(client_id, current_user.tenant_id, session)

    if not client.email:
        return {"sent": False, "reason": "Client has no email address"}

    interactions = await list_interactions(
        client_id=client_id, tenant_id=current_user.tenant_id, session=session
    )
    last_note = (
        f"Last interaction ({interactions[0].type}): {interactions[0].content}"
        if interactions
        else "No previous interactions."
    )

    ctx = AgentContext(tenant_id=current_user.tenant_id, session=session, language="english")
    prompt = (
        "Write a professional follow-up email for this real estate client.\n\n"
        f"CLIENT:\n{json.dumps(_serialize_client(client), indent=2)}\n\n"
        f"STAGE: {client.stage}\n{last_note}\n\n"
        "Write a 3-5 sentence professional email body (no subject line needed).\n"
        "Reference their property requirements and current stage. Be warm and helpful.\n"
        "Return ONLY the email body text."
    )

    result = await Runner.run(_direct_agent, input=prompt, context=ctx)
    email_text = result.final_output

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY
        await asyncio.to_thread(
            resend.Emails.send,
            {
                "from": "PropFlow <onboarding@resend.dev>",
                "to": [settings.DEMO_EMAIL or client.email],
                "subject": f"Property Update for {client.full_name}",
                "text": email_text,
            },
        )
    except Exception as e:
        return {"sent": False, "reason": str(e)}

    try:
        await interaction_service.log_interaction(
            client_id=client_id,
            agent_id=current_user.id,
            data=InteractionCreate(type=InteractionType.email, content=email_text),
            tenant_id=current_user.tenant_id,
            session=session,
        )
    except Exception:
        pass

    preview = email_text[:100]
    return {"sent": True, "message_preview": preview}
