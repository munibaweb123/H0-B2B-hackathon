from typing import List
from uuid import UUID
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.models.interaction_log import InteractionLog
from backend.schemas.interaction import InteractionCreate
from backend.services.client_service import get_client


async def log_interaction(
    client_id: UUID,
    agent_id: UUID,
    data: InteractionCreate,
    tenant_id: UUID,
    session: AsyncSession,
) -> InteractionLog:
    await get_client(client_id, tenant_id, session)
    log = InteractionLog(
        tenant_id=tenant_id,
        client_id=client_id,
        agent_id=agent_id,
        type=data.type,
        content=data.content,
    )
    session.add(log)
    await session.commit()
    await session.refresh(log)
    return log


async def list_interactions(
    client_id: UUID, tenant_id: UUID, session: AsyncSession
) -> List[InteractionLog]:
    await get_client(client_id, tenant_id, session)
    result = await session.exec(
        select(InteractionLog)
        .where(
            InteractionLog.client_id == client_id,
            InteractionLog.tenant_id == tenant_id,
        )
        .order_by(InteractionLog.created_at.desc())
    )
    return list(result.all())
