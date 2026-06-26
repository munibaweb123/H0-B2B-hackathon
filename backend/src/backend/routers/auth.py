import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.core.database import get_session
from backend.core.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.models.agency import Agency
from backend.models.team_member import TeamMember, Role
from backend.schemas.auth import (
    SignupRequest, LoginRequest, InviteRequest,
    AcceptInviteRequest, TokenResponse, UserResponse,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def slugify(name: str) -> str:
    return name.lower().strip().replace(" ", "-")


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, session: AsyncSession = Depends(get_session)):
    existing = (await session.exec(select(TeamMember).where(TeamMember.email == body.email))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    slug = slugify(body.agency_name)
    slug_exists = (await session.exec(select(Agency).where(Agency.slug == slug))).first()
    if slug_exists:
        slug = f"{slug}-{secrets.token_hex(3)}"

    agency = Agency(name=body.agency_name, slug=slug)
    session.add(agency)
    await session.flush()

    owner = TeamMember(
        tenant_id=agency.id,
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=Role.owner,
    )
    session.add(owner)
    await session.commit()
    await session.refresh(owner)

    token = create_access_token(user_id=owner.id, tenant_id=agency.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)):
    user = (await session.exec(select(TeamMember).where(TeamMember.email == body.email))).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user_id=user.id, tenant_id=user.tenant_id)
    return TokenResponse(access_token=token)


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite(
    body: InviteRequest,
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if current_user.role != Role.owner:
        raise HTTPException(status_code=403, detail="Only owners can invite agents")

    existing = (await session.exec(select(TeamMember).where(TeamMember.email == body.email))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    invite_token = secrets.token_urlsafe(32)
    placeholder = TeamMember(
        tenant_id=current_user.tenant_id,
        email=body.email,
        full_name="",
        hashed_password="",
        role=Role.agent,
        invite_token=invite_token,
    )
    session.add(placeholder)
    await session.commit()
    return {"invite_token": invite_token}


@router.post("/accept-invite", response_model=TokenResponse)
async def accept_invite(body: AcceptInviteRequest, session: AsyncSession = Depends(get_session)):
    member = (await session.exec(
        select(TeamMember).where(TeamMember.invite_token == body.token)
    )).first()
    if not member:
        raise HTTPException(status_code=404, detail="Invalid or expired invite token")

    member.full_name = body.full_name
    member.hashed_password = hash_password(body.password)
    member.invite_token = None
    session.add(member)
    await session.commit()
    await session.refresh(member)

    token = create_access_token(user_id=member.id, tenant_id=member.tenant_id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: TeamMember = Depends(get_current_user)):
    return current_user
