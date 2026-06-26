# Phase 04 — Integrations

**Branch:** `feature/backend/integrations`
**Dependencies:** `feature/backend/ai-agent`
**Effort:** ~2–3 hours

## Architectural Role
Connects PropFlow to the external world. Wires up WhatsApp (inbound webhook + outbound messaging), voice note transcription, email automation, and the autonomous deal closer trigger. Also delivers the agency dashboard aggregations and Google Places proxy for location auto-fill.

## Domain Ownership
- Meta WhatsApp Business API — inbound webhook (receive messages + voice notes) and outbound messaging (send pitches, reply to clients)
- OpenAI Whisper API — transcribe voice notes forwarded via WhatsApp
- Resend — send automated follow-up emails (post-visit, no-contact, new match)
- Autonomous deal closer — trigger on new property listed → AI matches clients → sends WhatsApp pitches → handles interest reply → books site visit slot → notifies agent
- In-app slot picker — agent sets available times, client picks, agent notified
- Google Places API proxy — location autocomplete endpoint for frontend forms

## Explicit Boundaries

- Does NOT modify the AI layer — calls existing /ai/* endpoints, does not touch
  ai/, agent.py, or tools.py

- Does NOT build any frontend UI — delivers backend endpoints and webhook handlers
  that the frontend and WhatsApp will call

- Dashboard aggregations already delivered in Phase 02 (dashboard.py router) —
  do not re-implement here

- Does NOT implement a state machine for multi-turn WhatsApp conversations —
  all inbound messages (including deal-closer replies) are routed to /ai/chat;
  the AI handles conversational context

- Does NOT sync with Google Calendar or any external calendar — in-app slot
  picker only (slots stored in DB)

- Does NOT handle WhatsApp Business API approval or account setup —
  credentials already configured in .env from Phase 01

- Does NOT implement real-time Urdu audio transcription with fine-tuned models —
  standard Whisper API only; it already supports Urdu natively

- Does NOT implement idempotent pitch tracking across restarts — for the
  hackathon demo, one triggered run pitches all matched clients once

## Core Capabilities

**Google Places Proxy**
GET /places/autocomplete?input=<text> — proxies to Google Places API with
Pakistani location bias. Frontend never calls Google directly. Returns a list
of {description, place_id} suggestions. Falls back to empty list if
GOOGLE_PLACES_API_KEY is absent.

**WhatsApp Inbound Webhook**
GET /whatsapp/webhook — responds to Meta's hub.challenge verification.
POST /whatsapp/webhook — pywa parses the payload and routes:
  - Text message → detect_language() → run propflow_agent via Runner.run() →
    reply with AI response via outbound WhatsApp
  - Voice note → download audio from Meta media URL (Bearer token required) →
    Whisper transcription → treat transcript as text → same AI flow as above
  - Any other message type → ignore silently

**Voice Note Transcription**
Internal async function `transcribe_voice_note(media_id)`:
1. GET Meta media URL: `/{media_id}` with Authorization: Bearer <access_token>
2. Download audio bytes
3. `openai.audio.transcriptions.create(model="whisper-1", file=audio_bytes)`
4. Return transcript string
Called exclusively by the webhook handler — not a standalone endpoint.

**Outbound WhatsApp Messaging**
POST /whatsapp/send {to, message} — sends a text message via pywa client.
Internal `send_whatsapp(to, message)` helper used by deal closer and
email/followup flows. Logs the sent message as an interaction in the DB.

**Autonomous Deal Closer**
POST /deal-closer/{property_id} — trigger endpoint (manual for demo,
auto-called from property creation in production).

Flow:
1. Fetch property for the tenant (404 if not found or wrong tenant)
2. List all clients for the tenant
3. Quick Python filter: budget_max >= property.price × 0.85 AND
   (preferred_city matches property.city OR preferred_city is null) AND
   (bedrooms_needed == property.bedrooms OR bedrooms_needed is null)
4. Take up to 5 matched clients
5. For each: call ai/draft-followup logic directly (not via HTTP — call the
   service function) to get a personalized WhatsApp pitch
6. Send pitch via send_whatsapp()
7. Log an interaction (type=whatsapp, content=pitch text) per client
8. Return {property_id, clients_pitched: [{client_id, name, message_preview}]}

**Resend Email**
POST /email/followup/{client_id} — calls ai draft-followup service (channel=email),
sends the drafted text via Resend SDK (`resend.Emails.send()`).
Falls back gracefully if RESEND_API_KEY is absent.

**Site Visit Slots**
New model: SiteVisitSlot (id, tenant_id, agent_id, slot_datetime, is_booked,
booked_by_client_id nullable). All Aurora DSQL constraints apply — no FK, no
index, no unique, Column(String) for any enum fields.
- POST /slots — agent creates an available slot
- GET /slots — list all slots for tenant (available + booked)
- POST /slots/{slot_id}/book — book a slot for a client; sets is_booked=True
  and booked_by_client_id; returns 409 if already booked

## Service Interactions

**Upstream (consumed from Phase 01 + 02 + 03):**

From Phase 01 (Foundation):
- `get_session` — AsyncSession for all DB operations
- `get_current_user` — tenant_id for all protected endpoints
- `Settings` — WHATSAPP_*, OPENAI_API_KEY, RESEND_API_KEY,
  GOOGLE_PLACES_API_KEY, TAVILY_API_KEY all loaded from .env

From Phase 02 (Core CRM):
- `property_service.get_property()` — deal closer fetches the newly listed property
- `property_service.list_properties()` — used as quick pre-filter in deal closer
- `client_service.list_clients()` — deal closer iterates all tenant clients
- `client_service.get_client()` — slot booking verifies client belongs to tenant
- `interaction_service.log_interaction()` — WhatsApp sends and deal closer pitches
  logged as interactions (type=whatsapp or type=email)

From Phase 03 (AI Agent):
- `detect_language()` — webhook handler calls this before running the agent
- `propflow_agent` + `Runner.run()` — webhook routes inbound messages through
  the agent; deal closer calls runner directly for pitch drafting
- `AgentContext` — webhook and deal closer both construct this with tenant_id +
  session + language before every Runner.run() call

**Downstream (what the frontend will consume from here):**
- GET /places/autocomplete — called by property and client forms as user types
- POST /deal-closer/{property_id} — called from the "Trigger Deal Closer" button
  on the property detail page
- POST /slots, GET /slots, POST /slots/{slot_id}/book — called by the site visit
  scheduling UI
- POST /email/followup/{client_id} — called from client detail page "Send Email"
  button
- POST /whatsapp/send — called from client detail page "Send WhatsApp" button
- POST /whatsapp/webhook — called by Meta; not frontend-facing

**Contracts downstream phases must not break:**
- GET /places/autocomplete returns [{description: str, place_id: str}]
- POST /deal-closer/{property_id} returns
  {property_id, clients_pitched: [{client_id, name, message_preview}]}
- POST /slots/{slot_id}/book returns 409 if already booked (not 400)

## Architectural Constraints

- **pywa client is a module-level singleton** — initialise `WhatsApp(...)` once
  at import time in `src/backend/integrations/whatsapp.py`; do not recreate
  per request. pywa registers its own GET/POST webhook routes on the FastAPI
  app — pass the app instance during init, not per request.

- **Webhook handler has no authenticated user** — WhatsApp posts arrive without
  a JWT. Identify the tenant by phone number: look up the TeamMember whose
  WHATSAPP_PHONE_NUMBER_ID matches the incoming `phone_number_id` field, then
  use that member's tenant_id. For the hackathon (single agency demo), reading
  tenant_id from Settings is acceptable.

- **Media download is a sync HTTP call — wrap in asyncio.to_thread** — Meta
  media download and Whisper transcription use the requests/httpx library
  synchronously; wrap both in `asyncio.to_thread()` to avoid blocking the event
  loop.

- **Deal closer is synchronous per trigger call** — do not spawn background
  tasks or Celery workers; run the full pitch loop inline and return the result.
  Acceptable latency for a hackathon demo trigger.

- **Resend SDK is synchronous** — wrap `resend.Emails.send()` in
  `asyncio.to_thread()`; do not call it directly in an async function.

- **New integration files go in `src/backend/integrations/`** — new sub-package
  parallel to `ai/`; not inside routers/ or services/. Routers for integration
  endpoints live in `integrations/<name>_router.py`.

- **SiteVisitSlot model follows all Phase 02 Aurora DSQL rules** — no FK, no
  index=True, no unique=True, is_booked stored as Boolean (native DSQL type,
  no issue), slot_datetime stored as datetime (naive, utcnow()).

- **Google Places API call is sync (requests) — wrap in asyncio.to_thread**

- **Never log raw WhatsApp payloads to stdout** — they may contain PII
  (client phone numbers, message content); use minimal logging.

- **Place all integration routers under prefix `/` (not `/api/`)** — consistent
  with existing routers from Phase 01/02.

## Definition of Done

**Structural**
- [ ] `src/backend/integrations/` package created with __init__.py
- [ ] whatsapp.py — pywa client singleton + send_whatsapp() helper
- [ ] whisper.py — transcribe_voice_note() async function
- [ ] places_router.py — GET /places/autocomplete
- [ ] whatsapp_router.py — GET+POST /whatsapp/webhook, POST /whatsapp/send
- [ ] deal_closer_router.py — POST /deal-closer/{property_id}
- [ ] email_router.py — POST /email/followup/{client_id}
- [ ] slots_router.py — POST /slots, GET /slots, POST /slots/{slot_id}/book
- [ ] SiteVisitSlot model in models/site_visit_slot.py (Aurora DSQL compliant)
- [ ] All integration routers registered in main.py

**Behavioral — Google Places**
- [ ] GET /places/autocomplete?input=DHA returns location suggestions
- [ ] Returns [] (not 500) when GOOGLE_PLACES_API_KEY is absent

**Behavioral — WhatsApp Webhook**
- [ ] GET /whatsapp/webhook responds to Meta verification challenge
- [ ] POST /whatsapp/webhook receives a text message and replies via WhatsApp
- [ ] POST /whatsapp/webhook receives a voice note, transcribes it via Whisper,
      and replies with AI-generated response

**Behavioral — Outbound WhatsApp**
- [ ] POST /whatsapp/send delivers a message to a phone number
- [ ] Sent message is logged as an interaction in the DB

**Behavioral — Autonomous Deal Closer**
- [ ] POST /deal-closer/{property_id} returns list of clients pitched
- [ ] Only pitches clients whose budget/city/bedrooms roughly match the property
- [ ] Each pitch is a personalised AI-generated message (not a template)
- [ ] Each pitch is sent via WhatsApp and logged as an interaction
- [ ] 404 if property not found or belongs to another tenant

**Behavioral — Email**
- [ ] POST /email/followup/{client_id} sends an AI-drafted email via Resend
- [ ] Returns graceful message (not 500) if RESEND_API_KEY is absent

**Behavioral — Slots**
- [ ] POST /slots creates a slot; GET /slots lists them for the tenant
- [ ] POST /slots/{slot_id}/book books the slot and returns 409 if already booked

**Isolation**
- [ ] Deal closer only pitches clients belonging to the same tenant as the property
- [ ] Slot booking verifies client belongs to the tenant before booking

## Rollback Criteria

- pywa client fails to initialise (wrong credentials) → server fails to start;
  check WHATSAPP_ACCESS_TOKEN, WHATSAPP_APP_ID, WHATSAPP_APP_SECRET in .env

- Meta webhook verification fails (GET /whatsapp/webhook returns 403) →
  WHATSAPP_VERIFY_TOKEN in .env does not match what was registered in the
  Meta Developer Console; fix the token, do not change the verification logic

- Whisper transcription returns garbled text for Urdu voice notes →
  acceptable for demo; do not switch models mid-hackathon — Whisper-1
  handles Urdu well enough

- Deal closer sends pitches to wrong tenant's clients → halt immediately;
  audit the tenant_id filter in list_clients() call inside deal_closer_router

- Resend email bounces or RESEND_API_KEY missing → log the error, return
  {sent: false, reason: "..."} — do not raise 500; email is non-critical for demo

- Google Places returns no results for Pakistani cities → check API key
  restrictions in Google Cloud Console; for demo, autocomplete can be skipped
  and city typed manually — do not block on this

- SiteVisitSlot table creation fails on DSQL → apply same try/except
  "already exists" pattern from create_tables(); never use checkfirst=True
