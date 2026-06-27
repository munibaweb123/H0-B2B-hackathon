from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlmodel import SQLModel
from backend.models.property import PropertyType
from backend.models.client import ClientStage


class ClientCreate(SQLModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferred_city: Optional[str] = None
    preferred_area: Optional[str] = None
    bedrooms_needed: Optional[int] = None
    property_type_needed: Optional[str] = None
    notes: Optional[str] = None


class ClientUpdate(SQLModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferred_city: Optional[str] = None
    preferred_area: Optional[str] = None
    bedrooms_needed: Optional[int] = None
    property_type_needed: Optional[str] = None
    notes: Optional[str] = None


class StageUpdate(SQLModel):
    stage: ClientStage


class ClientResponse(SQLModel):
    id: UUID
    tenant_id: UUID
    full_name: str
    phone: str
    email: Optional[str] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferred_city: Optional[str] = None
    preferred_area: Optional[str] = None
    bedrooms_needed: Optional[int] = None
    property_type_needed: Optional[str] = None
    notes: Optional[str] = None
    stage: ClientStage
    created_at: datetime
    updated_at: datetime
