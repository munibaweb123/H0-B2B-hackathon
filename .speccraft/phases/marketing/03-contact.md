# Phase M-03 — Contact Page

**Branch:** `feature/marketing/contact`
**Depends on:** `feature/marketing/home`
**Effort:** ~1h
**Status:** complete

---

## Architectural Role

Two-column public contact page. Left column collects a lead inquiry via a form; right column shows company contact details on a `bg-maroon-dark` panel. On form submit, calls `POST /contact` (or sends via Resend if endpoint exists); for demo, a success state is sufficient if no backend endpoint is wired.

---

## Domain Ownership

- `app/(marketing)/contact/page.tsx` — route: `/contact`
- `components/marketing/ContactForm.tsx` — controlled form, client component
- `components/marketing/ContactInfoPanel.tsx` — right-side static info panel
- Visual reference: `stitch/propflow_contact_page/screen.png`

---

## Explicit Boundaries

- The form submits to `POST /contact` if that endpoint is built; otherwise show a static success toast on submit (no backend call)
- No map embed — the Stitch template shows a map placeholder; for the demo render a styled placeholder card (`bg-maroon-medium/20 rounded-xl h-48 flex items-center justify-center text-text-muted`) with "Map coming soon"
- No reCAPTCHA or bot protection — not needed for a hackathon demo
- `MarketingNav` and `MarketingFooter` are inherited from `(marketing)/layout.tsx`

---

## Anti-patterns

- **Do not use a `<form>` server action for this page** — `ContactForm.tsx` must be a `'use client'` component because it uses `useState` for field tracking and success state
- **Do not call `POST /auth/invite` or `POST /auth/signup` from this form** — the contact form is a general inquiry, not a signup flow
- **Do not show the full right panel in a modal** — both columns must be visible simultaneously on desktop as a side-by-side split

---

## Core Capabilities

### 1. Split layout
Full-height two-column flex on `lg:`, stacked on mobile:
- Left column: `flex-1 bg-cream px-8 py-16 lg:px-16`
- Right column: `flex-1 bg-maroon-dark px-8 py-16 lg:px-16`

### 2. `ContactForm.tsx` (left column)
`'use client'` — uses `useState` for fields + submission state.

Heading:
- `font-serif text-4xl text-maroon-dark font-bold mb-2`: "Contact Us"
- Subtitle `text-text-muted mb-8`: "Get in touch with our team to elevate your agency with AI."

Fields (single `useState` object):
- **Full Name** (text, required) — `w-full`
- **Email Address** (email, required) — `w-full`
- Full Name and Email in a two-column row on `sm:`
- **Agency Name** (text, optional) — full width
- **Message** (textarea, `rows={5}`, required) — full width

All inputs use Shadcn `Input` / `Textarea` with `border-maroon-light/30 focus:ring-pink-accent` styling.

Submit button: `w-full bg-pink-accent hover:bg-pink-accent/90 text-white rounded-lg py-3` — "Send Message"

**On submit:**
1. Validate required fields; show inline `text-pink-accent text-sm` errors below empty fields
2. If `POST /contact` endpoint exists: call it with `{ name, email, agency_name, message }` → success toast "Message sent! We'll be in touch shortly."
3. If no endpoint: skip API call, directly show the success toast
4. Reset form fields after success

### 3. `ContactInfoPanel.tsx` (right column)
Static, server component. All text `text-white`.

Sections (from Stitch template):
- **Brand:** `font-serif text-4xl font-bold mb-8`: "PropFlow AI"

- **Our Office:**
  - `MapPin` icon inline
  - `font-serif text-xl font-semibold mb-2`: "Our Office"
  - Address text: "123 Innovation Way, Suite 400, Cityville, ST 12345"

- **Email Us:**
  - `Mail` icon inline
  - `font-serif text-xl font-semibold mb-2`: "Email Us"
  - `text-blush underline`: "hello@propflow.ai"

- **Social Media:**
  - `font-serif text-xl font-semibold mb-3`: "Social Media"
  - Row of icon buttons: `Linkedin`, `Twitter`, `Instagram` from `lucide-react`, each `w-10 h-10 bg-maroon-medium rounded-full flex items-center justify-center hover:bg-maroon-light`

- **Map placeholder:**
  - `bg-maroon-medium/40 rounded-xl h-44 mt-6 flex items-center justify-center text-white/50 text-sm`: "Map · 123 Innovation Way"

---

## Service Interactions

**Upstream (backend):**
- `POST /contact` (optional) → `{ name, email, agency_name, message }` — if endpoint exists, use it; otherwise show success state without API call

**Downstream:** None.

---

## Architectural Constraints

- `ContactForm.tsx` must be `'use client'` — it owns form state and the submit handler
- `ContactInfoPanel.tsx` is a server component — no hooks, no state
- Page file `app/(marketing)/contact/page.tsx` renders both as sibling children inside the split layout — no shared state between them needed
- Submit button must be disabled + show loading spinner while the API call is in flight (if endpoint is wired)
- No external map SDK (Google Maps JS API) — placeholder div only for demo

---

## Definition of Done

- [x] `/contact` renders without auth
- [x] Two-column split: cream form left, maroon info panel right
- [x] Form has Full Name, Email, Agency Name, Message fields
- [x] Required field validation shows inline error messages
- [x] Submit button shows loading state during submission
- [x] Success toast appears after submit; form resets
- [x] Right panel shows Office address, Email, Social icons, Map placeholder
- [x] Layout stacks single-column on mobile
- [x] No TypeScript errors in this phase's files
