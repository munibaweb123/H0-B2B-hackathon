from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy import select as sa_select
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.client import Client, ClientStage
from backend.models.property import Property
from backend.models.team_member import TeamMember

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def dashboard(
    current_user: TeamMember = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    tid = current_user.tenant_id

    total_properties = (await session.execute(
        sa_select(func.count(Property.id)).where(Property.tenant_id == tid)
    )).scalar() or 0

    active_clients = (await session.execute(
        sa_select(func.count(Client.id)).where(
            Client.tenant_id == tid,
            Client.stage != ClientStage.closed,
        )
    )).scalar() or 0

    pipeline_value = (await session.execute(
        sa_select(func.sum(Client.budget_max)).where(
            Client.tenant_id == tid,
            Client.stage != ClientStage.closed,
        )
    )).scalar() or 0

    deals_closed = (await session.execute(
        sa_select(func.count(Client.id)).where(
            Client.tenant_id == tid,
            Client.stage == ClientStage.closed,
        )
    )).scalar() or 0

    return {
        "total_properties": total_properties,
        "active_clients": active_clients,
        "pipeline_value": float(pipeline_value),
        "deals_closed": deals_closed,
    }
