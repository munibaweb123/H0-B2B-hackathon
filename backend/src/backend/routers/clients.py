from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.team_member import TeamMember
from backend.schemas.client import ClientCreate, ClientUpdate, ClientResponse, StageUpdate
from backend.schemas.interaction import InteractionCreate, InteractionResponse
from backend.services import client_service, interaction_service

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    body: ClientCreate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await client_service.create_client(body, current_user.tenant_id, session)


@router.get("", response_model=List[ClientResponse])
async def list_clients(
    limit: int = 50,
    offset: int = 0,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await client_service.list_clients(current_user.tenant_id, session, limit=limit, offset=offset)


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: UUID,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await client_service.get_client(client_id, current_user.tenant_id, session)


@router.patch("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: UUID,
    body: ClientUpdate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await client_service.update_client(client_id, body, current_user.tenant_id, session)


@router.patch("/{client_id}/stage", response_model=ClientResponse)
async def update_stage(
    client_id: UUID,
    body: StageUpdate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await client_service.update_stage(client_id, body.stage, current_user.tenant_id, session)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: UUID,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await client_service.delete_client(client_id, current_user.tenant_id, session)


@router.post("/{client_id}/interactions", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def log_interaction(
    client_id: UUID,
    body: InteractionCreate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await interaction_service.log_interaction(
        client_id, current_user.id, body, current_user.tenant_id, session
    )


@router.get("/{client_id}/interactions", response_model=List[InteractionResponse])
async def list_interactions(
    client_id: UUID,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await interaction_service.list_interactions(client_id, current_user.tenant_id, session)
