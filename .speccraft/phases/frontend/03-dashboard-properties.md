# Phase 03 — Dashboard & Properties

**Branch:** `feature/frontend/dashboard-properties`
**Depends on:** `feature/frontend/auth`
**Effort:** ~2h
**Status:** complete

---

## Architectural Role

Implements the first two content areas agents land on after login. Dashboard gives an agency-wide overview (stats, pipeline distribution, recent activity). Properties lets agents browse listings and add new ones with location autocomplete powered by Google Places.

---

## Domain Ownership

- `app/(app)/dashboard/page.tsx` — 4 stat cards, pipeline bar chart, recent activity feed
- `app/(app)/properties/page.tsx` — card grid with filters (city, type, status, bedrooms, price range)
- `app/(app)/properties/new/page.tsx` — Add Property form
- `app/(app)/properties/[id]/page.tsx` — Edit Property form + Trigger Deal Closer button
- `components/properties/PropertyCard.tsx`
- `components/properties/PropertyForm.tsx` — shared add/edit form with location autocomplete
- `components/dashboard/StatCard.tsx`
- `components/dashboard/PipelineChart.tsx` — horizontal bar chart
- `components/dashboard/RecentActivity.tsx`
- Visual reference:
  - `template/stitch_creamy_professional_ui/dashboard_propflow_ai_1/code.html`
  - `template/stitch_creamy_professional_ui/properties_propflow_ai/screen.png`
  - `template/stitch_creamy_professional_ui/add_property_propflow_ai/code.html`

---

## Explicit Boundaries

- No client data, interaction timelines, or pipeline Kanban — those are Phase 04
- No AI match triggering from this phase — that lives in Client Detail (Phase 04)
- No file upload for property photos — photos are optional; accept a URL string field for demo
- No pagination — load all properties for demo (backend returns flat arrays)
- Dashboard does not auto-refresh; agent refreshes manually

---

## Anti-patterns

- **Do not fetch dashboard + properties in a single combined call** — keep them as separate `apiGet` calls in their respective pages
- **Do not debounce the Places autocomplete below 300ms** — avoid hammering the proxy endpoint
- **Do not show a spinner for the entire page** — use `Skeleton` per card so the layout doesn't jump
- **Do not call `POST /deal-closer/{id}` on form submit** — it must be a separate button with a confirmation dialog ("This will pitch X matched clients — are you sure?")
- **Do not store filter state in the URL** for the demo — local `useState` is fine

---

## Core Capabilities

### 1. Dashboard page (`/dashboard`)
Calls `GET /dashboard` on mount. Renders:

**StatCards row** (4 cards):
- Total Listings (icon: `Building2`)
- Active Clients (icon: `Users`)
- Pipeline Value in PKR with `Mln` suffix (icon: `TrendingUp`)
- Deals Closed (icon: `CheckCircle`, green accent)

Stat card design from template: cream card, icon in a tinted circle, large number in Playfair Display, label in muted text.

**Pipeline Distribution** (horizontal stacked bar or simple count badges per stage):
- Show counts per stage: New Lead / Contacted / Site Visit / Negotiation / Closed
- Use `bg-pink-accent`, `bg-maroon-light`, etc. as stage colors
- A simple horizontal progress bar per stage (no external chart library needed)

**Recent Activity** (last 5-8 interactions from `GET /clients` latest updated):
- Each row: client name, stage badge, last contact date
- Link to client detail

### 2. Properties list page (`/properties`)
Calls `GET /properties` on mount. Renders a responsive card grid (3 cols desktop, 2 tablet, 1 mobile).

**Filter bar** above grid:
- City (text input, filters client-side)
- Property Type (Select: Apartment | Villa | House | Plot | Commercial)
- Status (Select: Available | Reserved | Sold)
- Bedrooms (Select: 1 | 2 | 3 | 4 | 5+)
- Price range min/max (two number inputs)

Filters are applied client-side on the fetched array (no re-fetch on filter change).

**`PropertyCard.tsx`:**
- Photo placeholder (grey box with `Building2` icon if no image URL)
- Title + city badge, price in PKR
- Type badge, bedrooms / bathrooms / area row
- Status badge: green (Available), amber (Reserved), red (Sold)
- "Edit" button links to `/properties/[id]`

**Empty state:** "No properties yet — Add your first listing" with an Add Property button.

### 3. Add Property form (`/properties/new`)
**`PropertyForm.tsx`** (shared with edit):
Fields:
- Title (text, required)
- Property Type (select)
- Price in PKR (number, required)
- City (text with Places autocomplete — see below)
- Address / Location (text with Places autocomplete)
- Bedrooms (number)
- Bathrooms (number)
- Area in sq. ft. (number)
- Description (textarea)
- Photo URL (text, optional)
- Status (select: Available / Reserved / Sold)

On submit: `POST /properties` → redirect to `/properties`.

### 4. Edit Property form (`/properties/[id]`)
Same `PropertyForm.tsx`, pre-populated by `GET /properties/{id}`. Submit calls `PATCH /properties/{id}`.

**Trigger Deal Closer button** (separate, below the form, destructive-looking):
- Label: "Trigger Deal Closer — Pitch Matched Clients"
- Opens a Shadcn `AlertDialog`: "This will send WhatsApp pitches to all matching clients. Proceed?"
- On confirm: `POST /deal-closer/{id}` → show success toast with match count from response

**Delete Property** (small destructive button, also gated by AlertDialog).

### 5. Location autocomplete
Used on both City and Address fields in `PropertyForm.tsx`:
- On input change (debounced 300ms): call `GET /places/autocomplete?input=<text>`
- Show dropdown of suggestions (max 5) below the input
- On select: fill the field with the suggestion label
- If no `GOOGLE_PLACES_API_KEY` (backend returns `[]`): autocomplete silently shows nothing; agent types manually

---

## Service Interactions

**Upstream (backend):**
- `GET /dashboard` → `{ total_properties, active_clients, pipeline_value, deals_closed }`
- `GET /properties` (with filters) → `PropertyResponse[]`
- `POST /properties`
- `PATCH /properties/{id}`
- `DELETE /properties/{id}`
- `GET /places/autocomplete?input=<text>` → autocomplete suggestions
- `POST /deal-closer/{property_id}` → pitch matched clients (on edit page)

**Downstream:**
- Phase 04 (Clients) links to property detail from matched properties tab

---

## Architectural Constraints

- `PropertyForm.tsx` must work for both add (`id = undefined`) and edit (`id = UUID`) — distinguish by presence of `id` prop
- Places autocomplete is a custom combobox built with `useState` + `useEffect`; do not install a third-party autocomplete library
- Deal Closer response shape: `{ pitched: int, visits_booked: int }` — display in success toast
- All monetary values stored/received as plain numbers (PKR); display formatted with `toLocaleString('en-PK')` or manual comma insertion
- No optimistic updates — wait for API response before updating the list

---

## Definition of Done

- [x] Dashboard loads and shows 4 stat cards with real numbers from backend
- [x] Dashboard pipeline distribution renders with stage counts
- [x] Properties grid renders all properties returned by backend
- [x] Client-side filters (city, type, status) narrow the grid without re-fetching
- [x] Add Property form submits and new property appears in list
- [x] Edit Property form pre-populates fields correctly
- [x] Deal Closer button fires `POST /deal-closer/{id}` and shows success toast
- [x] Location autocomplete calls backend proxy and shows suggestions on city/address fields
- [x] Delete property removes it from the list
- [x] No TypeScript errors in this phase's files
