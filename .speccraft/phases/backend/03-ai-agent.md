# Phase 03 — AI Agent

**Branch:** `feature/backend/ai-agent`
**Dependencies:** `feature/backend/core-crm`
**Effort:** ~2–3 hours

## Architectural Role
The intelligence layer of PropFlow. Wires up the OpenAI Agents SDK to agency data, enabling property matching, conversational access to agency data, AI-written follow-up messages, natural language property search, and real-time web search via Tavily. Also handles multilingual detection and Roman Urdu responses.

## Domain Ownership
- OpenAI Agents SDK setup and agent definition
- AI property matching (rank listings against client requirements)
- AI chat interface endpoint (conversational queries over agency data)
- AI-generated follow-up message drafting (per client, personalized)
- Natural language property search ("3-bed DHA Lahore under 80 lakh")
- Tavily web search tool (plugged into agent for property hunting)
- Language detection — English in → English out; Urdu script in → Roman Urdu out
- Agent tools: query properties, query clients, query pipeline, search web

## Explicit Boundaries
- Does NOT send any WhatsApp messages or emails — only drafts content (Phase 04 delivers it)
- Does NOT book site visits or update the calendar — only identifies intent and recommends slots
- Does NOT handle voice note transcription — that arrives as plain text from Phase 04
- Does NOT store agent or AI messages in the DB — interaction logging stays in Phase 02 services
- Does NOT implement WhatsApp webhook or message routing (Phase 04)
- Does NOT build the frontend chat UI — only the POST /ai/chat endpoint
- No streaming responses — standard JSON reply is sufficient for the demo

## Core Capabilities

**Agent Setup**
Single OpenAI Agents SDK agent defined in `src/backend/ai/agent.py`.
Agent has access to a set of tools and a system prompt that establishes
its role as PropFlow AI — a real estate assistant for Pakistani agencies.
Agent is stateless per request; conversation history passed in by the caller.

**Tool: query_properties**
Fetches properties from the DB filtered by tenant_id. Accepts optional filters
(city, property_type, bedrooms, min_price, max_price, status). Returns a
structured list the agent can reason over.

**Tool: query_clients**
Fetches clients from the DB for the tenant. Returns name, budget, requirements,
current stage. Agent uses this to find matching leads when a new property is added.

**Tool: search_web**
Tavily API tool — agent calls it when asked to find properties on Zameen/OLX
or when internal listings are insufficient. Returns URLs and snippets.

**AI Property Matching**
POST /ai/match/{client_id} — agent receives client requirements and full
property list, ranks properties by fit (bedrooms, budget, city, type), returns
top matches with a short reason for each. No ML — pure LLM reasoning.

**AI Chat Interface**
POST /ai/chat — accepts {message, history[]} from the authenticated agent.
Detects language: if Urdu script detected → system prompt instructs reply in
Roman Urdu; otherwise reply in English. Passes tenant context (agency name,
stats) so the agent answers questions about the agency's own data.
Returns {reply, tool_calls_made[]}.

**AI Follow-up Message Drafting**
POST /ai/draft-followup/{client_id} — generates a personalized WhatsApp/email
message for a client based on their profile, stage, and last interaction.
Returns {message_text, channel} — not sent, just drafted for agent review.

**Natural Language Property Search**
POST /ai/search — accepts a free-text query ("3-bed DHA Lahore under 80 lakh"),
extracts filters, calls query_properties tool, returns ranked results.
Reuses the agent; no separate NLP pipeline needed.

**Language Detection**
Utility function `detect_language(text)` — checks if input contains Urdu Unicode
range (0600–06FF). Returns "urdu" or "english". Injected into system prompt
to control reply language. No external library needed.

## Service Interactions

**Upstream (consumed from Phase 01 + 02):**
- `get_current_user` — every AI endpoint is protected; tenant_id scopes all DB reads
- `get_session` — AsyncSession for all tool DB queries
- `property_service.list_properties()` — query_properties tool calls this
- `client_service.get_client()` — match and draft-followup endpoints call this
- `client_service.list_clients()` — query_clients tool calls this
- `interaction_service.list_interactions()` — draft-followup reads last interaction
  to personalize the message
- `Settings.OPENAI_API_KEY` — agent SDK authentication
- `Settings.TAVILY_API_KEY` — web search tool authentication

