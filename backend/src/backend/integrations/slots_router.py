from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from backend.core.auth import get_current_user
from backend.core.database import get_session
from backend.models.site_visit_slot import SiteVisitSlot
from backend.schemas.slot import SlotCreate, SlotResponse
from backend.services.client_service import get_client

router = APIRouter(tags=["slots"])


@router.post("/slots", response_model=SlotResponse)
async def create_slot(
    data: SlotCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    slot = SiteVisitSlot(
        tenant_id=current_user.tenant_id,
        agent_id=current_user.id,
        slot_datetime=data.slot_datetime,
    )
    session.add(slot)
    await session.commit()
    await session.refresh(slot)
    return slot


@router.get("/slots", response_model=list[SlotResponse])
async def list_slots(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await session.exec(
        select(SiteVisitSlot)
        .where(SiteVisitSlot.tenant_id == current_user.tenant_id)
        .order_by(SiteVisitSlot.slot_datetime)
    )
    return list(result.all())


@router.post("/slots/{slot_id}/book")
async def book_slot(
    slot_id: UUID,
    client_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await session.exec(
        select(SiteVisitSlot).where(
            SiteVisitSlot.id == slot_id,
            SiteVisitSlot.tenant_id == current_user.tenant_id,
        )
    )
    slot = result.first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(status_code=409, detail="Slot already booked")

    # Verify the client belongs to this tenant
    await get_client(client_id, current_user.tenant_id, session)

    slot.is_booked = True
    slot.booked_by_client_id = client_id
    session.add(slot)
    await session.commit()
    await session.refresh(slot)
    return slot
