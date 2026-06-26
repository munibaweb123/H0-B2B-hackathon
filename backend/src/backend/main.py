from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import init_db

# Import all models so SQLModel.metadata picks them up before create_all
import backend.models.agency  # noqa: F401
import backend.models.team_member  # noqa: F401
import backend.models.property  # noqa: F401
import backend.models.client  # noqa: F401
import backend.models.interaction_log  # noqa: F401
import backend.models.site_visit_slot  # noqa: F401
import backend.models.call_log  # noqa: F401

from backend.routers import auth
from backend.routers import properties, clients, dashboard
from backend.ai.router import router as ai_router
from backend.integrations.places_router import router as places_router
from backend.integrations.whatsapp_router import router as whatsapp_router
from backend.integrations.deal_closer_router import router as deal_closer_router
from backend.integrations.email_router import router as email_router
from backend.integrations.slots_router import router as slots_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="PropFlow AI",
    description="AI-powered real estate agency management platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(clients.router)
app.include_router(dashboard.router)
app.include_router(ai_router)
app.include_router(places_router)
app.include_router(whatsapp_router)
app.include_router(deal_closer_router)
app.include_router(email_router)
app.include_router(slots_router)

# pywa_async registers GET+POST /whatsapp/webhook on the app directly
# Must happen after app is created and routers are registered
from backend.integrations.whatsapp import init_whatsapp
from backend.integrations.whatsapp_handlers import register_handlers
from backend.integrations.call_handlers import register_call_handlers

_wa = init_whatsapp(app)
register_handlers(_wa)
register_call_handlers(_wa)


@app.get("/health")
async def health():
    return {"status": "ok"}