**Downstream (what Phase 04 will consume from here):**
- `POST /ai/match/{client_id}` — autonomous deal closer calls this when a new
  property is listed to find which clients to pitch
- `POST /ai/draft-followup/{client_id}` — WhatsApp/email integration calls this
  to get the message text before sending
- `POST /ai/chat` — frontend chat UI calls this directly
- `detect_language(text)` utility — Phase 04 WhatsApp handler imports this to
  decide reply language before calling the agent

**Contracts downstream phases must not break:**
- /ai/match response must include {client_id, matches: [{property_id, score, reason}]}
- /ai/draft-followup response must include {message_text, channel}
- /ai/chat response must include {reply, tool_calls_made}

## Architectural Constraints

- **OpenAI Agents SDK only** — do not use raw `openai.ChatCompletion` calls;
  all LLM calls go through the Agents SDK so tool use is handled consistently

- **Single agent, multiple entry points** — one agent definition reused across
  match, chat, draft-followup, and search endpoints; avoid creating separate
  agents per feature

- **Agent is stateless** — no server-side conversation memory; caller sends
  history[] on each request; keeps the backend simple and horizontally scalable

- **Tools are async functions** — all tool implementations use async/await and
  call existing service functions; never duplicate DB query logic inside tools

- **tenant_id is always injected** — tools receive tenant_id as a parameter
  injected by the endpoint, never trusted from LLM output; LLM cannot
  cross tenant boundaries by crafting a tool call

- **No streaming** — `Runner.run()` (not stream) for all agent calls; streaming
  adds frontend complexity not worth it for the hackathon demo

- **Tavily tool is optional at runtime** — if TAVILY_API_KEY is empty, the
  search_web tool returns a graceful "web search not configured" message;
  agent continues without it

- **Language detection is pre-LLM** — detect_language() runs before the agent
  call and injects the language instruction into the system prompt; do not ask
  the LLM to detect its own input language

- **Place AI router and agent in `src/backend/ai/`** — new sub-package, not
  inside routers/ or services/; keeps AI concerns isolated

## Definition of Done

**Structural**
- [x] `src/backend/ai/` package created with `agent.py`, `tools.py`, `router.py`
- [x] Agent defined with system prompt, tools registered
- [x] `detect_language()` utility implemented
- [x] AI router registered in `main.py`

**Behavioral — Property Matching**
- [x] POST /ai/match/{client_id} → returns ranked list of matching properties
      with score and reason for each; empty list if no properties exist
- [x] Matching respects tenant isolation — only tenant's own properties ranked

**Behavioral — AI Chat**
- [x] POST /ai/chat → returns a coherent reply using agency data
- [x] English input → English reply
- [x] Urdu script input → Roman Urdu reply
- [x] Agent correctly uses query_properties and query_clients tools when asked
      questions about listings or leads

**Behavioral — Follow-up Drafting**
- [x] POST /ai/draft-followup/{client_id} → returns personalized message text
      and suggested channel (whatsapp/email)
- [x] Message references client's name, stage, and relevant property details

**Behavioral — Natural Language Search**
- [x] POST /ai/search → free-text query returns filtered property results
- [x] "3-bed DHA Lahore under 80 lakh" extracts correct filters and returns
      matching properties from the tenant's listings

**Behavioral — Web Search**
- [x] POST /ai/chat with a query about external listings triggers Tavily tool
- [x] If TAVILY_API_KEY is empty, agent responds gracefully without crashing

**Isolation**
- [x] Tool calls scoped by tenant_id — a query from Tenant A never returns
      Tenant B's properties or clients

## Rollback Criteria

- OpenAI API key invalid or quota exceeded → all AI endpoints return 503;
  do not let the error bubble as a 500; catch and return a clear message

- Agent SDK import fails (version mismatch) → pin `openai-agents` version in
  pyproject.toml immediately; do not upgrade during the hackathon

- Tavily tool causes agent to hang → set a timeout on the Tavily client call
  (5s max); if it times out, tool returns empty results and agent continues

- tenant_id injection missed on any tool → halt and audit all tool functions
  before continuing to Phase 04; a tool without tenant scoping is a data breach

- LLM replies in wrong language consistently → adjust system prompt language
  instruction; do not change detect_language() logic — the issue is the prompt
