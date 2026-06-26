from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, String
from sqlmodel import Field, SQLModel


class CallLog(SQLModel, table=True):
    __tablename__ = "call_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID
    direction: str = Field(sa_column=Column(String))  # incoming | outgoing
    status: str = Field(sa_column=Column(String))      # answered | missed | failed | completed
    caller_number: str = Field(sa_column=Column(String))
    callee_number: str = Field(sa_column=Column(String))
    meta_call_id: str = Field(sa_column=Column(String))
    transcript: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))
    started_at: Optional[datetime] = Field(default=None)
    ended_at: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
