# Phase M-01 — Marketing Home Page

**Branch:** `feature/marketing/home`
**Depends on:** `feature/frontend/foundation`
**Effort:** ~1.5h
**Status:** pending

---

## Architectural Role

Public-facing landing page — the first screen a prospective agency sees before signing up. Lives outside the `(app)/` auth group. Drives conversions via a "Get Started" CTA that links to `/signup`. No backend data fetched; all content is static.

---

## Domain Ownership

- `app/(marketing)/page.tsx` — route: `/`
- `app/(marketing)/layout.tsx` — marketing layout: public nav + footer, no sidebar
- `components/marketing/MarketingNav.tsx` — logo + nav links + CTA button
- `components/marketing/MarketingFooter.tsx` — logo, nav links, social icons
- `components/marketing/HeroSection.tsx`
- `components/marketing/FeaturesStrip.tsx`
- `components/marketing/HighlightSection.tsx`
- `components/marketing/HowItWorksSection.tsx`
- `components/marketing/CtaBanner.tsx`
- Visual reference: `stitch/propflow_home_page/screen.png`

---

## Explicit Boundaries

- No backend API calls — all content is static copy and images
- No auth state check — this page is always public; do not redirect logged-in users
- No pricing table — that is out of scope for the hackathon demo
- No animations beyond CSS transitions — no Framer Motion or GSAP
- `(marketing)/layout.tsx` shares nothing with `(app)/layout.tsx` — different nav, no sidebar

---

## Anti-patterns

- **Do not reuse `AppLayout`** — marketing pages have their own public nav/footer shell; AppLayout has a sidebar that must not appear here
- **Do not use `next/image` with external URLs without configuring `next.config.js` domains** — use a local building placeholder or a relative path; do not hotlink external images
- **Do not hardcode `#33063C` etc. in style attributes** — always use the design token class names (`bg-maroon-dark`, `bg-cream`, etc.) already in `tailwind.config.ts`
- **Do not add a `'use client'` directive to the home page** — it is a server component; only extract interactive sub-components (e.g., mobile menu toggle) as client components if needed

---

## Core Capabilities

### 1. Marketing layout (`(marketing)/layout.tsx`)
Wraps all marketing pages in:
- `<MarketingNav />` at the top
- `<main>{children}</main>`
- `<MarketingFooter />` at the bottom
- Root background: `bg-cream`

### 2. `MarketingNav.tsx`
- Left: PropFlow logo in `font-serif text-maroon-dark`
- Center: nav links — Features, How it Works, Pricing, Contact (anchor-scrolled or page routes)
- Right: "Get Started" button — `bg-pink-accent text-white rounded-full px-5 py-2` → links to `/signup`
- Mobile: hamburger menu (hidden on `lg:`)
- Sticky (`sticky top-0 z-50 bg-cream/95 backdrop-blur-sm shadow-sm`)

### 3. Hero section
Two-column flex on desktop, stacked on mobile:
- **Left (`flex-1`, `bg-cream`, `px-8 py-16 lg:px-16`):**
  - `font-serif text-4xl lg:text-5xl text-maroon-dark font-bold` headline: "Close more deals with AI-powered insights"
  - Subtext (`text-text-muted`): "PropFlow AI transforms complex property data into clear, actionable insights for real estate professionals."
  - "Get Started" CTA button → `/signup`
- **Right (`flex-1`):**
  - Full-bleed building photo (`/images/hero-building.jpg` or a Next.js placeholder); `object-cover h-full`
  - If no photo: `bg-maroon-dark/10` placeholder with a `Building2` icon centered

### 4. Features strip
`bg-maroon-dark` full-width band below the hero. Three columns, each with:
- Icon (white `lucide-react` icon in a circle)
- Bold white title
- Muted white subtext

Features (from Stitch template):
1. **AI-Powered Matching** — "Faster client connections with intelligent recommendations" (icon: `Search`)
2. **Multilingual Support** — "Communicate effectively with global clients in real-time" (icon: `MessageSquare`)
3. **Market Trends Analysis** — "Stay ahead with predictive analytics and local data" (icon: `TrendingUp`)

### 5. Highlight section
Two-column card on `bg-cream`, centered:
- **Left cell (`bg-pink-accent text-white`, `p-10 rounded-l-2xl`):**
  - `font-serif text-3xl`: "AI sanity in powered data" (exact copy from template)
- **Right cell (`bg-white`, `p-10 rounded-r-2xl border border-gray-100`):**
  - Body text: "PropFlow AI transforms complex property data into clear, actionable insights for real estate professionals."
  - "Get Started" button → `/signup`

### 6. How it Works section
`bg-cream`, centered, `py-20`:
- `font-serif text-3xl text-maroon-dark` heading: "How it Works"
- Three-column step grid:
  1. Icon in `bg-maroon-dark rounded-full p-4 text-white` → **Connect Your Data** — "Integrate your listings and CRM."
  2. Same icon style → **AI Analysis** — "Our platform processes and delivers insights."
  3. Same icon style → **Close More Deals** — "Utilize actionable intelligence to win."
- Icons: `Database`, `Brain`, `Handshake` from `lucide-react`

### 7. CTA banner
`bg-maroon-dark text-white`, full-width, `py-20 text-center`:
- `font-serif text-4xl`: "Ready to transform your agency?"
- "Get Started" button — white bg, `text-maroon-dark` → `/signup`

### 8. `MarketingFooter.tsx`
`bg-maroon-dark text-white`, horizontal flex:
- Left: PropFlow logo
- Center: Privacy Policy | Terms of Service links
- Right: social icons (Facebook `Facebook`, Instagram `Instagram`, Twitter `Twitter` from `lucide-react`)

---

## Service Interactions

**Upstream (backend):** None — fully static page.

**Downstream:**
- "Get Started" CTA links to `(auth)/signup/page.tsx` (Phase FE-02)

---

## Architectural Constraints

- Route group `(marketing)/` must not conflict with `(app)/` or `(auth)/` — Next.js resolves these independently via layout nesting
- `(marketing)/layout.tsx` must NOT wrap children in `<AuthProvider>` or any auth gate
- All text copy must match the Stitch template exactly — do not paraphrase headlines
- Hero image: use `next/image` with `fill` and `sizes` prop; add the image domain to `next.config.js` if loading from an external URL
- No `useRouter` or `useState` in the page itself — server component; extract any interactive piece into a named client component

---

## Definition of Done

- [ ] `/` route renders the home page without auth
- [ ] `MarketingNav` shows logo, nav links, and Get Started button; does not show app sidebar
- [ ] Hero section shows headline and building image (or placeholder)
- [ ] Features strip shows 3 feature columns on `bg-maroon-dark`
- [ ] Highlight section renders two-column card with CTA
- [ ] "How it Works" shows 3 numbered steps with icons
- [ ] CTA banner renders with correct maroon background and white text
- [ ] `MarketingFooter` shows logo, links, social icons
- [ ] "Get Started" buttons on all sections link to `/signup`
- [ ] Page is responsive — stacks to single column on mobile
- [ ] No TypeScript errors in this phase's files
