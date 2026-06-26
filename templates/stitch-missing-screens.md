# PropFlow AI — Missing Screens for Stitch

## Design System Reference
Use the **Editorial Elegance** theme already established:
- Background: `#fdf9ed` (creamy off-white)
- Sidebar: deep plum `#33063C`
- Sidebar text/icons: white
- Primary action buttons: solid plum `#33063C` with white text
- Headlines: Playfair Display
- Body/labels: DM Sans
- Cards: flat, 1px plum-tinted border, no heavy shadows
- Same sidebar navigation as existing screens:
  Dashboard / Properties / Clients / Pipeline / AI Chat / Site Visits / WhatsApp / Settings

---

## Fix Needed on Existing Screens

### Pipeline — show all 5 columns (currently only 3 visible)
The Kanban board must show all 5 columns horizontally scrollable:
1. **New Lead** (gray dot)
2. **Contacted** (blue dot)
3. **Site Visit** (yellow dot)
4. **Negotiation** (orange dot)
5. **Closed** (green dot)

Each column header shows: stage name + count of clients + total budget value (e.g. "Rs 15.5 Cr")

### Dashboard — fix pipeline stage names
Pipeline Distribution bar chart must use these exact stage names:
- New Lead
- Contacted
- Site Visit
- Negotiation
- Closed

---

## Screen 1: Client Detail (`/clients/[id]`)

**Layout:** Full page with 3 tabs across the top: **Overview | Matched Properties | Interactions**

### Overview Tab (default)
Left column (60%):
- Client profile card:
  - Avatar initials circle (plum background)
  - Full name (large, Playfair Display)
  - Phone: 0300 1234567
  - Email: ahmed@example.com
  - Budget: Rs 85 Lakh – Rs 1.2 Crore
  - Preferred City: Lahore
  - Preferred Area: DHA
  - Bedrooms Needed: 3
  - Property Type: House
  - Notes: "Prefers ground floor, needs car parking"
  - Edit button (ghost style)

- Stage Pipeline tracker (horizontal stepper):
  `New Lead → Contacted → Site Visit → Negotiation → Closed`
  Current stage highlighted in plum. Click next stage to advance.

Right column (40%):
- "Draft Follow-up" button (plum, full width) — generates AI message
  Below it: a message preview card showing the drafted WhatsApp/email message with "Send via WhatsApp" and "Send via Email" buttons
- "Run AI Match" button (ghost, full width)
- "Send WhatsApp" button (ghost, full width)

### Matched Properties Tab
- "Run AI Match" big button at top if no results yet
- After running: grid of property cards each showing:
  - Property photo thumbnail
  - Title + city/area
  - Price
  - Bedrooms / Bathrooms
  - AI Match Score badge (e.g. "92 / 100" in green, "67 / 100" in yellow)
  - AI reason text below score (italic, small): "Budget fits, 3 beds in DHA matches perfectly"

### Interactions Tab
- Timeline list (newest first):
  Each item has:
  - Icon: WhatsApp (green) / Email (blue) / Call (purple) / Note (gray)
  - Type label + timestamp ("2 hours ago")
  - Message content text
- "Add Note" button at top right → inline form with textarea + Save

---

## Screen 2: Add / Edit Property (`/properties/new`)

**Layout:** Single column centered form, max-width 720px

Form sections:

**Basic Info**
- Title (text input): "3-Bed House DHA Phase 5 Lahore"
- Property Type (select): House / Apartment / Plot / Commercial
- Status (select): Available / Sold / Rented
- Description (textarea, optional)

**Pricing & Size**
- Price (number input with Rs prefix): 8,500,000
- Area in Marla or Sqft (number input)
- Bedrooms (number stepper: 1–10)
- Bathrooms (number stepper: 1–10)

**Location**
- City (text input with autocomplete dropdown — shows suggestions as user types e.g. "Lahore", "Karachi")
- Area / Society (text input with autocomplete dropdown — e.g. "DHA Phase 5", "Bahria Town")
- Full Address (text input, optional)

