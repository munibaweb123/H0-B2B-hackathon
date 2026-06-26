# Phase 04 — Clients & Pipeline

**Branch:** `feature/frontend/clients-pipeline`
**Depends on:** `feature/frontend/dashboard-properties`
**Effort:** ~3h
**Status:** pending

---

## Architectural Role

The core CRM screens. Clients list is the agent's day-to-day view of leads. Client Detail is the most data-rich screen — profile, stage stepper, AI match, draft follow-up, and interaction timeline all in one place. Pipeline is the Kanban board with dynamic stages (user-defined columns fetched from backend).

---

## Domain Ownership

- `app/(app)/clients/page.tsx` — table with stage filter tabs (All | New Lead | Contacted | …)
- `app/(app)/clients/new/page.tsx` — Add Client form
- `app/(app)/clients/[id]/page.tsx` — Client Detail with 3 tabs
  - Overview tab: profile card, stage stepper, Draft Follow-up, Run AI Match, Send WhatsApp buttons
  - Matched Properties tab: AI match results with score badges
  - Interactions tab: timeline + Add Note
- `app/(app)/pipeline/page.tsx` — Kanban board
  - Columns fetched dynamically from `GET /pipeline/stages`
  - Drag card → `PATCH /clients/{id}/stage`
  - "+ Add Stage" button + "⋮" rename/delete per column
- `components/clients/ClientForm.tsx`
- `components/clients/StageTracker.tsx` — horizontal stage stepper
- `components/clients/InteractionTimeline.tsx`
- `components/clients/MatchedPropertiesTab.tsx`
- `components/pipeline/KanbanBoard.tsx`
- `components/pipeline/KanbanColumn.tsx`
- `components/pipeline/StageManagerModal.tsx` — add/rename/delete stage
- Visual reference:
  - `template/stitch_creamy_professional_ui/clients_propflow_ai/screen.png`
  - `template/stitch_creamy_professional_ui/client_detail_ahmed_khan_propflow_ai/code.html`
  - `template/stitch_creamy_professional_ui/pipeline_propflow_ai_2/code.html`

---

## Explicit Boundaries

- No AI chat interface here — that is Phase 05
- No WhatsApp manual send form — that is Phase 05; this phase only calls `POST /whatsapp/send` as a fire-and-forget action from the Draft Follow-up button
- No slot booking calendar — that is Phase 05
- `GET /pipeline/stages` returns user-defined stages; do not hardcode stage names in this phase

---

## Anti-patterns

- **Do not fetch all interactions on the clients list page** — only fetch interactions inside the `[id]` detail page when the Interactions tab is active
- **Do not allow stage skipping** — the stage stepper is display-only; stage transitions happen only via drag-and-drop on Pipeline or the "Move to Next Stage" button calling `PATCH /clients/{id}/stage`; backend enforces order, so show the error toast if backend rejects
- **Do not implement drag-and-drop from scratch** — use `@hello-pangea/dnd` (fork of react-beautiful-dnd, works with React 18) or `dnd-kit`; prefer `@hello-pangea/dnd` for simpler Kanban use case
- **Do not optimistically update Kanban columns** — wait for `PATCH /clients/{id}/stage` success before re-ordering the card in state; on error, revert visually
- **Do not call AI endpoints on page load** — AI Match and Draft Follow-up are triggered by explicit button clicks only

---

## Core Capabilities

### 1. Clients list page (`/clients`)
Calls `GET /clients` on mount. Renders a table with columns: Name, Phone, Budget (PKR), City, Stage, Last Contact, Actions.

**Stage filter tabs** above the table: All | New Lead | Contacted | Site Visit | Negotiation | Closed
- Tabs filter client-side on the fetched array
- Active tab uses `border-b-2 border-pink-accent text-pink-accent`

**Row actions:** "View" → `/clients/[id]`, "Edit" → same page in edit mode (or a modal).

**Empty state:** "No clients yet — Add your first lead" with Add Client button.

**"Add Client" button** (top right) → `/clients/new`.

### 2. Add Client form (`/clients/new`)
**`ClientForm.tsx`** fields:
- Full Name (text, required)
- Phone (text, required)
- Email (text, optional)
- Budget Min / Budget Max in PKR (numbers)
- City (text with Places autocomplete, same component as Phase 03)
- Preferred Property Type (select)
- Bedrooms Needed (number, optional)
- Notes (textarea)
- Stage (select, defaults to "New Lead" — first item from `GET /pipeline/stages`)

On submit: `POST /clients` → redirect to `/clients/[id]` of the newly created client.

### 3. Client Detail page (`/clients/[id]`)
Calls `GET /clients/{id}` on mount. Three-tab layout using Shadcn `Tabs`.

**Overview tab:**
- Profile card (left): name, phone, email, city, budget range, preferred type, bedrooms needed
- Stage stepper (right): `StageTracker.tsx` — horizontal sequence of all stages; current stage highlighted with `bg-pink-accent text-white`, completed stages with checkmark, future stages dimmed
- Action buttons below stepper:
  - "Run AI Match" → `POST /ai/match/{client_id}` (loading spinner) → switches to Matched Properties tab with results
  - "Draft Follow-up" → `POST /ai/draft-followup/{client_id}` → opens a modal showing the drafted message with "Send via WhatsApp" and "Send via Email" buttons
    - "Send via WhatsApp" → `POST /whatsapp/send` with the drafted text
    - "Send via Email" → `POST /email/followup/{client_id}`
  - "Move to Next Stage" → `PATCH /clients/{id}/stage` with `{ stage: nextStage }` → refreshes page; show backend error toast if invalid transition

