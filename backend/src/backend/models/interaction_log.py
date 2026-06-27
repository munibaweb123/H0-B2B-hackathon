from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4
from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class InteractionType(str, Enum):
    call = "call"
    whatsapp = "whatsapp"
    email = "email"
    visit = "visit"
    note = "note"


class InteractionLog(SQLModel, table=True):
    __tablename__ = "interaction_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    client_id: UUID
    agent_id: UUID
    type: InteractionType = Field(sa_column=Column(String))
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
