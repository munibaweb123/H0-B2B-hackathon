# Phase 05 — AI & Integrations

**Branch:** `feature/frontend/ai-integrations`
**Depends on:** `feature/frontend/clients-pipeline`
**Effort:** ~2h
**Status:** pending

---

## Architectural Role

Completes the product with the four remaining screens: AI Chat (conversational interface to all agency data), WhatsApp (bot status + manual send), Site Visits (slot calendar + booking), and Settings (profile + team management). These are mostly self-contained pages that plug into already-existing backend endpoints.

---

## Domain Ownership

- `app/(app)/ai/chat/page.tsx` — full-height chat with conversation sidebar, message bubbles, tool call chips, quick action chips
- `app/(app)/whatsapp/page.tsx` — bot status card + manual message composer
- `app/(app)/slots/page.tsx` — week calendar view, available/booked slots, Add Slot modal
- `app/(app)/settings/page.tsx` — profile card + team members table + Invite Agent modal
- `components/chat/ChatMessage.tsx`
- `components/chat/ToolCallChip.tsx`
- `components/chat/ConversationSidebar.tsx`
- `components/slots/WeekCalendar.tsx`
- `components/slots/SlotCard.tsx`
- `components/slots/AddSlotModal.tsx`
- Visual reference:
  - `template/stitch_creamy_professional_ui/ai_chat_propflow_ai/code.html`
  - `template/stitch_creamy_professional_ui/whatsapp_propflow_ai/code.html`
  - `template/stitch_creamy_professional_ui/site_visits_propflow_ai/code.html`
  - `template/stitch_creamy_professional_ui/settings_propflow_ai/code.html`

---

## Explicit Boundaries

- No new backend endpoints — all endpoints used here are already built in backend phases 01–04
- No real-time streaming of AI responses — backend uses `Runner.run()` (not stream); the frontend makes a single POST and awaits the complete reply
- No WebSocket or SSE — all communication is standard HTTP request/response
- No voice input UI — voice note handling is WhatsApp-only (backend), not in the web UI
- No call UI — Pipecat call handler is backend-only; no WebRTC client here
- Conversation history is in-memory only (component state) — no persistence to backend for the demo

---

## Anti-patterns

- **Do not stream token-by-token** — `POST /ai/chat` returns the full reply; render it all at once; do not fake streaming with `setTimeout`
- **Do not show raw JSON for tool calls** — `tool_calls_made` is a `string[]`; render each as a small chip badge (`ToolCallChip.tsx`), e.g., "searched properties", "found client"
- **Do not disable the send button during AI thinking without a visible loading state** — show a typing indicator (animated dots) in the chat as a temporary message while awaiting response
- **Do not book a slot without checking for 409** — handle 409 Conflict from `POST /slots/{id}/book` explicitly: show "Slot already booked — please choose another"
- **Do not let the chat input submit on Enter without Shift** — Enter submits, Shift+Enter adds newline

---

## Core Capabilities

### 1. AI Chat page (`/ai/chat`)
Full-height layout (fills the content area below TopNav). Two panels:
- **Left: ConversationSidebar** (200px) — list of past conversation sessions; for demo this is just the current session with a "New Chat" button that clears messages
- **Right: Chat area** — messages + input bar

**Message rendering (`ChatMessage.tsx`):**
- User messages: right-aligned, `bg-maroon-dark text-white` bubble
- Agent (AI) messages: left-aligned, `bg-white border border-gray-100` bubble with PropFlow avatar
- Between user and AI, if `tool_calls_made` is non-empty, render a row of `ToolCallChip` badges: small `bg-maroon-light/20 text-maroon-dark` pills with icons (e.g., wrench icon) showing e.g. "searched_properties", "get_client"

**Input bar:**
- Full-width textarea (1–3 rows, auto-grows), placeholder "Ask PropFlow anything…"
- Send button (Enter or click): disabled during loading
- While awaiting response: add a temporary "typing…" message with animated dots
- Quick action chips above input (optional, nice for demo): "Show top clients", "Find properties under 80 lakh", "Draft follow-up for Ali Raza" — clicking fills the input

**State:** `messages: { role: 'user'|'assistant', content: string, tool_calls?: string[] }[]` in `useState`. No persistence.

**API call:** `POST /ai/chat` with `{ message: string, history: [{ role, content }][] }` — send last N messages as history.

### 2. WhatsApp page (`/whatsapp`)
Two sections:

**Bot Status card:**
- Shows webhook URL (from `NEXT_PUBLIC_API_URL + "/webhook"`)
- Status: "Connected" (green badge) — always shown as connected for demo
- Last message received: timestamp (not fetched, can be hardcoded or omitted for demo)

