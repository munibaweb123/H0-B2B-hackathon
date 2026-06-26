from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4
from typing import Optional
from sqlmodel import Field, SQLModel


class Role(str, Enum):
    owner = "owner"
    agent = "agent"


class TeamMember(SQLModel, table=True):
    __tablename__ = "team_members"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True, foreign_key="agencies.id")
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    role: Role = Field(default=Role.agent)
    invite_token: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
