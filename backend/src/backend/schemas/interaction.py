from datetime import datetime
from uuid import UUID
from sqlmodel import SQLModel
from backend.models.interaction_log import InteractionType


class InteractionCreate(SQLModel):
    type: InteractionType
    content: str


class InteractionResponse(SQLModel):
    id: UUID
    tenant_id: UUID
    client_id: UUID
    agent_id: UUID
    type: InteractionType
    content: str
    created_at: datetime
