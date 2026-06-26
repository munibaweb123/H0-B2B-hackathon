# Phase 01 — Frontend Foundation

**Branch:** `feature/frontend/foundation`
**Depends on:** `feature/backend/foundation`
**Effort:** ~2h
**Status:** complete

---

## Architectural Role

Sets up the Next.js 14 project with App Router, wires the Editorial Elegance design system from `template/stitch_creamy_professional_ui/editorial_elegance/DESIGN.md` into Tailwind, and establishes the shared `<AppLayout>` (sidebar + top nav) that every authenticated inner page extends. Also creates the API client and auth context so all subsequent phases can call the backend without re-implementing fetch logic.

---

## Domain Ownership

- Next.js project scaffold under `frontend/`
- Tailwind config with Editorial Elegance color tokens and custom fonts (Playfair Display, DM Sans)
- `components/layout/AppLayout.tsx` — sidebar + top nav shell
- `components/layout/Sidebar.tsx` — dark plum nav with active pinkish item
- `components/layout/TopNav.tsx` — Dashboard|Analytics tabs, search, avatar
- `lib/api.ts` — fetch wrapper (sets `Authorization: Bearer`, base URL from `NEXT_PUBLIC_API_URL`)
- `lib/auth.tsx` — AuthContext, `useAuth()` hook, JWT stored in localStorage
- `middleware.ts` — redirects unauthenticated users to `/login`
- Shared UI primitives from Shadcn/ui (Button, Input, Badge, Card, Skeleton, Toast)

---

## Explicit Boundaries

- No business logic, API data fetching for content pages, or protected-route page content belongs here
- No auth forms (Login/Signup/Invite) — those are Phase 02
- No dashboard stats or property cards — those are Phase 03
- Sidebar nav items can be hardcoded links; their page content is built in later phases
- Do not implement any real-time features (WebSocket, polling) in this phase

---

## Anti-patterns

- **Do not use `pages/` router** — this project uses Next.js 14 App Router exclusively; mixing routers will break middleware and layouts
- **Do not prop-drill auth state** — always consume via `useAuth()` hook, never pass user/token as props between components
- **Do not create a custom fetch abstraction beyond `lib/api.ts`** — one thin wrapper is enough; service-specific logic goes in Phase 03+
- **Do not import Tailwind color strings as JS variables** — define tokens in `tailwind.config.ts` and use class names only
- **Do not use `<img>` tags** — always use `next/image` for any image rendering
- **Do not use default exports for components** — named exports only for tree-shaking and consistent imports

---

## Core Capabilities

### 1. Project scaffold
`cd` to `frontend/` (or create it) and run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`. Confirm the resulting structure is `frontend/src/app/`, `frontend/src/components/`, etc.

### 2. Tailwind + Editorial Elegance design tokens
In `tailwind.config.ts`, extend the theme with these color tokens from `DESIGN.md`:
- `maroon.dark`: `#33063C` (sidebar background)
- `maroon.medium`: `#5C1169` (sidebar hover)
- `maroon.light`: `#7d4c84` (secondary accent)
- `cream`: `#fdf9ed` (page background)
- `cream.card`: `#fef9ee` (card surface)
- `blush`: `#e8a8b4` (active nav item tint / badges)
- `pink.accent`: `#d4636b` (primary action, active text)
- `gold`: `#c9a84c` (secondary badges — use sparingly, only where templates show gold)
- `text.primary`: `#1a1a1a`
- `text.muted`: `#6b7280`

Also configure `fontFamily`:
- `serif`: `['Playfair Display', 'serif']` — headings
- `sans`: `['DM Sans', 'sans-serif']` — body

Add Google Fonts link in `src/app/layout.tsx` for both fonts.

