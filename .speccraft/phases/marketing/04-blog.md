# Phase M-04 — Blog / Insights Page

**Branch:** `feature/marketing/blog`
**Depends on:** `feature/marketing/home`
**Effort:** ~1.5h
**Status:** pending

---

## Architectural Role

Public blog / insights listing page. Showcases PropFlow's thought leadership in AI-driven real estate. All article data is hardcoded static for the demo — no CMS or backend. Includes a newsletter subscribe form that optionally calls `POST /newsletter/subscribe`; a success toast is acceptable if no endpoint exists.

---

## Domain Ownership

- `app/(marketing)/blog/page.tsx` — route: `/blog`
- `components/marketing/BlogHero.tsx` — featured article banner
- `components/marketing/ArticleCard.tsx` — reusable card for the article grid
- `components/marketing/BlogSidebar.tsx` — search, subscribe, popular topics, recent posts
- `components/marketing/NewsletterForm.tsx` — client component for email subscribe
- Visual reference: `stitch/propflow_blog_page/screen.png`

---

## Explicit Boundaries

- All article data is a hardcoded static array — no `GET /blog` or CMS endpoint
- No individual article detail page (`/blog/[slug]`) — clicking "Read Article" scrolls to the card or shows a toast "Full article coming soon"
- No pagination — render all 4 hardcoded articles in the grid
- `MarketingNav` and `MarketingFooter` are inherited from `(marketing)/layout.tsx`
- Blog nav uses the same `MarketingNav` from M-01; do not build a separate blog-specific nav

---

## Anti-patterns

- **Do not fetch article data from the backend** — the backend has no blog endpoint; all content is static
- **Do not install a markdown renderer** — no MDX or `react-markdown`; article body is plain static text
- **Do not make "Read Article" links route to `/blog/[slug]`** — no detail page exists; show a toast instead
- **Do not use a sidebar layout library** — build the two-column (articles + sidebar) with Tailwind `grid grid-cols-3` / `col-span-2` + `col-span-1`

---

## Core Capabilities

### 1. Static article data
Define a `ARTICLES` array in `app/(marketing)/blog/page.tsx` or a colocated `data/articles.ts`:

```ts
const ARTICLES = [
  {
    id: "1",
    category: "AI Tips",
    categoryColor: "bg-maroon-light/20 text-maroon-dark",
    title: "5 Ways AI Converts More Leads",
    excerpt: "Explore how artificial intelligence is transforming agency workflows, from lead scoring to automated communications...",
    imageSrc: null,   // placeholder
  },
  {
    id: "2",
    category: "Market Trends",
    categoryColor: "bg-gold/20 text-maroon-dark",
    title: "Quarterly Real Estate Market Outlook",
    excerpt: "Quarterly Real Estate Market Outlook. Explore how artificial intelligence informs market trends in international...",
    imageSrc: null,
  },
  {
    id: "3",
    category: "Case Study",
    categoryColor: "bg-pink-accent/20 text-pink-accent",
    title: "Success Story: Streamlined Operations",
    excerpt: "Success Story: Success streamlined operations, alverativas and mest are a smart home device, nomations...",
    imageSrc: null,
  },
  {
    id: "4",
    category: "Tech Update",
    categoryColor: "bg-maroon-medium/20 text-maroon-dark",
    title: "New Feature: Automated Site Visit Scheduling",
    excerpt: "Explore how artificial intelligence ise visit agency workflows, from scoring to property graph anit centers new...",
    imageSrc: null,
  },
]
```

### 2. `BlogHero.tsx` — featured article banner
Full-width `bg-maroon-dark text-white` banner, `py-16 px-8 relative overflow-hidden`:
- Background: subtle building image at low opacity (`opacity-20`) or gradient overlay
- `font-serif text-4xl lg:text-5xl font-bold max-w-2xl`: "AI-Driven Real Estate: The Future of Property Management"
- Subtitle `text-white/80 mt-4 max-w-xl`: "Explore how artificial intelligence is transforming agency workflows, from lead scoring to automated communications, and unlocking new levels of efficiency."
- "Read More" button — `border border-white text-white hover:bg-white hover:text-maroon-dark rounded-full px-6 py-2 mt-6`

