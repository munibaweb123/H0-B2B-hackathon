# PropFlow AI — Backend

FastAPI backend for PropFlow AI. Python 3.11, SQLModel, Aurora DSQL, OpenAI Agents SDK.

---

## Running with Docker (recommended)

From the project root (`H0-B2B-hackathon/`):

```bash
# Build and start
docker compose up --build

# Subsequent starts (no rebuild)
docker compose up

# Stop
docker compose down
```

API docs: `http://localhost:8000/docs`

> First startup takes ~22s — Aurora DSQL warms the IAM token before accepting traffic.

---

## Running locally (without Docker)

```bash
# Install dependencies
uv sync

# Start the server
uv run uvicorn backend.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

---

## Expose to WhatsApp (ngrok tunnel)

WhatsApp webhook requires a public HTTPS URL. The project uses a fixed ngrok domain:

```bash
ngrok http --url=aluminic-overfluently-mickie.ngrok-free.app 8000
```

WhatsApp webhook URL (already set in Meta Developer Console):
```
https://aluminic-overfluently-mickie.ngrok-free.app/whatsapp/webhook
```

Keep the tunnel running alongside the server during development.

---

## First-time database setup

Run once to create all tables on Aurora DSQL:

```bash
uv run python -c "import asyncio; from backend.core.database import create_tables; asyncio.run(create_tables())"
```

---

## Environment

`.env` lives in the project root (`../`), not inside `backend/`. Settings are loaded via `pydantic-settings` with `env_file="../.env"`.

---

## Folder structure

```
src/backend/
├── core/           # Config, DB (Aurora DSQL IAM auth), JWT auth
├── models/         # SQLModel table classes
├── routers/        # Auth, properties, clients, dashboard
├── schemas/        # Pydantic request/response models
├── services/       # Business logic layer
├── ai/             # OpenAI Agents SDK — agent, tools, router
├── integrations/   # WhatsApp, Whisper, email, deal closer, slots, Places
└── main.py         # App entry point
```
