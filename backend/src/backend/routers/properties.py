from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.property import PropertyType, PropertyStatus
from backend.models.team_member import TeamMember
from backend.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse
from backend.services import property_service

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    body: PropertyCreate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await property_service.create_property(body, current_user.tenant_id, session)


@router.get("", response_model=List[PropertyResponse])
async def list_properties(
    status_filter: Optional[PropertyStatus] = None,
    property_type: Optional[PropertyType] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    bedrooms: Optional[int] = None,
    city: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await property_service.list_properties(
        current_user.tenant_id,
        session,
        status=status_filter,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        city=city,
        limit=limit,
        offset=offset,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await property_service.get_property(property_id, current_user.tenant_id, session)


@router.patch("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: UUID,
    body: PropertyUpdate,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await property_service.update_property(property_id, body, current_user.tenant_id, session)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: UUID,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    await property_service.delete_property(property_id, current_user.tenant_id, session)