**Matched Properties tab:**
- Renders only after "Run AI Match" is triggered (or if previously cached in component state)
- Each match: `MatchedPropertiesTab.tsx` shows property title, price, city, score badge (0–100 in green/amber/red), and AI reason text
- "View Property" link to `/properties/[id]`
- Score badge colors: ≥80 green, 50–79 amber, <50 red

**Interactions tab:**
- Calls `GET /clients/{id}/interactions` when tab becomes active (not on page load)
- `InteractionTimeline.tsx`: vertical list, each item has: type badge (call/whatsapp/email/note/visit), date, content/notes
- "Add Note" button → inline form (textarea + submit) → `POST /clients/{id}/interactions` with `{ type: "note", notes: "..." }`

### 4. Pipeline Kanban (`/pipeline`)
On mount: calls `GET /pipeline/stages` → renders one column per stage; calls `GET /clients` → distributes clients into columns by current stage.

**`KanbanBoard.tsx`:**
- Horizontal scrollable container of `KanbanColumn` components
- Drag-and-drop via `@hello-pangea/dnd`: `<DragDropContext onDragEnd={handleDragEnd}>` wraps all columns
- `handleDragEnd`: extract `clientId` and `destinationStage` → call `PATCH /clients/{clientId}/stage` → on success update local state; on error revert and show toast

**`KanbanColumn.tsx`:**
- Column header: stage name + client count badge
- Dark plum column header (`bg-maroon-dark text-white`), cream body
- Each card: client name, budget range, city, days-in-stage badge
- Column header has "⋮" menu: Rename / Delete (opens `StageManagerModal`)

**`StageManagerModal.tsx`:**
- "+ Add Stage" button (bottom of board or top right): opens modal with Name field → `POST /pipeline/stages` → refresh stages
- Rename: pre-filled name field → `PATCH /pipeline/stages/{id}` → refresh
- Delete: confirm AlertDialog → `DELETE /pipeline/stages/{id}` → clients in that stage fall to "Uncategorized" (backend handles; frontend just refreshes)

**Default stages**: on first load if `GET /pipeline/stages` returns empty, seed view with ["New Lead", "Contacted", "Site Visit", "Negotiation", "Closed"] labels (display only — backend seeds defaults on agency signup, so this should not be empty in practice).

---

## Service Interactions

**Upstream (backend):**
- `GET /clients` → `ClientResponse[]`
- `POST /clients`
- `GET /clients/{id}`
- `PATCH /clients/{id}`
- `PATCH /clients/{id}/stage`
- `GET /clients/{id}/interactions`
- `POST /clients/{id}/interactions`
- `POST /ai/match/{client_id}` → `{ matches: [{ property_id, score, reason }] }`
- `POST /ai/draft-followup/{client_id}` → `{ message_text, channel }`
- `POST /whatsapp/send`
- `POST /email/followup/{client_id}`
- `GET /pipeline/stages` → `PipelineStage[]` (custom stages — backend update needed)
- `POST /pipeline/stages`
- `PATCH /pipeline/stages/{id}`
- `DELETE /pipeline/stages/{id}`

**Downstream:**
- Phase 05 (Settings) shares the team invite flow

---

## Architectural Constraints

- **Drag-and-drop library:** `@hello-pangea/dnd` — install with `npm install @hello-pangea/dnd @types/hello-pangea__dnd`; do not use react-beautiful-dnd (not React 18 compatible)
- **Stage name source of truth:** always `GET /pipeline/stages`; never hardcode stage strings in components
- **`PATCH /clients/{id}/stage`** body: `{ stage: string }` where `stage` is the stage `name` field from `PipelineStage`
- **Backend pipeline stages model** must be built before this phase runs — confirm `GET /pipeline/stages` returns data; if backend doesn't have this endpoint yet, use the hardcoded default list temporarily
- **AI endpoints return time** can be 3–8 seconds — always show a loading spinner on the button; disable the button during loading
- **Draft Follow-up modal** must show the drafted text as editable (textarea, pre-filled with `message_text`) so the agent can tweak before sending
- **409 on double-booking** (from `/slots` in Phase 05) does not apply here; note for Phase 05 only

---

## Definition of Done

- [ ] `/clients` page loads and displays all clients in a table
- [ ] Stage filter tabs correctly filter the client list
- [ ] Add Client form submits and redirects to new client's detail page
- [ ] Client Detail Overview tab shows profile + stage stepper with correct current stage highlighted
- [ ] "Run AI Match" triggers the endpoint, shows loading, then populates Matched Properties tab
- [ ] "Draft Follow-up" shows the AI-drafted message in a modal; agent can edit and send
- [ ] "Move to Next Stage" calls the correct endpoint and refreshes stage display
- [ ] Interactions tab loads on tab-activate and shows timeline
- [ ] "Add Note" posts and appends to timeline without full page reload
- [ ] `/pipeline` Kanban renders one column per stage from `GET /pipeline/stages`
- [ ] Drag-and-drop moves a client card and fires `PATCH /clients/{id}/stage`
- [ ] Kanban reverts card position and shows error toast if stage transition is rejected
- [ ] "+ Add Stage" and Rename/Delete stage operations work and refresh the board
- [ ] No TypeScript errors in this phase's files
