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

from backend.routers import auth
from backend.routers import properties, clients, dashboard


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


@app.get("/health")
async def health():
    return {"status": "ok"}
