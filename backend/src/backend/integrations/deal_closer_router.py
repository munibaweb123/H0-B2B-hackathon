import asyncio
import json
from uuid import UUID

from agents import Runner
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.ai.agent import _direct_agent
from backend.ai.tools import AgentContext, _serialize_client, _serialize_property
from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.integrations.whatsapp import send_whatsapp
from backend.models.interaction_log import InteractionType
from backend.schemas.interaction import InteractionCreate
from backend.services import client_service, interaction_service, property_service

router = APIRouter(tags=["deal-closer"])


async def _generate_pitch(client, prop, tenant_id: UUID, session: AsyncSession) -> str:
    ctx = AgentContext(tenant_id=tenant_id, session=session, language="english")
    prompt = (
        "Write a brief, personalized WhatsApp pitch for this real estate client.\n\n"
        f"PROPERTY:\n{json.dumps(_serialize_property(prop), indent=2)}\n\n"
        f"CLIENT:\n{json.dumps(_serialize_client(client), indent=2)}\n\n"
        "Write a compelling 2-3 sentence WhatsApp message presenting this property.\n"
        "Reference their requirements (budget, bedrooms, city/area) and explain the fit.\n"
        "Be warm, professional, and concise. Return ONLY the message text."
    )
    result = await Runner.run(_direct_agent, input=prompt, context=ctx)
    return result.final_output


@router.post("/deal-closer/{property_id}")
async def trigger_deal_closer(
    property_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    prop = await property_service.get_property(property_id, current_user.tenant_id, session)

    all_clients = await client_service.list_clients(
        tenant_id=current_user.tenant_id, session=session, limit=100
    )

    # Quick criteria filter — budget, city, bedrooms
    matched = []
    for c in all_clients:
        budget_ok = c.budget_max is None or float(c.budget_max) >= float(prop.price) * 0.85
        city_ok = (
            c.preferred_city is None
            or c.preferred_city.lower() in prop.city.lower()
            or prop.city.lower() in c.preferred_city.lower()
        )
        beds_ok = c.bedrooms_needed is None or c.bedrooms_needed == prop.bedrooms
        if budget_ok and city_ok and beds_ok:
            matched.append(c)

    matched = matched[:5]

    if not matched:
        return {"property_id": str(property_id), "clients_pitched": []}

    # Generate pitches concurrently
    pitches = await asyncio.gather(
        *[_generate_pitch(c, prop, current_user.tenant_id, session) for c in matched],
        return_exceptions=True,
    )

    clients_pitched = []
    for client, pitch in zip(matched, pitches):
        if isinstance(pitch, Exception):
            continue

        if client.phone:
            try:
                await send_whatsapp(to=client.phone, message=str(pitch))
            except Exception:
                pass

        try:
            await interaction_service.log_interaction(
                client_id=client.id,
                agent_id=current_user.id,
                data=InteractionCreate(
                    type=InteractionType.whatsapp, content=str(pitch)
                ),
                tenant_id=current_user.tenant_id,
                session=session,
            )
        except Exception:
            pass

        preview = str(pitch)
        clients_pitched.append(
            {
                "client_id": str(client.id),
                "name": client.full_name,
                "message_preview": preview[:100] + "..." if len(preview) > 100 else preview,
            }
        )

    return {"property_id": str(property_id), "clients_pitched": clients_pitched}
