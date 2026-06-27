from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4
from typing import Optional
from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class Role(str, Enum):
    owner = "owner"
    agent = "agent"


class TeamMember(SQLModel, table=True):
    __tablename__ = "team_members"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    email: str
    hashed_password: str
    full_name: str
    role: Role = Field(default=Role.agent, sa_column=Column(String, default="agent"))
    invite_token: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