### 3. Two-column content area
Below the hero, `py-12 px-4 lg:px-12 max-w-7xl mx-auto`:
```
grid grid-cols-1 lg:grid-cols-3 gap-8
```
- Article grid: `lg:col-span-2` → 2-column sub-grid of `ArticleCard` components
- Sidebar: `lg:col-span-1`

### 4. `ArticleCard.tsx`
Props: `{ category, categoryColor, title, excerpt, imageSrc? }`

- `bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`
- Image area: `h-40 bg-maroon-dark/10` — if `imageSrc`, use `next/image fill`; otherwise render placeholder with `Newspaper` icon centered
- Body `p-4`:
  - Category badge: `<span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", categoryColor)}>`
  - Title: `font-serif text-maroon-dark font-semibold mt-2 text-lg leading-snug`
  - Excerpt: `text-text-muted text-sm mt-1 line-clamp-3`
  - "Read Article →" link: `text-pink-accent text-sm font-medium mt-3 inline-block hover:underline` — `onClick` shows toast "Full article coming soon"

### 5. `BlogSidebar.tsx`

**Search box:**
- Shadcn `Input` with `Search` icon inside, placeholder "Search Insights"
- Client-side: filters the article grid by title/category on change
- Extract `NewsletterForm` as `'use client'`; rest of sidebar can be server component

**Newsletter subscribe (`NewsletterForm.tsx`):**
`'use client'` — `useState` for email + sent state:
- `font-serif text-lg text-maroon-dark font-semibold mb-3`: "Subscribe to Our Newsletter"
- Subtext `text-text-muted text-sm`
- `Input type="email"` + "Subscribe" button (`bg-maroon-dark text-white rounded-lg w-full py-2`)
- On submit: call `POST /newsletter/subscribe` if endpoint exists; otherwise show toast "Subscribed!"

**Popular Topics:**
- `font-serif text-lg text-maroon-dark font-semibold mb-3`: "Popular Topics"
- Tag cloud: `flex flex-wrap gap-2`
- Each tag: `bg-cream border border-maroon-light/20 text-maroon-dark text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-maroon-dark hover:text-white`
- Topics: AI, Automation, CRM, Data, AI + Automation, Smart, Design, Tech Study

**Recent Posts:**
- `font-serif text-lg text-maroon-dark font-semibold mb-3`: "Recent Posts"
- List of last 2 article titles as `text-sm text-pink-accent hover:underline cursor-pointer` links (shows "coming soon" toast on click)

---

## Service Interactions

**Upstream (backend):**
- `POST /newsletter/subscribe` (optional) → `{ email: string }` — success toast if endpoint present; skip if not

**Downstream:** None.

---

## Architectural Constraints

- Page can be a server component — only `NewsletterForm.tsx` and the search interaction need `'use client'`
- Search filtering: lift `searchQuery` state to the page by extracting the search-filtered article list into a `'use client'` wrapper; or use URL search params with `useSearchParams` hook in a client boundary
- `line-clamp-3` requires Tailwind `@tailwindcss/line-clamp` plugin (included by default in Tailwind v3.3+) — verify it works before using; fallback: fixed height + `overflow-hidden`
- Article placeholder images: use `bg-maroon-dark/10` div with centered icon — do not fetch images from external URLs

---

## Definition of Done

- [ ] `/blog` renders without auth
- [ ] Hero banner shows featured article title and "Read More" button
- [ ] Article grid shows all 4 hardcoded articles in 2-column layout
- [ ] Each `ArticleCard` shows category badge, title, excerpt, and "Read Article" link
- [ ] "Read Article" click shows "coming soon" toast instead of navigating away
- [ ] Sidebar renders: search box, newsletter form, popular topic tags, recent posts
- [ ] Newsletter form submits and shows success toast
- [ ] Layout collapses to single column on mobile (sidebar stacks below articles)
- [ ] No TypeScript errors in this phase's files
