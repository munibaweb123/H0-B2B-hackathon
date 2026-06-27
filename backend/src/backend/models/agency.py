from datetime import datetime
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class Agency(SQLModel, table=True):
    __tablename__ = "agencies"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    slug: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
