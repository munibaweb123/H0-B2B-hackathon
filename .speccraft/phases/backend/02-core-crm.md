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
<!-- What this phase does NOT touch -->

## Core Capabilities
<!-- Intent and patterns — not code -->

## Service Interactions
<!-- Upstream: foundation (DB session, auth, tenant middleware) | Downstream: AI agent, integrations -->

## Architectural Constraints
<!-- Phase-specific constraints only -->

## Definition of Done
<!-- Behavioral and structural checkpoints -->

## Rollback Criteria
<!-- If something goes wrong -->