**Manual Message Composer:**
- Fields: Recipient Phone (with country code, e.g., +923001234567), Message (textarea)
- Send button → `POST /whatsapp/send` with `{ to: phone, message: text }` → success toast "Message sent via WhatsApp"
- Note below form: "Messages are sent via Meta Business API (sandbox mode)"

### 3. Site Visits / Slots page (`/slots`)
Calls `GET /slots` on mount. Renders a week-view calendar.

**`WeekCalendar.tsx`:**
- 7 columns (Mon–Sun) × time rows (8am–8pm, 1-hour blocks)
- Each slot returned by backend placed in its correct cell as a `SlotCard`
- Available slots: `bg-green-50 border-green-200 text-green-800`
- Booked slots: `bg-maroon-dark/10 border-maroon-dark/30 text-maroon-dark`
- Empty cells: light grey

**`SlotCard.tsx`:**
- Shows time, agent name (from slot's `agent_id` — display "You" for current user)
- If `is_booked`: shows client name (if known) or "Booked"
- If not booked: "Book" button → opens a small popover/modal to select a client from dropdown → `POST /slots/{slot_id}/book?client_id={uuid}` → handle 409

**"Add Slot" button** (top right) → `AddSlotModal.tsx`:
- Fields: Date (date picker), Time (select: 8am–8pm in 1h increments)
- Submit → `POST /slots` with `{ slot_datetime: ISO string }` → refresh calendar

**Week navigation:** Previous/Next week buttons update a `weekStart` date state; filter `GET /slots` results client-side by week.

### 4. Settings page (`/settings`)
Two sections on the page:

**Profile card:**
- Shows current user: name, email, role (from `GET /auth/me`)
- "Edit" form inline or modal — `PATCH /auth/me` if endpoint exists; skip edit for demo if not

**Team Members table:**
- `GET /agency/agents` → list of agents with: Name, Email, Role, Joined Date
- Table columns: Avatar, Name, Email, Role badge, Joined
- "Invite Agent" button (top right of table) → opens `InviteAgentModal`:
  - Fields: Email, Role (Select: agent | manager)
  - Submit → `POST /auth/invite` → success toast "Invite sent to [email]"
  - Backend sends email via Resend with invite link

---

## Service Interactions

**Upstream (backend):**
- `POST /ai/chat` → `{ reply: str, tool_calls_made: [str] }`
- `POST /ai/search` → `{ results: [dict], summary: str }` (for future; not wired in chat UI for demo)
- `POST /whatsapp/send`
- `GET /slots`
- `POST /slots`
- `POST /slots/{slot_id}/book?client_id={uuid}`
- `GET /auth/me`
- `POST /auth/invite`

**Downstream:**
- None — this is the final frontend phase

---

## Architectural Constraints

- **Chat history format** sent to `POST /ai/chat`: `{ message: string, history: Array<{ role: string, content: string }> }` — check the exact backend schema and match it; do not send tool call data back in history
- **409 from slot booking must be caught explicitly** — `apiFetch` throws on non-2xx; catch the error, check `error.status === 409`, show specific "already booked" message rather than generic error
- **Slot datetime format:** send as ISO 8601 string (e.g., `"2026-06-27T09:00:00"`) — naive datetime (no timezone suffix) to match Aurora DSQL `datetime.utcnow()` convention
- **`GET /agency/agents`** endpoint: verify this exists in the backend; if not, `GET /auth/me` with team data may be enough for demo — check backend and adapt
- **Chat is stateless per session** — no conversation ID needed; backend processes each request independently

---

## Definition of Done

- [ ] `/ai/chat` renders message bubbles; user can send a message and receive AI reply
- [ ] Tool call chips appear below AI messages when `tool_calls_made` is non-empty
- [ ] Typing indicator (animated dots) shows while awaiting AI response
- [ ] "New Chat" button clears the conversation
- [ ] `/whatsapp` manual send form submits and shows success toast
- [ ] `/slots` week calendar renders available and booked slots in correct time cells
- [ ] Booking a slot calls the correct endpoint; 409 shows "already booked" message
- [ ] "Add Slot" modal creates a new slot and it appears in the calendar
- [ ] `/settings` shows current user info and team members list
- [ ] "Invite Agent" modal sends invite and shows success toast
- [ ] No TypeScript errors in this phase's files
- [ ] Full end-to-end flow works: add property → trigger deal closer → see WhatsApp pitch sent → client booked on calendar
