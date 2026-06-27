# Phase 02 — Core CRM

**Branch:** `feature/backend/core-crm`
**Dependencies:** `feature/backend/foundation`
**Effort:** ~2–3 hours

## Architectural Role
The data layer that all AI features read from and write to. Properties, clients, and pipeline records are the core entities of the platform — every other feature is built on top of this data.

## Domain Ownership
- Property model + CRUD endpoints (location, price, size, rooms, photos, status)
- Client model + CRUD endpoints (name, contact, budget, preferred area, requirements)
- Sales pipeline model + CRUD endpoints (stage transitions: New Lead → Contacted → Site Visit → Negotiation → Closed)
- Interaction history per client
- All models scoped by `tenant_id`

## Explicit Boundaries
- Does NOT implement AI property matching or recommendations (Phase 03)
- Does NOT send any WhatsApp or email messages (Phase 04)
- Does NOT handle file/photo uploads — photos stored as a JSON array of URLs only
- Does NOT implement natural language search (Phase 03)
- Does NOT implement deal probability scoring (optional/Phase 03)
- Does NOT integrate Google Places — location fields are plain text strings (Phase 04)
- No frontend code, no HTML, no templates

## Core Capabilities

**Property Model + CRUD**
Fields: id, tenant_id, title, description, property_type (apartment/house/plot/commercial),
status (available/sold/rented), price (Decimal), area_sqft, bedrooms, bathrooms,
city, area (society/neighbourhood), address, photos (JSON array of URLs), created_at, updated_at.
Endpoints: POST /properties, GET /properties, GET /properties/{id},
PATCH /properties/{id}, DELETE /properties/{id}.
List endpoint supports query filters: status, property_type, min_price, max_price,
bedrooms, city. All records scoped by tenant_id.

**Client Model + CRUD**
Fields: id, tenant_id, full_name, phone, email (optional), budget_min, budget_max,
preferred_city, preferred_area, bedrooms_needed, property_type_needed, notes,
stage (enum), created_at, updated_at.
Endpoints: POST /clients, GET /clients, GET /clients/{id},
PATCH /clients/{id}, DELETE /clients/{id}.
All records scoped by tenant_id.

**Sales Pipeline — Stage Transitions**
Stage is an enum on the Client model (not a separate table).
Values: new_lead → contacted → site_visit → negotiation → closed.
PATCH /clients/{id}/stage validates the transition is a legal forward move.
No skipping stages (new_lead cannot jump directly to negotiation).

**Interaction History**
InteractionLog model: id, tenant_id, client_id, agent_id (FK to team_members),
type (call/whatsapp/email/visit/note), content (text), created_at.
POST /clients/{id}/interactions → log an interaction for a client.
GET /clients/{id}/interactions → list all interactions for a client (newest first).

**Dashboard Stats**
GET /dashboard → returns: total_properties, active_clients (stage != closed),
pipeline_value (sum of budget_max for non-closed clients), deals_closed (stage=closed count).
All figures scoped to the requesting tenant.

## Service Interactions

**Upstream (consumed from Phase 01):**
- `get_session` — AsyncSession injected into every router
- `get_current_user` — returns authenticated TeamMember with tenant_id
- `tenant_id` extracted from get_current_user, applied to every query and every new record
- `Settings` singleton — no new env vars needed in this phase

**Downstream (what Phase 03 and Phase 04 will consume from here):**
- `Property` model — AI agent reads all properties for a tenant to match against client requirements
- `Client` model — AI agent reads requirements; writes back matched property IDs and stage updates
- `InteractionLog` model — AI agent and WhatsApp/email integrations write interaction records
  so every automated message is visible in the client's history
- `GET /properties` — AI agent uses the filter params to pre-filter before ranking
- `PATCH /clients/{id}/stage` — autonomous deal closer calls this to advance pipeline stage

**Contracts downstream phases must not break:**
- Every Property and Client record must carry tenant_id — no exceptions
- InteractionLog must always reference a valid client_id within the same tenant
- Stage transition validation must remain in the service layer, not be bypassed by AI phase

## Architectural Constraints

- **SQLModel only** — same pattern as Phase 01; no raw SQLAlchemy models

- **Services layer** — create `src/backend/services/` folder; routers call service
  functions, never write DB logic directly in route handlers

- **datetime.utcnow() only** — asyncpg rejects timezone-aware datetimes;
  never use datetime.now(timezone.utc) (same constraint as Phase 01)

- **tenant_id on every write** — always set from get_current_user, never
  trusted from request body; client cannot supply their own tenant_id

- **tenant_id on every read** — every SELECT filters by tenant_id;
  a 404 is returned if a record exists but belongs to a different tenant
  (never 403 — do not leak that the record exists)

- **Decimal for price** — use Python Decimal / SQLModel's Decimal type,
  not float; avoids precision loss on property prices in PKR

- **No pagination library** — plain limit/offset query params on list
  endpoints; keep it simple for the hackathon

- **Stage transitions enforced in service layer** — the router accepts
  the new stage, the service validates the transition; invalid moves return 400

## Definition of Done

**Structural**
- [x] Property, Client, InteractionLog models defined with tenant_id
- [x] All three tables created in Aurora DSQL on server startup (init_db)
- [x] `src/backend/services/` folder created with property, client, interaction services
- [x] All routers registered in main.py

**Behavioral — Properties**
- [x] POST /properties → creates property scoped to tenant, returns created record
- [x] GET /properties → lists only tenant's properties; filters (status, property_type,
      min_price, max_price, bedrooms, city) work correctly
- [x] GET /properties/{id} → returns property or 404 (even if id exists under different tenant)
- [x] PATCH /properties/{id} → updates allowed fields, returns updated record
- [x] DELETE /properties/{id} → soft-deletes or hard-deletes, returns 204

**Behavioral — Clients**
- [x] POST /clients → creates client scoped to tenant
- [x] GET /clients → lists only tenant's clients
- [x] GET /clients/{id} → returns client or 404
- [x] PATCH /clients/{id} → updates client fields
- [x] PATCH /clients/{id}/stage → advances stage by one valid step; invalid transition returns 400
- [x] DELETE /clients/{id} → deletes client and their interaction logs

**Behavioral — Interactions**
- [x] POST /clients/{id}/interactions → logs interaction under correct tenant + client
- [x] GET /clients/{id}/interactions → returns interactions newest-first

**Behavioral — Dashboard**
- [x] GET /dashboard → returns total_properties, active_clients,
      pipeline_value, deals_closed — all scoped to requesting tenant

**Isolation**
- [x] Property/client created under Tenant A returns 404 when queried with Tenant B's JWT

## Rollback Criteria

- New models fail to create tables on startup → drop the three new tables manually
  and re-run; no prod data exists yet so this is safe

- Tenant isolation broken on any endpoint (Tenant B sees Tenant A's records) →
  stop immediately, do not proceed to Phase 03; audit every query in services/
  for missing tenant_id filter before continuing

- Stage transition logic missing or bypassed → revert PATCH /clients/{id}/stage
  to return 501 Not Implemented rather than silently accepting invalid transitions

- Price precision errors (floats) → swap Float for Decimal in the Property model
  and re-run migrations before any AI matching work begins in Phase 03
