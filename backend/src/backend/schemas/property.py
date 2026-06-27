from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from sqlmodel import SQLModel
from backend.models.property import PropertyType, PropertyStatus


class PropertyCreate(SQLModel):
    title: str
    description: Optional[str] = None
    property_type: PropertyType
    status: PropertyStatus = PropertyStatus.available
    price: Decimal
    area_sqft: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    city: str
    area: Optional[str] = None
    address: Optional[str] = None
    photos: List[str] = []


class PropertyUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    price: Optional[Decimal] = None
    area_sqft: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    city: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    photos: Optional[List[str]] = None


class PropertyResponse(SQLModel):
    id: UUID
    tenant_id: UUID
    title: str
    description: Optional[str] = None
    property_type: PropertyType
    status: PropertyStatus
    price: Decimal
    area_sqft: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    city: str
    area: Optional[str] = None
    address: Optional[str] = None
    photos: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
