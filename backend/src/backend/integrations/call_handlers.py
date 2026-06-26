from datetime import datetime
from uuid import uuid4

from pywa_async import WhatsApp
from pywa_async.types.calls import (
    CallConnect,
    CallPermissionUpdate,
    CallStatus,
    CallTerminate,
    SessionDescription,
)
from sqlmodel import select

from backend.core.database import AsyncSessionLocal
from backend.integrations.call_media import CallSession, active_sessions
from backend.models.agency import Agency
from backend.models.call_log import CallLog


async def on_call_connect(client: WhatsApp, call: CallConnect) -> None:
    phone_id = call.metadata.phone_number_id

    # Only handle incoming calls for now
    if call.direction.value != "USER_INITIATED":
        return

    if call.session is None:
        await client.reject_call(call_id=call.id, phone_id=phone_id)
        return

    session = CallSession()
    try:
        answer_sdp = await session.build_answer(call.session.sdp)
    except Exception:
        await client.reject_call(call_id=call.id, phone_id=phone_id)
        return

    await client.accept_call(
        call_id=call.id,
        sdp=SessionDescription(sdp_type="answer", sdp=answer_sdp),
        phone_id=phone_id,
    )
    await session.start()
    active_sessions[call.id] = session

    async with AsyncSessionLocal() as db:
        agency_result = await db.exec(select(Agency).limit(1))
        agency = agency_result.first()
        if agency:
            db.add(CallLog(
                id=uuid4(),
                tenant_id=agency.id,
                direction="incoming",
                status="answered",
                caller_number=call.from_user.wa_id,
                callee_number=call.metadata.display_phone_number or "",
                meta_call_id=call.id,
                started_at=datetime.utcnow(),
            ))
            await db.commit()


async def on_call_terminate(client: WhatsApp, terminate: CallTerminate) -> None:
    session = active_sessions.pop(terminate.id, None)
    transcript: str | None = None

    if session is not None:
        await session.stop()
        transcript = session.transcript()

    async with AsyncSessionLocal() as db:
        log_result = await db.exec(
            select(CallLog).where(CallLog.meta_call_id == terminate.id)
        )
        log = log_result.first()
        if log:
            log.status = "completed" if terminate.status.value == "COMPLETED" else "failed"
            log.ended_at = terminate.end_time
            log.duration_seconds = terminate.duration
            log.transcript = transcript
            await db.commit()


async def on_call_status(client: WhatsApp, status: CallStatus) -> None:
    pass  # Only outgoing calls generate status events — not needed for incoming


async def on_call_permission_update(client: WhatsApp, update: CallPermissionUpdate) -> None:
    pass


def register_call_handlers(wa: WhatsApp) -> None:
    from pywa_async.handlers import (
        CallConnectHandler,
        CallPermissionUpdateHandler,
        CallStatusHandler,
        CallTerminateHandler,
    )
    wa.add_handlers(
        CallConnectHandler(on_call_connect),
        CallStatusHandler(on_call_status),
        CallTerminateHandler(on_call_terminate),
        CallPermissionUpdateHandler(on_call_permission_update),
    )