### 3. Shadcn/ui setup
Run `npx shadcn@latest init` and install these components upfront (they're used across all phases):
`button`, `input`, `badge`, `card`, `skeleton`, `toast`, `dialog`, `dropdown-menu`, `select`, `textarea`, `tabs`, `avatar`, `separator`

Override Shadcn CSS variables in `globals.css` to match Editorial Elegance: `--primary` → `#d4636b`, `--background` → `#fdf9ed`, `--card` → `#fef9ee`.

### 4. Auth context (`lib/auth.tsx`)
- `AuthContext` holds `{ user: UserResponse | null, token: string | null, login(token), logout() }`
- JWT stored in `localStorage` under key `propflow_token`
- On mount, read token → call `GET /auth/me` → populate `user`; on 401, clear token and redirect to `/login`
- Export `AuthProvider` (wrap in root layout) and `useAuth()` hook

### 5. API client (`lib/api.ts`)
Single `apiFetch(path, options)` function:
- Prepends `process.env.NEXT_PUBLIC_API_URL` to path
- Injects `Authorization: Bearer <token>` from localStorage automatically
- Throws on non-2xx responses (parse JSON error body if available)
- Export typed helper wrappers: `apiGet<T>`, `apiPost<T>`, `apiPatch<T>`, `apiDelete`

### 6. Route groups and layouts
```
src/app/
  (auth)/          ← public pages, no sidebar
    layout.tsx     ← centered card layout, cream background
  (app)/           ← protected pages
    layout.tsx     ← AppLayout (sidebar + topnav), checks auth
  layout.tsx       ← root: AuthProvider, fonts, Toast provider
```

### 7. AppLayout components
**`Sidebar.tsx`:**
- Full-height, fixed, 256px wide, `bg-maroon-dark` (`#33063C`)
- PropFlow logo / brand name at top in white Playfair Display
- Nav items: Dashboard, Properties, Clients, Pipeline, AI Chat, WhatsApp, Site Visits, Settings
- Active item: `bg-maroon-medium text-white border-l-4 border-blush` — match Stitch template's dark active style
- Hover: `bg-maroon-medium/60`
- Icons from `lucide-react`

**`TopNav.tsx`:**
- White bar, shadow-sm, right side: search input + avatar dropdown (logout)
- Current page title as h1 on the left

### 8. Middleware
`middleware.ts` at project root:
- If path matches `(app)` group and no `propflow_token` cookie → redirect to `/login`
- Note: since token is in localStorage (client-side), middleware cannot read it — instead, the `(app)/layout.tsx` handles the client-side redirect via `useAuth()` with a loading state

### 9. Global error boundary + loading skeleton
- `src/app/error.tsx` — full-page error with retry button
- `src/app/loading.tsx` — skeleton matching the AppLayout shell

---

## Service Interactions

**Upstream (backend):**
- `GET /auth/me` — verify token on app load

**Downstream (phases that depend on this):**
- All frontend phases — consume `AppLayout`, `useAuth()`, and `lib/api.ts`

---

## Architectural Constraints

- **Next.js 14 App Router only** — no `pages/` directory, no `getServerSideProps`
- **TypeScript strict mode** — `"strict": true` in `tsconfig.json`; no `any` except in `lib/api.ts` error parsing
- **Named exports only** — `export function Sidebar()`, never `export default`; exception: Next.js page/layout files which require default exports by convention
- **No SSR for authenticated pages** — all `(app)/` pages are client components (`'use client'`) because they depend on localStorage token; `(auth)/` pages can be server components
- **Tailwind classes only** — no inline `style={{}}` except for dynamic values that cannot be expressed as Tailwind classes (e.g., dynamic widths from data)
- **`NEXT_PUBLIC_API_URL`** must be set in `.env.local` to `http://localhost:8000` for local dev; never hardcode

---

## Definition of Done

- [x] `frontend/` directory exists with Next.js 14 App Router scaffold
- [x] `tailwind.config.ts` has all Editorial Elegance color tokens; `globals.css` overrides Shadcn variables
- [x] Google Fonts (Playfair Display + DM Sans) load in browser
- [x] Shadcn/ui components init'd; `Button`, `Card`, `Badge` render with correct styling
- [x] `useAuth()` hook returns user after page load when valid token is in localStorage
- [x] `apiFetch` sends `Authorization: Bearer` header; returns typed response; throws on 4xx/5xx
- [x] `(app)/layout.tsx` renders Sidebar + TopNav shell
- [x] Sidebar shows dark plum background; active nav item shows blush left border
- [x] Unauthenticated visit to `/dashboard` redirects to `/login`
- [x] No TypeScript errors (`tsc --noEmit` passes)
- [x] Dev server starts with `npm run dev` and loads at `localhost:3000`

---

## Rollback Criteria

- If Next.js version conflicts with any Shadcn/ui component, pin `next` to `14.2.x` and re-run init
- If Tailwind v4 is installed by default (create-next-app may), downgrade to Tailwind v3 — Shadcn/ui 2.x targets v3
- If Google Fonts are blocked in the environment, use `next/font/google` which self-hosts fonts automatically
