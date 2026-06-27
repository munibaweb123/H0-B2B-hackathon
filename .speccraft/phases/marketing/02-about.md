# Phase M-02 — About Page

**Branch:** `feature/marketing/about`
**Depends on:** `feature/marketing/home`
**Effort:** ~1h
**Status:** pending

---

## Architectural Role

Static public page describing PropFlow's mission, origin story, and team. Uses the same marketing nav and footer shell established in Phase M-01. No backend calls — all team data is hardcoded for the demo.

---

## Domain Ownership

- `app/(marketing)/about/page.tsx` — route: `/about`
- `components/marketing/MissionSection.tsx`
- `components/marketing/StoryTimeline.tsx`
- `components/marketing/TeamGrid.tsx`
- `components/marketing/TeamCard.tsx`
- Visual reference: `stitch/propflow_about_page/screen.png`

---

## Explicit Boundaries

- No dynamic data fetch — team members and story milestones are hardcoded static arrays
- No CMS integration — not needed for demo
- `MarketingNav` and `MarketingFooter` are inherited from `(marketing)/layout.tsx` (Phase M-01); do not re-declare them here
- No "Join Our Team" form — out of scope

---

## Anti-patterns

- **Do not pull team member data from `GET /agency/agents`** — that endpoint returns the signed-in agency's team, not PropFlow's own team; this page is static marketing copy
- **Do not use a third-party timeline library** — build the milestone timeline with plain Tailwind (vertical line + circles)
- **Do not add `'use client'`** to the page or section components — everything here is static and can be a server component

---

## Core Capabilities

### 1. Page header
Full-width cream section, `py-20 text-center`:
- `font-serif text-5xl text-maroon-dark font-bold`: "About PropFlow"
- Subtitle in `text-text-muted text-lg mt-3`: "Transforming property data into actionable insights"

### 2. `MissionSection.tsx`
Centered card, `bg-cream py-16 text-center max-w-2xl mx-auto`:
- Brain icon (`Brain` from `lucide-react`) in a `bg-pink-accent/10 text-pink-accent` rounded circle, `w-16 h-16 mx-auto mb-6`
- `font-serif text-3xl text-maroon-dark`: "Our Mission"
- Body text: "To empower real estate professionals with the most advanced AI tools, making data-driven decisions simpler and more effective, giving you the competitive edge."

### 3. `StoryTimeline.tsx`
Two-column layout (`lg:grid-cols-2`) with a `gap-12`, `py-16 bg-white`:
- **Left column:** story paragraphs
  - `font-serif text-2xl text-maroon-dark mb-6`: "Our Story"
  - Para 1: "Founded by a team of data scientists and real estate experts, PropFlow was born from a shared vision to bridge the gap between complex market data and practical business growth."
  - Para 2: Short expansion paragraph (from template copy)
- **Right column:** vertical milestone timeline
  - Each milestone: circle dot (`bg-maroon-dark rounded-full w-10 h-10`) + connecting vertical line (`border-l-2 border-maroon-light ml-5`) + label on the right
  - Milestones (from template):
    1. **Inception (2023)** — icon: `Building2`
    2. **AI Integration (2024)** — icon: `Brain`
    3. **Market Leader (2025)** — icon: `TrendingUp`
  - Active/latest milestone dot uses `bg-pink-accent`

### 4. `TeamGrid.tsx` + `TeamCard.tsx`
`bg-cream py-16`:
- `font-serif text-3xl text-maroon-dark text-center mb-10`: "The Team"
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto`

**`TeamCard.tsx`** props: `{ name, title, imageSrc? }`:
- `bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center`
- Avatar: `next/image` circular `w-20 h-20 rounded-full object-cover mx-auto mb-4`; fallback to `bg-maroon-light/20` circle with initials
- Name in `font-serif text-maroon-dark font-semibold`
- Title in `text-text-muted text-sm mt-1`

Hardcoded team (from template):
```ts
[
  { name: "Jane Doe",        title: "CEO & Co-Founder"           },
  { name: "John Smith",      title: "CTO"                        },
  { name: "Maria Rodriguez", title: "Head of Data Science"       },
  { name: "David Lee",       title: "Lead Real Estate Strategist"},
]
```

---

## Service Interactions

**Upstream (backend):** None.

**Downstream:** None.

---

## Architectural Constraints

- Page uses `(marketing)/layout.tsx` from Phase M-01 — ensure `(marketing)/` route group exists before this phase
- `TeamCard` must accept an optional `imageSrc` prop — when absent, render a monogram fallback (first letters of first and last name) in a `bg-maroon-light/20 text-maroon-dark` circle
- Milestone icons in `StoryTimeline` must be `lucide-react` — do not install an icon library

---

## Definition of Done

- [ ] `/about` renders without auth
- [ ] Page header "About PropFlow" and subtitle visible
- [ ] Mission section shows brain icon + mission text
- [ ] Story timeline renders 3 milestones with connecting vertical line
- [ ] Team grid shows 4 members in a responsive 4-column → 2-column → 1-column layout
- [ ] `TeamCard` shows name and title; renders monogram fallback when no image
- [ ] `MarketingNav` and `MarketingFooter` are inherited (not re-implemented)
- [ ] No TypeScript errors in this phase's files
