# PropFlow AI — Round 2 Fixes & Updates for Stitch

## Design System Reference
Continue using the **Editorial Elegance** theme. All fixes must maintain:
- Background: `#fdf9ed` (creamy off-white)
- **Sidebar: always dark plum `#33063C` — no exceptions**
- Active nav item: pinkish/rose tint (same as Dashboard screen) — NOT golden
- Headlines: Playfair Display
- Body/labels: DM Sans
- Brand name everywhere: **"PropFlow AI"** with subtitle **"Elite Real Estate CRM"**

---

## Global Fixes (apply to ALL screens)

### Fix 1 — Sidebar color
The sidebar must always be dark plum `#33063C` on every screen.
Currently wrong on: Site Visits, WhatsApp, AI Chat (showing light purple instead).
**Fix:** Change to dark plum `#33063C` on all three screens.

### Fix 2 — Brand name
Every screen must show **"PropFlow AI"** in the sidebar header, with subtitle **"Elite Real Estate CRM"**.
Currently wrong on: WhatsApp, Settings, Add Property, Site Visits, AI Chat (showing "RealtyFlow PK / Premium CRM").

### Fix 3 — Active nav item color
The active sidebar nav item background and text must use the same pinkish/rose tint as seen on the Dashboard screen.
It must NOT use golden/amber color. Apply this consistently across all screens.

### Fix 4 — Top navigation bar (apply to all inner pages)
All inner pages (Dashboard, Properties, Clients, Pipeline, AI Chat, Site Visits, WhatsApp, Settings) must use the same top nav style:
- Left: "Dashboard | Analytics" tab links (Dashboard active by default on dashboard page, etc.)
- Center: Search bar
- Right: Bell icon + Help icon + User avatar

---

## Screen-Specific Updates

### Dashboard — use Dashboard_1 layout with these changes:
- Keep the clean spacious layout of Dashboard_1
- **Add a 4th stat card: "Deals Closed"** — show the count of closed deals (e.g. 12)
  Place it after "Active Clients" card, before the "Pipeline Value" card
- Keep the correct stage names: New Lead, Contacted, Site Visit, Negotiation, Closed
- Apply the standard top nav bar (Fix 4 above)

### Pipeline — show all 5 columns + add stage management
Currently only shows 3 columns (New Lead, Contacted, Site Visit). Negotiation and Closed are cut off.

**Fix:** Show all 5 columns with horizontal scroll:
1. New Lead (gray dot)
2. Contacted (blue dot)
3. Site Visit (yellow dot)
4. Negotiation (orange dot)
5. Closed (green dot)

**New feature — Custom stages:**
- At the end of all columns, add an **"+ Add Stage"** button (ghost/outline style)
- Each column header must have a **"⋮" (three dots) menu** on hover with options: "Rename" and "Delete"
- Clicking "Rename" shows an inline text input to rename the stage
- Clicking "+ Add Stage" opens a small modal:
  - Stage name (text input)
  - Color picker (6 preset colors: gray, blue, yellow, orange, green, red)
  - "Create Stage" button

### Client Detail — add Matched Properties tab content
The Matched Properties tab currently needs a loading/empty state plus results:
- Empty state: "No matches yet" with a "Run AI Match" button (plum, center)
- Results state (show this in the mockup): 3 property cards in a grid, each with:
  - Property photo placeholder
  - Property title + city
  - Price in Rs/Crore/Lakh
  - AI Match Score badge: green pill "92/100", yellow pill "74/100", red pill "45/100"
  - One line italic AI reason text: "Budget fits, 3 beds in DHA matches your requirements"

---

## New Screens Needed

### Screen: Sign Up (`/signup`)
Same layout style as Login but with fields:
- Agency Name (text input) — "Khan Real Estate"
- Full Name (text input) — "Ahmed Khan"
- Email (email input)
- Password (password input)
- "Create Account" button (solid plum)
- "Already have an account? Log in" link below

Use the same centered card layout as Login, same background, same Editorial Elegance theme.
NO sidebar on this screen (it's an auth page).

### Screen: Accept Invite (`/invite`)
Centered card, no sidebar:
- Heading: "You've been invited to PropFlow AI"
- Subheading: "Set up your account to join Khan Real Estate"
- Full Name (text input)
- Password (password input)
- Confirm Password (password input)
- "Join Agency" button (solid plum)

---

## Summary of All Screens Expected (15 total)

| # | Screen | Status |
|---|--------|--------|
| 1 | Login | ✅ exists — no changes needed |
| 2 | Sign Up | regenerate with fixes above |
| 3 | Accept Invite | regenerate with fixes above |
| 4 | Dashboard | update — add Deals Closed card + fix top nav |
| 5 | Properties | fix — apply Fix 1, 2, 3, 4 |
| 6 | Add Property | fix — apply Fix 1, 2, 3, 4 |
| 7 | Clients | fix — apply Fix 1, 2, 3, 4 |
| 8 | Client Detail | fix — apply Fix 1, 2, 3, 4 + add Matched Properties content |
| 9 | Pipeline | fix — Fix 1, 2, 3, 4 + all 5 columns + custom stage UI |
| 10 | AI Chat | fix — Fix 1 (dark sidebar), Fix 2 (brand name), Fix 3, Fix 4 |
| 11 | Site Visits | fix — Fix 1 (dark sidebar), Fix 2 (brand name), Fix 3, Fix 4 |
| 12 | WhatsApp | fix — Fix 1 (dark sidebar), Fix 2 (brand name), Fix 3, Fix 4 |
| 13 | Settings | fix — Fix 2 (brand name), Fix 3, Fix 4 |
