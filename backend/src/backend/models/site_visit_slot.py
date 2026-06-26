from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class SiteVisitSlot(SQLModel, table=True):
    __tablename__ = "site_visit_slots"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    agent_id: UUID
    slot_datetime: datetime
    is_booked: bool = Field(default=False)
    booked_by_client_id: Optional[UUID] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
