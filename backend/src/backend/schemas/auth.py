from uuid import UUID
from pydantic import BaseModel, EmailStr
from backend.models.team_member import Role


class SignupRequest(BaseModel):
    agency_name: str
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class InviteRequest(BaseModel):
    email: EmailStr


class AcceptInviteRequest(BaseModel):
    token: str
    full_name: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    email: str
    full_name: str
    role: Role
