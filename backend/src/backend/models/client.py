from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Column, Numeric, String
from sqlmodel import Field, SQLModel


class ClientStage(str, Enum):
    new_lead = "new_lead"
    contacted = "contacted"
    site_visit = "site_visit"
    negotiation = "negotiation"
    closed = "closed"


STAGE_ORDER = [
    ClientStage.new_lead,
    ClientStage.contacted,
    ClientStage.site_visit,
    ClientStage.negotiation,
    ClientStage.closed,
]


class Client(SQLModel, table=True):
    __tablename__ = "clients"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    full_name: str
    phone: str
    email: Optional[str] = Field(default=None)
    budget_min: Optional[Decimal] = Field(
        default=None, sa_column=Column(Numeric(15, 2), nullable=True)
    )
    budget_max: Optional[Decimal] = Field(
        default=None, sa_column=Column(Numeric(15, 2), nullable=True)
    )
    preferred_city: Optional[str] = Field(default=None)
    preferred_area: Optional[str] = Field(default=None)
    bedrooms_needed: Optional[int] = Field(default=None)
    property_type_needed: Optional[str] = Field(
        default=None, sa_column=Column(String, nullable=True)
    )
    notes: Optional[str] = Field(default=None)
    stage: ClientStage = Field(sa_column=Column(String, default="new_lead"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