**Photos**
- Multiple URL inputs (add/remove rows)
- Small thumbnail preview beside each URL

**Action Buttons (bottom)**
- "Save Property" (primary plum button)
- "Cancel" (ghost button)

**For Edit mode only — add at bottom:**
- Danger zone card with "Trigger Deal Closer" button (amber/gold color):
  "AI will find matching clients and send them a personalized WhatsApp pitch"
  After clicking: shows results — list of clients pitched with name + message preview

---

## Screen 3: AI Chat (`/ai/chat`)

**Layout:** Two-panel — left sidebar (conversation list) + right chat area

Left sidebar (250px, slightly darker plum):
- "New Chat" button at top
- List of recent conversation stubs (client-side):
  - "Find 3-bed DHA properties" — 2h ago
  - "Pipeline summary" — Yesterday
  - "Ahmed Khan requirements" — 2 days ago

Right chat area:
- Top bar: "PropFlow AI Assistant" title + subtitle "Powered by GPT-4o"
- Message thread (scrollable):
  - **User message** (right-aligned): cream bubble with plum text
    > "Show me all available properties in DHA Lahore"
  - **AI message** (left-aligned): white card with subtle border
    > "I found 4 available properties in DHA Lahore..."
    - Below AI message: small tool call chip(s): `🔧 query_properties` (light plum background, small text)
  - **User message**: "What's Ahmed Khan's budget?"
  - **AI message**: "Ahmed Khan has a budget of Rs 85 Lakh to Rs 1.2 Crore..."
    - Tool chip: `🔧 query_clients`
- Bottom input bar (sticky):
  - Text input: "Ask anything about your clients, properties, pipeline..."
  - Send button (plum)
  - Quick chips above input: "Summarize pipeline" / "Available listings" / "Top clients this week"

---

## Screen 4: Site Visits (`/slots`)

**Layout:** Calendar-style week view

Top bar:
- "Week of Jun 23 – Jun 29, 2026" with prev/next arrows
- "+ Add Slot" button (plum)

Week grid (7 columns, Mon–Sun):
- Each day column shows time slots (9 AM – 6 PM)
- **Available slot** (green border card): "10:00 AM — Available" + "Book" button
- **Booked slot** (plum filled card): "2:00 PM — Ahmed Khan" + client avatar initials
- **Empty time**: light gray

Add Slot modal (show it open):
- Date + time picker
- "Create Slot" button

---

## Screen 5: WhatsApp (`/whatsapp`)

**Layout:** Single centered card, max-width 600px

Status card at top:
- WhatsApp icon (green)
- "WhatsApp Bot Active" in green badge
- "Receiving messages at +92 300 XXXXXXX"
- Subtext: "Any message sent to this number is processed by PropFlow AI and replied automatically"

Send Manual Message card below:
- "Send WhatsApp Message" heading
- Phone Number input: "+92 300 1234567"
- Message textarea (4 rows)
- "Send Message" button (plum)
- Below button: small note "Message will be logged to client interaction history if the phone number matches a client"

Info card at bottom:
- 3 feature pills: "Voice notes transcribed via Whisper" / "Urdu & English supported" / "Auto-replies with AI"

---

## Screen 6: Settings (`/settings`)

**Layout:** Two sections stacked

**Profile Section**
- Card with:
  - Avatar circle (large, plum, initials)
  - Full Name: "Ahmed Khan"
  - Email: "ahmed@propflow.ai"
  - Role badge: "Owner" (gold/amber pill)
  - Agency: "Khan Real Estate"
  - Edit Profile button (ghost)

**Team Members Section**
- Heading: "Team Members"
- "+ Invite Agent" button (plum, top right of section)
- Table of team members:
  | Avatar | Name | Email | Role | Joined |
  |--------|------|-------|------|--------|
  | AK | Ahmed Khan | ahmed@... | Owner | Jun 2026 |
  | SM | Sara Malik | sara@... | Agent | Jun 2026 |
- Invite modal (show it overlaid): 
  - Email input
  - "Send Invite" button
  - Subtext: "They'll receive a link to set up their account"
