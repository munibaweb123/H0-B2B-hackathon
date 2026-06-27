# PropFlow AI — Frontend Design Brief

## Product Overview

PropFlow AI is a multi-tenant B2B SaaS CRM for Pakistani real estate agencies.
It helps agents manage property listings, track clients through a sales pipeline,
send AI-written WhatsApp/email follow-ups, and let an AI autonomously pitch matched
clients when a new property is listed.

**Target users:** Real estate agency owners and agents in Pakistan  
**Primary language:** English (UI), with Urdu support in AI chat  
**Deployment:** Next.js on Vercel  
**Design style:** Professional SaaS dashboard — clean, modern, data-dense but not cluttered  
**Color direction:** Dark navy sidebar + white content area + gold/amber accent for CTAs  
**Font:** Inter or similar clean sans-serif

---

## Tech Stack (Frontend)

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Shadcn/ui components
- **Auth:** JWT stored in localStorage, passed as `Authorization: Bearer <token>` header
- **API base URL:** `http://localhost:8000` (env var: `NEXT_PUBLIC_API_URL`)

---

## Authentication Flow

### Screens
1. `/login` — Email + password login
2. `/signup` — Agency name, full name, email, password (creates agency + owner account)
3. `/invite/[token]` — Accept invite (full name + password)

### API Calls

```
POST /auth/signup
Body: { agency_name, full_name, email, password }
Response: { access_token, token_type }

POST /auth/login
Body: { email, password }
Response: { access_token, token_type }

POST /auth/accept-invite
Body: { token, full_name, password }
Response: { access_token, token_type }

GET /auth/me
Headers: Authorization: Bearer <token>
Response: { id, tenant_id, email, full_name, role: "owner"|"agent" }

POST /auth/invite
Body: { email }
Response: { invite_token }
```

---

## Dashboard

### Screen: `/dashboard`

Summary cards + pipeline overview.

```
GET /dashboard
Response: {
  total_properties: number,
  active_clients: number,
  pipeline_value: number,   // sum of budget_max for non-closed clients (PKR)
  deals_closed: number
}
```

**UI Elements:**
- 4 stat cards: Total Properties / Active Clients / Pipeline Value (PKR) / Deals Closed
- Pipeline stage bar chart: New Lead | Contacted | Site Visit | Negotiation | Closed
- Quick action buttons: Add Property, Add Client, Open AI Chat
- Recent activity feed (last 5 interactions across all clients)

---

## Properties

### Screen: `/properties` — List

```
GET /properties?status=available&city=Lahore&bedrooms=3&min_price=0&max_price=10000000
Response: PropertyResponse[]
```

**PropertyResponse shape:**
```json
{
  "id": "uuid",
  "title": "3-Bed House DHA Phase 5",
  "property_type": "house" | "apartment" | "plot" | "commercial",
  "status": "available" | "sold" | "rented",
  "price": 8500000,
  "area_sqft": 2400,
  "bedrooms": 3,
  "bathrooms": 2,
  "city": "Lahore",
  "area": "DHA Phase 5",
  "address": "Street 12, Block E",
  "photos": ["url1", "url2"],
  "created_at": "2026-06-20T10:00:00Z",
  "updated_at": "2026-06-20T10:00:00Z"
}
```

**UI Elements:**
- Filter bar: city, type, status, bedrooms, price range
- Card grid (3 cols): photo thumbnail, title, price, city/area, bedrooms, status badge
- "+ Add Property" button top right
- Click card → property detail

### Screen: `/properties/new` and `/properties/[id]` — Add / Edit

```
POST /properties
PATCH /properties/{id}
Body: { title, description, property_type, status, price, area_sqft, bedrooms, bathrooms, city, area, address, photos[] }

DELETE /properties/{id}
```

**UI Elements:**
- Form with all fields
- Location autocomplete for city/area: `GET /places/autocomplete?input=<text>` → `[{place_id, description}]`
- Photo URL input (multiple)
- "Trigger Deal Closer" button on existing property → `POST /deal-closer/{property_id}`
  - Shows loading state then result: list of clients pitched with message preview

---

## Clients (CRM)

### Screen: `/clients` — List

```
GET /clients?limit=50&offset=0
Response: ClientResponse[]
```

**ClientResponse shape:**
```json
{
  "id": "uuid",
  "full_name": "Ahmed Khan",
  "phone": "03001234567",
  "email": "ahmed@example.com",
  "budget_min": 5000000,
  "budget_max": 10000000,
  "preferred_city": "Lahore",
  "preferred_area": "DHA",
  "bedrooms_needed": 3,
  "property_type_needed": "house",
  "notes": "Wants ground floor",
  "stage": "new_lead" | "contacted" | "site_visit" | "negotiation" | "closed",
  "created_at": "...",
  "updated_at": "..."
}
```

**UI Elements:**
- Table: Name, Phone, City, Budget (max), Stage badge, Created date, Actions
- Stage filter tabs across top: All | New Lead | Contacted | Site Visit | Negotiation | Closed
- "+ Add Client" button
- Click row → client detail

### Screen: `/clients/[id]` — Client Detail

Tabs: Overview | Matched Properties | Interactions

**Overview tab:**
- Client profile card (all fields, editable inline)
- Stage selector (moves through pipeline sequentially: new_lead → contacted → site_visit → negotiation → closed)
  ```
  PATCH /clients/{id}/stage
  Body: { stage: "contacted" }
  ```
- "Draft Follow-up" button:
  ```
  POST /ai/draft-followup/{client_id}
  Response: { message_text, channel: "whatsapp"|"email" }
  ```
  Shows drafted message in a modal — agent can edit and send
