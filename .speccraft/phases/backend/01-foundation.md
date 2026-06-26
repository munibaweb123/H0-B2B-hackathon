# Phase 01 — Foundation

**Branch:** `feature/backend/foundation`
**Dependencies:** none
**Effort:** ~2–3 hours

## Architectural Role
The base layer every other phase depends on. Establishes the FastAPI app structure, database connection, multi-tenant isolation pattern, and authentication. Nothing else can be built without this.

## Domain Ownership
- FastAPI app entry point and middleware
- Database session and connection (AWS RDS PostgreSQL)
- Multi-tenant foundation (`tenant_id` on all models)
- Agency model + signup/login
- Team member invite and roles (owner, agent)
- JWT authentication and tenant resolution middleware
- Environment config and secrets loading

## Explicit Boundaries
- Does NOT define any business models beyond Agency and TeamMember
- Does NOT implement any property, client, or pipeline logic (Phase 02)
- Does NOT touch any AI or LLM calls (Phase 03)
- Does NOT integrate any external APIs — no WhatsApp, Resend, Whisper, Tavily, Google Places (Phase 04)
- Does NOT implement any business logic beyond authentication and tenant resolution
- No frontend code, no HTML, no templates

## Core Capabilities

**App Structure**
FastAPI app initialized via `uv init backend --package`. Entry point at
`src/backend/main.py`. Folders: `core/`, `models/`, `routers/`, `schemas/`.
Each area (auth, tenant, db) lives in `core/`.

**Database**
SQLModel (sits on top of SQLAlchemy) for models + async sessions.
Single `DATABASE_URL` env var pointing to AWS RDS PostgreSQL.
`core/database.py` owns engine creation and `get_session` dependency.

**Multi-Tenant Pattern**
Every database model carries a `tenant_id: UUID` column.
A middleware resolves the current tenant from the JWT on every request
and injects it into request state. All queries filter by `tenant_id` —
no query ever crosses tenant boundaries.

**Authentication**
JWT-based. Signup creates an Agency + Owner TeamMember in one transaction.
Login returns an access token. Token payload carries `user_id` and `tenant_id`.
`core/auth.py` owns token creation and validation.
`core/tenant.py` owns tenant resolution middleware.

**Agency & Team Management**
Agency model: name, slug, created_at.
TeamMember model: user_id, agency_id (= tenant_id), role (owner | agent),
email, hashed_password.
Invite flow: owner generates an invite token → invitee signs up with it
→ TeamMember created under same tenant.

**Config**
All secrets loaded from `.env` at project root via `pydantic-settings`.
Single `Settings` singleton imported across the app.

## Service Interactions

**Upstream:** None — this is the root phase.

**Downstream (what every other phase consumes from here):**
- `get_session` — FastAPI dependency injected into all routers for DB access
- `get_current_user` — FastAPI dependency that validates JWT and returns
  the authenticated TeamMember with their `tenant_id`
- `current_tenant_id` — extracted from `get_current_user`, passed into
  every query to enforce tenant isolation
- `Settings` singleton — imported by any module that needs env vars
  (OpenAI key, WhatsApp token, Resend key, etc.)
- `Agency` + `TeamMember` models — referenced by downstream models
  via foreign key to `tenant_id`

**Contracts downstream phases must not break:**
- `tenant_id` must be present and trusted on every request
- `get_current_user` must always return a valid TeamMember or raise 401
- No downstream phase bypasses tenant filtering

## Architectural Constraints
- **SQLModel only** — do not mix raw SQLAlchemy models with SQLModel models
  in the same phase. Pick SQLModel and stay consistent so Phase 02 follows
  the same pattern.

- **Async from the start** — use `AsyncSession` and `asyncpg` driver.
  Switching from sync to async later breaks everything downstream.

- **tenant_id is a UUID, never an integer** — avoids enumeration attacks
  and makes tenant IDs safe to expose in JWTs and API responses.

- **Passwords hashed with bcrypt** — never store plain text. Use
  `passlib[bcrypt]`.

- **No business logic in routers** — routers call service functions.
  Service functions own logic and DB writes. Keeps phases testable.

- **One `.env` file at project root, one `Settings` object** — no hardcoded
  secrets anywhere in the codebase, including tests.

- **CORS open during hackathon** — `allow_origins=["*"]` is acceptable
  for demo. Do not spend time locking this down.

## Definition of Done

**Structural**
- [x] `uv init backend --package` project structure in place
- [x] `src/backend/main.py` boots with `uvicorn` without errors
- [x] `core/database.py` connects to RDS and runs migrations on startup
- [x] All models have `tenant_id: UUID` column
- [x] `.env` and `.env.example` live at project root (outside `backend/`),
      loaded by `pydantic-settings` pointing to `../../.env`

**Behavioral**
- [x] `POST /auth/signup` — creates Agency + Owner TeamMember, returns JWT
- [x] `POST /auth/login` — validates credentials, returns JWT
- [x] `POST /auth/invite` — owner generates invite link for a new agent
- [x] `POST /auth/accept-invite` — invitee registers under the same tenant
- [x] `GET /health` — returns `{"status": "ok"}`
- [x] Any request without a valid JWT returns 401
- [x] Any request with a valid JWT only sees data belonging to that tenant

**Isolation check**
- [x] Two agencies signed up → neither can access the other's data
  (verify manually with two different JWTs)

## Rollback Criteria
- RDS connection fails or credentials are wrong → fix `.env` at project root,
  do not proceed to Phase 02 until `GET /health` and DB ping both pass
- Migrations fail on startup → drop and recreate the RDS database,
  re-run — no data exists yet so this is safe
- JWT validation broken (all requests return 401) → check `SECRET_KEY`
  in `.env` and token expiry settings before touching any other code
- Tenant isolation broken (one agency sees another's data) → stop immediately,
  audit the `tenant_id` middleware and all query filters before any
  downstream phase begins — this is the most critical invariant of the system
