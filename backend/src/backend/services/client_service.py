from datetime import datetime
from typing import List
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy import delete as sa_delete
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.models.client import Client, ClientStage, STAGE_ORDER
from backend.models.interaction_log import InteractionLog
from backend.schemas.client import ClientCreate, ClientUpdate


async def create_client(data: ClientCreate, tenant_id: UUID, session: AsyncSession) -> Client:
    client = Client(**data.model_dump(), tenant_id=tenant_id)
    session.add(client)
    await session.commit()
    await session.refresh(client)
    return client


async def list_clients(
    tenant_id: UUID, session: AsyncSession, limit: int = 50, offset: int = 0
) -> List[Client]:
    result = await session.exec(
        select(Client).where(Client.tenant_id == tenant_id).offset(offset).limit(limit)
    )
    return list(result.all())


async def get_client(client_id: UUID, tenant_id: UUID, session: AsyncSession) -> Client:
    result = await session.exec(
        select(Client).where(Client.id == client_id, Client.tenant_id == tenant_id)
    )
    client = result.first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


async def update_client(
    client_id: UUID, data: ClientUpdate, tenant_id: UUID, session: AsyncSession
) -> Client:
    client = await get_client(client_id, tenant_id, session)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    client.updated_at = datetime.utcnow()
    session.add(client)
    await session.commit()
    await session.refresh(client)
    return client


async def update_stage(
    client_id: UUID, new_stage: ClientStage, tenant_id: UUID, session: AsyncSession
) -> Client:
    client = await get_client(client_id, tenant_id, session)
    current_idx = STAGE_ORDER.index(client.stage)
    new_idx = STAGE_ORDER.index(new_stage)
    if new_idx != current_idx + 1:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stage transition: {client.stage} → {new_stage}. Must advance exactly one step.",
        )
    client.stage = new_stage
    client.updated_at = datetime.utcnow()
    session.add(client)
    await session.commit()
    await session.refresh(client)
    return client


async def delete_client(client_id: UUID, tenant_id: UUID, session: AsyncSession) -> None:
    client = await get_client(client_id, tenant_id, session)
    await session.execute(
        sa_delete(InteractionLog).where(InteractionLog.client_id == client_id)
    )
    await session.delete(client)
    await session.commit()
