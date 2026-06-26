# Project

## Scenario: Hackathon
**Duration:** Hours to 1 day
**Priority:** Ship a working demo. Speed over perfection.

---

## Working Mode
Before making any technical decision (database, framework, pattern, library, architecture choice),
present 2-3 options with one-line trade-offs and wait for confirmation before implementing.
Never pick a stack component without asking first.

---

## Tech Stack
- **Frontend:** Next.js (scaffolded via v0.dev)
- **Backend:** Python, FastAPI (`uv init backend --package`), built with Claude Code
- **AI Framework:** OpenAI Agents SDK (`openai-agents`) with OpenAI key
- **Database:** AWS RDS PostgreSQL (multi-tenant via `tenant_id` on all tables)
- **Voice Transcription:** OpenAI Whisper API (same key, supports Urdu, ~$0.006/min)
- **WhatsApp:** Meta Business API — testing credentials (sandbox, sufficient for demo)
- **Email:** Resend (free tier, 100 emails/day, Python SDK)
- **Location Auto-fill:** Google Places API (free $200/month credit, ~200 requests for hackathon)
- **Site Visit Booking:** In-app slot picker (no external calendar integration needed for demo)
- **Web Search:** Tavily API (plugged in as an OpenAI Agents SDK tool)

---

## Conventions

### Established in Phase 01 — Foundation

**Folder structure**
```
backend/src/backend/
├── core/       # config, database, auth
├── models/     # SQLModel table classes
├── routers/    # FastAPI route handlers (thin — call services)
├── schemas/    # Pydantic request/response models
└── main.py     # App entry point, lifespan, middleware
```

**Patterns**
- All models inherit `SQLModel, table=True` — no raw SQLAlchemy models
- Every model has `tenant_id: UUID` — no exceptions
- Routers are thin: they validate input, call a service or query directly, return response
- `get_session` and `get_current_user` are FastAPI dependencies injected into every protected router
- All secrets loaded via `Settings` (pydantic-settings) from `.env` at project root
- `uv run uvicorn backend.main:app` is the server start command, run from `backend/` directory

**Do not:**
- Mix raw SQLAlchemy with SQLModel
- Hardcode any secret or config value
- Use `datetime.now(timezone.utc)` — asyncpg expects naive datetimes, use `datetime.utcnow()`
- Use `passlib` — incompatible with bcrypt 4.x; use `bcrypt` directly

**Password hashing**
Use `bcrypt.hashpw` / `bcrypt.checkpw` directly (passlib removed due to bcrypt 4.x incompatibility)

**WhatsApp**
Using `pywa` library. Credentials: access token, verify token, app ID/secret, phone number ID, business account ID, callback URL, API version — all in `.env`

---

## Constraints
- Hackathon build — hours to 1 day, demo must work end-to-end
- Multi-tenant: each agency's data is fully isolated
- WhatsApp integration via Meta Business API (assumed access in place)
- AI replies in same language as input; Urdu script → Roman Urdu reply
- Location auto-fill required on all property and client forms
- No payment/billing system, no mobile app, no raw scraping

---

## Product Requirements

### Core Features (In Scope)
1. Agency workspace & team management (multi-tenant, isolated)
2. Property listings management (CRUD + photo + location auto-fill)
3. Client management (profile, requirements, interaction history)
4. AI property matching (auto-rank listings against client requirements)
5. Sales pipeline — Kanban: New Lead → Contacted → Site Visit → Negotiation → Closed
6. Automated follow-up messages (AI-written, WhatsApp + email, agent reviews before sending)
7. Autonomous deal closer (new listing → AI pitches matched clients → books site visit → notifies agent)
8. AI chat interface (conversational access to all agency data and actions)
9. WhatsApp as primary interface (forward messages/voice notes → PropFlow acts)
10. Voice note understanding (transcribe + extract client requirements)
11. Multilingual AI — English in → English out; Urdu script in → Roman Urdu out; voice note → Roman Urdu
12. Email automation (AI-written, triggered post-visit / no-contact / new match)
13. Agency dashboard (listings count, active clients, pipeline value, deals closed)
14. Location auto-fill (suggest Pakistani housing societies and cities as agent types)
15. Smart natural language search ("3-bed DHA Lahore under 80 lakh" → filtered results)

### Optional / Stretch (Build if time allows)
16. AI web search via Tavily (hunt matching properties on Zameen, OLX in real time)
17. Deal probability score (engagement-based likelihood to close this week)

### Out of Scope
- Raw web scraping bots
- Urdu real-time voice input (speech-to-text fine-tuned model)
- Payment & billing
- Mobile application

---

## User Flows

### Agency Onboarding
Sign up → workspace created → invite team members → assign roles

### Property Listing
Agent adds property → fills details + location auto-fill + photos → listed instantly

### Client Intake
Agent adds client → saves requirements → AI immediately shows ranked matching properties

### Autonomous Deal Close
New property listed → AI identifies matched clients → sends personalized WhatsApp pitches → client replies interest → AI offers visit slots → client picks slot → agent calendar updated → agent shows up

### WhatsApp Flow
Agent forwards client message/voice note to PropFlow WhatsApp → AI reads/transcribes → creates/updates client profile → agent continues on WhatsApp

### AI Chat
Agent opens chat → types question in English or Urdu → PropFlow answers based on agency's own data → agent takes action

---

## Success Criteria
- Live demo works end-to-end (at least: add property → AI matches clients → sends WhatsApp pitch)
- AI chat responds accurately using agency data
- Multi-tenant isolation verifiable
- Dashboard shows real numbers from seeded data
- Judges can see autonomous deal closer fire in real time
