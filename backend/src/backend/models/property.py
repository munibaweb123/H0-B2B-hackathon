from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, Any
from uuid import UUID, uuid4
from sqlalchemy import Column, Numeric, String
from sqlalchemy.types import JSON
from sqlmodel import Field, SQLModel


class PropertyType(str, Enum):
    apartment = "apartment"
    house = "house"
    plot = "plot"
    commercial = "commercial"


class PropertyStatus(str, Enum):
    available = "available"
    sold = "sold"
    rented = "rented"


class Property(SQLModel, table=True):
    __tablename__ = "properties"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    title: str
    description: Optional[str] = Field(default=None)
    property_type: PropertyType = Field(sa_column=Column(String))
    status: PropertyStatus = Field(sa_column=Column(String, default="available"))
    price: Decimal = Field(sa_column=Column(Numeric(15, 2)))
    area_sqft: Optional[float] = Field(default=None)
    bedrooms: Optional[int] = Field(default=None)
    bathrooms: Optional[int] = Field(default=None)
    city: str
    area: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)
    photos: Optional[Any] = Field(default=None, sa_column=Column(JSON, nullable=True))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
