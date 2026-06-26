from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.models.property import Property, PropertyType, PropertyStatus
from backend.schemas.property import PropertyCreate, PropertyUpdate


async def create_property(data: PropertyCreate, tenant_id: UUID, session: AsyncSession) -> Property:
    prop = Property(**data.model_dump(), tenant_id=tenant_id)
    session.add(prop)
    await session.commit()
    await session.refresh(prop)
    return prop


async def list_properties(
    tenant_id: UUID,
    session: AsyncSession,
    status: Optional[PropertyStatus] = None,
    property_type: Optional[PropertyType] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    bedrooms: Optional[int] = None,
    city: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Property]:
    query = select(Property).where(Property.tenant_id == tenant_id)
    if status:
        query = query.where(Property.status == status)
    if property_type:
        query = query.where(Property.property_type == property_type)
    if min_price is not None:
        query = query.where(Property.price >= min_price)
    if max_price is not None:
        query = query.where(Property.price <= max_price)
    if bedrooms is not None:
        query = query.where(Property.bedrooms == bedrooms)
    if city:
        query = query.where(Property.city.ilike(f"%{city}%"))
    query = query.offset(offset).limit(limit)
    result = await session.exec(query)
    return list(result.all())


async def get_property(property_id: UUID, tenant_id: UUID, session: AsyncSession) -> Property:
    result = await session.exec(
        select(Property).where(Property.id == property_id, Property.tenant_id == tenant_id)
    )
    prop = result.first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


async def update_property(
    property_id: UUID, data: PropertyUpdate, tenant_id: UUID, session: AsyncSession
) -> Property:
    prop = await get_property(property_id, tenant_id, session)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
    prop.updated_at = datetime.utcnow()
    session.add(prop)
    await session.commit()
    await session.refresh(prop)
    return prop


async def delete_property(property_id: UUID, tenant_id: UUID, session: AsyncSession) -> None:
    prop = await get_property(property_id, tenant_id, session)
    await session.delete(prop)
    await session.commit()
