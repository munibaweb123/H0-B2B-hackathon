from typing import Any
from uuid import UUID
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    tool_calls_made: list[str] = []


class PropertyMatch(BaseModel):
    property_id: str
    score: int
    reason: str


class MatchResponse(BaseModel):
    client_id: str
    matches: list[PropertyMatch]


class DraftFollowupResponse(BaseModel):
    message_text: str
    channel: str


class SearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    results: list[dict[str, Any]]
    summary: str
