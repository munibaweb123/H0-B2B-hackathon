import time
import boto3
from sqlalchemy import event
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings

_TOKEN_LIFETIME = 900
_token_cache: dict = {"token": "", "expires_at": 0.0}

# Reuse a single boto3 client — first call initializes SDK (~22s); subsequent are instant
_dsql_client = boto3.client(
    "dsql",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


def _get_auth_token() -> str:
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 60:
        return _token_cache["token"]
    token = _dsql_client.generate_db_connect_admin_auth_token(
        Hostname=settings.DSQL_ENDPOINT,
        Region=settings.AWS_REGION,
        ExpiresIn=_TOKEN_LIFETIME,
    )
    _token_cache["token"] = token
    _token_cache["expires_at"] = now + _TOKEN_LIFETIME
    return token


engine = create_async_engine(
    f"postgresql+asyncpg://admin@{settings.DSQL_ENDPOINT}:5432/postgres",
    echo=False,
    pool_recycle=800,
    connect_args={"ssl": True},
)


@event.listens_for(engine.sync_engine, "do_connect")
def provide_token(dialect, conn_rec, cargs, cparams):
    cparams["password"] = _get_auth_token()


AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_tables():
    """Run once on first deploy. Aurora DSQL: each DDL in its own transaction, no ENUMs/FKs/indexes."""
    for table in SQLModel.metadata.sorted_tables:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(lambda sync_conn, t=table: t.create(sync_conn))
        except Exception as e:
            if "already exists" not in str(e).lower():
                raise


async def init_db():
    from sqlalchemy import text
    # Pre-warm the auth token (first boto3 call is ~22s; this runs before server accepts traffic)
    _get_auth_token()
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
