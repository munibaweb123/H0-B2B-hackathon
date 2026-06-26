# Phase 02 — Auth Screens

**Branch:** `feature/frontend/auth`
**Depends on:** `feature/frontend/foundation`
**Effort:** ~1h
**Status:** pending

---

## Architectural Role

Implements the three public (no sidebar) authentication screens. These are the entry point for every user — agency owners signing up, agents logging in, and invited agents accepting their invite. Uses the auth context from Phase 01 to store the JWT and redirect into the app.

---

## Domain Ownership

- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/invite/[token]/page.tsx`
- No sidebar layout — auth pages use a standalone centered card layout
- Visual reference: `template/stitch_creamy_professional_ui/login_propflow_ai/screen.png`, `sign_up_propflow_ai/screen.png`, `accept_invite_propflow_ai/screen.png`

---

## Explicit Boundaries

- No dashboard or protected-page content belongs here
- No email sending logic — the invite is already created by the backend; this page only accepts it
- No password reset flow — out of scope for demo
- Do not implement remember-me, OAuth, or 2FA
- Do not add a header/sidebar — `(auth)/layout.tsx` from Phase 01 is the only layout

---

## Anti-patterns

- **Do not redirect on the server** — token is client-side; all redirects happen inside `useAuth()` or `useEffect` after mount
- **Do not call `router.push` before `login()` completes** — call `login(token)` first (which sets localStorage), then redirect
- **Do not show password as plain text by default** — input type is `password`; a toggle eye icon is optional but not required
- **Do not validate beyond required fields** — no complex password rules for demo; just check non-empty
- **Do not split form state into multiple `useState` calls** — use a single object state or `react-hook-form`

---

## Core Capabilities

### 1. Login page (`/login`)
Centered card on cream background. Fields: Email, Password. "Sign In" button calls `POST /auth/login` → on success, `login(access_token)` → redirect to `/dashboard`. On error, show inline error message (e.g., "Invalid credentials"). Link to Signup.

Visual: Split layout — left half shows a brand/hero panel (dark plum), right half is the form card.

### 2. Signup page (`/signup`)
Fields: Agency Name, Full Name, Email, Password. "Create Account" calls `POST /auth/signup` → on success, `login(access_token)` → redirect to `/dashboard`. Same split layout as Login. Link back to Login.

### 3. Accept invite page (`/invite/[token]`)
Pre-fills invite token from URL param. Fields: Full Name, Password. "Accept Invite" calls `POST /auth/accept-invite` with `{ token, name, password }` → on success, `login(access_token)` → redirect to `/dashboard`.

### 4. Shared auth form styling
- Cream background (`bg-cream`), white card with rounded-xl and shadow-lg
- PropFlow wordmark at top of card in Playfair Display
- Labels in `text-text-primary`, inputs with `border-maroon-light/40 focus:ring-pink-accent`
- Submit button: `bg-pink-accent text-white hover:bg-pink-accent/90`
- Error state: red inline text below the field (not a toast)

---

## Service Interactions

**Upstream (backend):**
- `POST /auth/login` → `{ access_token }`
- `POST /auth/signup` → `{ access_token }`
- `POST /auth/accept-invite` → `{ access_token }`

**Downstream:**
- On success → redirect to `/dashboard`

---

## Architectural Constraints

- Auth pages are `'use client'` components — they need `useRouter` and `useAuth`
- Token from response goes directly into `useAuth().login(token)` — never write to localStorage manually in page components
- The `(auth)/layout.tsx` must not wrap children in `AuthProvider` (already done at root) — just apply the centered layout
- `POST /auth/accept-invite` body field names: match backend schema exactly (`token`, `name`, `password`)

---

## Definition of Done

- [ ] `/login` page renders; submitting valid credentials stores token and redirects to `/dashboard`
- [ ] `/login` page shows error message on invalid credentials (401 from backend)
- [ ] `/signup` page renders; submitting creates agency and redirects to `/dashboard`
- [ ] `/invite/[token]` page reads token from URL; submitting redirects to `/dashboard`
- [ ] All three pages use `(auth)/layout.tsx` (no sidebar visible)
- [ ] Authenticated user visiting `/login` is redirected to `/dashboard` (checked via `useAuth()` on mount)
- [ ] No TypeScript errors in auth pages