- "Send WhatsApp" button: `POST /whatsapp/send` `{ to: phone, message }`
- "Send Email" button: `POST /email/followup/{client_id}`

**Matched Properties tab:**
- "Run AI Match" button:
  ```
  POST /ai/match/{client_id}
  Response: { client_id, matches: [{ property_id, score, reason }] }
  ```
- Shows matched properties as cards with score badge (0-100) and AI reason

**Interactions tab:**
- Timeline of past interactions
  ```
  GET /clients/{id}/interactions
  Response: [{ id, type: "whatsapp"|"email"|"call"|"note", content, created_at }]
  ```
- "Add Note" button:
  ```
  POST /clients/{id}/interactions
  Body: { type: "note", content: "..." }
  ```

---

## Pipeline (Kanban)

### Screen: `/pipeline`

```
GET /clients
```

Use the same client list, grouped by stage into 5 columns.

**UI Elements:**
- 5 columns: New Lead | Contacted | Site Visit | Negotiation | Closed
- Client card in each column: name, phone, budget_max, city
- Drag card to next column → `PATCH /clients/{id}/stage`
- Column header shows count + total pipeline value
- Click card → opens client detail slide-over panel

---

## AI Chat

### Screen: `/ai/chat`

```
POST /ai/chat
Body: { message: "3 bed DHA Lahore under 80 lakh", history: [{ role, content }] }
Response: { reply: string, tool_calls_made: string[] }

POST /ai/search
Body: { query: "find properties in Karachi under 1 crore" }
Response: { results: Property[], summary: string }
```

**UI Elements:**
- Full-height chat interface
- Left sidebar: recent conversations (client-side history)
- Message bubbles: user (right, navy), AI (left, white card)
- Tool call indicator chips below AI messages: e.g. 🔧 query_properties, 🔧 search_web
- Input bar with send button
- Supports Urdu/Roman Urdu input — AI replies in same language
- Quick action chips above input: "Show all available listings", "Summarize pipeline", "Find clients for DHA property"

---

## Site Visit Slots

### Screen: `/slots`

```
GET /slots
Response: [{ id, agent_id, slot_datetime, is_booked, booked_by_client_id, created_at }]

POST /slots
Body: { slot_datetime: "2026-06-28T10:00:00" }

POST /slots/{slot_id}/book?client_id={uuid}
```

**UI Elements:**
- Week calendar view showing available/booked slots
- Available slot: green — click to book (select client from dropdown)
- Booked slot: shows client name
- "Add Slot" button: datetime picker

---

## WhatsApp

### Screen: `/whatsapp`

```
POST /whatsapp/send
Body: { to: "03001234567", message: "Hello Ahmed..." }
Response: { sent: true }
```

**UI Elements:**
- Simple message composer: phone number field + message textarea + Send button
- Status: "WhatsApp connected" / "Not configured" badge
- Info card: explains the WhatsApp bot is active — any message to the business number gets AI response

---

## Team & Settings

### Screen: `/settings`

```
GET /auth/me  — current user info
POST /auth/invite  — invite team member by email
```

**UI Elements:**
- Profile section: name, email, role badge
- Team members list (fetch via /auth/me for current user's tenant — no list endpoint, so show current user only)
- "Invite Agent" button: email input → `POST /auth/invite` → shows invite token or "invite sent" confirmation
- Agency name display (from /auth/me → tenant_id context)

---

## Global Layout

**Sidebar navigation (collapsed on mobile):**
```
PropFlow AI  [logo]
─────────────
📊 Dashboard       /dashboard
🏠 Properties      /properties
👥 Clients         /clients
📋 Pipeline        /pipeline
🤖 AI Chat         /ai/chat
📅 Site Visits     /slots
💬 WhatsApp        /whatsapp
⚙️  Settings        /settings
─────────────
[Avatar] Ahmed Khan
         Owner
[Logout]
```

**Top bar:**
- Page title
- Breadcrumb
- Notifications bell (future)
- User avatar

---

## Key UI Patterns

- **Stage badges:** Color-coded pills
  - new_lead → gray
  - contacted → blue
  - site_visit → yellow
  - negotiation → orange
  - closed → green

- **Property type badges:** house=purple, apartment=blue, plot=brown, commercial=gray

- **Status badges:** available=green, sold=red, rented=yellow

- **Price display:** Format as "₨ 85 lakh" or "₨ 1.2 crore" (Pakistani convention)
  - < 1,000,000 → show in thousands: "₨ 850K"
  - 1,000,000–99,999,999 → "₨ X lakh" (divide by 100,000)
  - ≥ 10,000,000 → "₨ X crore" (divide by 10,000,000)

- **Loading states:** Skeleton loaders for all data-fetching sections

- **Empty states:** Friendly illustration + CTA button for zero-data screens

- **Error handling:** Toast notifications for API errors

- **Mobile:** Sidebar collapses to bottom nav on mobile

---

## Data Relationships Summary

```
Agency (tenant)
  └── TeamMembers (owner | agent)
  └── Properties (listings)
  └── Clients (leads)
        └── Interactions (whatsapp | email | call | note)
        └── SiteVisitSlots (bookings)
```

---

## Screens Summary (10 total)

| # | Route | Description |
|---|-------|-------------|
| 1 | /login | Email/password login |
| 2 | /signup | Agency + owner registration |
| 3 | /dashboard | Stats, pipeline summary, quick actions |
| 4 | /properties | Property grid with filters |
| 5 | /properties/new | Add property form |
| 6 | /clients | Client table with stage filter tabs |
| 7 | /clients/[id] | Client detail: overview, matched props, interactions |
| 8 | /pipeline | Kanban board (5 stages) |
| 9 | /ai/chat | Conversational AI interface |
| 10 | /slots | Site visit slot calendar |
