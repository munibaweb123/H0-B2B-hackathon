from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class SlotCreate(BaseModel):
    slot_datetime: datetime


class SlotResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    agent_id: UUID
    slot_datetime: datetime
    is_booked: bool
    booked_by_client_id: Optional[UUID]
    created_at: datetime
