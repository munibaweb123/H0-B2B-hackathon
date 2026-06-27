# PropFlow AI

AI-powered CRM for Pakistani real estate agencies. Manages listings, clients, and the full sales pipeline — with an autonomous deal closer that pitches matched clients via WhatsApp the moment a new property is listed.

---

## What It Does

- **Multi-tenant agency workspace** — each agency's data is fully isolated
- **Property & client management** — CRUD with location auto-fill via Google Places
- **AI property matching** — instantly ranks listings against a client's budget, city, and requirements
- **Sales pipeline** — Kanban: New Lead → Contacted → Site Visit → Negotiation → Closed
- **Autonomous deal closer** — new property listed → AI finds matched clients → sends personalized WhatsApp pitches → logs interactions
- **AI chat interface** — ask questions about your agency's data in English or Urdu
- **WhatsApp integration** — inbound messages and voice notes processed by AI; replies sent automatically
- **Voice note transcription** — Whisper transcribes Urdu/English audio, AI responds in the same language
- **Multilingual** — English in → English out; Urdu script in → Roman Urdu out
- **Email automation** — AI-drafted follow-ups sent via Resend
- **Site visit slot booking** — agents set availability, clients pick slots

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLModel |
| Database | Amazon Aurora DSQL (serverless PostgreSQL, IAM auth) |
| AI | OpenAI Agents SDK (`gpt-4o`), Whisper-1 |
| Web Search | Tavily API |
| WhatsApp | Meta Business API (httpx, no pywa) |
| Email | Resend |
| Location | Google Places API |
| Package Manager | uv |
| Frontend | Next.js (Vercel) |

---

## Project Structure

```
H0-B2B-hackathon/
├── backend/
│   └── src/backend/
│       ├── core/           # Config, DB connection, auth (JWT + bcrypt)
│       ├── models/         # SQLModel table classes (Agency, TeamMember, Property, Client, ...)
│       ├── routers/        # Auth, properties, clients, dashboard
│       ├── schemas/        # Pydantic request/response models
│       ├── services/       # Business logic (property_service, client_service, ...)
│       ├── ai/             # OpenAI Agents SDK — agent, tools, router
│       ├── integrations/   # WhatsApp, Whisper, email, deal closer, slots, Google Places
│       └── main.py         # App entry point
├── .env                    # Secrets (not committed)
└── .speccraft/             # Phase specs and branch map
```

---

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (`pip install uv`)
- AWS account with Aurora DSQL cluster
- OpenAI API key
- Meta WhatsApp Business API credentials
- Tavily API key (optional — web search)
- Resend API key (optional — email)
- Google Places API key (optional — location autocomplete)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd H0-B2B-hackathon/backend
uv sync
```

### 2. Configure environment

Create `.env` in the project root (`H0-B2B-hackathon/.env`):

```env
# Aurora DSQL
DSQL_ENDPOINT=<your-cluster>.dsql.us-east-1.on.aws
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret>

# Auth
SECRET_KEY=<random-secret-min-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp (Meta Business API)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v19.0
WHATSAPP_APP_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_CALLBACK_URL=https://<your-ngrok-or-domain>/whatsapp/webhook
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# Email
RESEND_API_KEY=

# Google Places
GOOGLE_PLACES_API_KEY=

# Tavily (web search)
TAVILY_API_KEY=
```

### 3. Create database tables

Run once on first deploy:

```bash
cd backend
uv run python -c "import asyncio; from backend.core.database import create_tables; asyncio.run(create_tables())"
```

### 4. Start the server

```bash
cd backend
uv run uvicorn backend.main:app --reload
```

> Note: First startup takes ~22 seconds — Aurora DSQL warms the IAM token on first connection.

API docs available at `http://localhost:8000/docs`

---

## API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create agency + owner account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Current user info |
| POST | `/auth/invite` | Invite a team member |
| POST | `/auth/accept-invite` | Accept invite + set password |

### Properties
| Method | Path | Description |
|---|---|---|
| POST | `/properties` | Add a listing |
| GET | `/properties` | List all (filterable by city, type, price, bedrooms) |
| GET | `/properties/{id}` | Get one |
| PATCH | `/properties/{id}` | Update |
| DELETE | `/properties/{id}` | Delete |

### Clients
| Method | Path | Description |
|---|---|---|
| POST | `/clients` | Add a client |
| GET | `/clients` | List all |
| GET | `/clients/{id}` | Get one |
| PATCH | `/clients/{id}` | Update |
| DELETE | `/clients/{id}` | Delete |
| PATCH | `/clients/{id}/stage` | Advance pipeline stage (sequential only) |
| POST | `/clients/{id}/interactions` | Log an interaction |
| GET | `/clients/{id}/interactions` | List interactions |

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Agency stats (listings, clients, pipeline value, deals closed) |

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/ai/chat` | Conversational AI with tools (English or Roman Urdu) |
| POST | `/ai/match/{client_id}` | Rank all listings against a client's requirements |
| POST | `/ai/draft-followup/{client_id}` | Generate personalized WhatsApp/email message |
| POST | `/ai/search` | Natural language property search ("3-bed DHA Lahore under 80 lakh") |

### Integrations
| Method | Path | Description |
|---|---|---|
| GET | `/places/autocomplete` | Google Places location suggestions (Pakistan) |
| GET | `/whatsapp/webhook` | Meta webhook verification |
| POST | `/whatsapp/webhook` | Inbound messages + voice notes |
| POST | `/whatsapp/send` | Send a WhatsApp message to a client |
| POST | `/deal-closer/{property_id}` | Trigger autonomous deal closer |
| POST | `/email/followup/{client_id}` | Send AI-drafted email via Resend |
| GET | `/slots` | List available site visit slots |
| POST | `/slots` | Create a slot |
| POST | `/slots/{slot_id}/book` | Book a slot for a client |

---

## Key Design Decisions

**Aurora DSQL constraints** — no ENUMs, no indexes, no UNIQUE constraints, no foreign keys, no multi-DDL transactions. All enforced in application code.

**Tenant isolation** — `tenant_id` comes from `get_current_user` (JWT), never from request body or LLM output. Every DB query filters by `tenant_id`.

**AI tools** — `RunContextWrapper[AgentContext]` injects `tenant_id` + `session` into every tool call. The LLM cannot cross tenant boundaries.

**WhatsApp webhook** — no pywa; direct Meta Graph API via httpx. Signature verified with HMAC-SHA256 against `WHATSAPP_APP_SECRET`.

**Deal closer** — synchronous, inline execution. Pitches generated concurrently with `asyncio.gather()`. Each pitch logged as an interaction.

**Language detection** — Unicode range U+0600–U+06FF (Urdu/Arabic script) detected pre-LLM. Urdu → Roman Urdu reply injected into agent system prompt.

---

## Aurora DSQL Notes

Aurora DSQL uses IAM authentication instead of a static password:

- Token generated via `boto3.client("dsql").generate_db_connect_admin_auth_token()`
- First call takes ~22s (AWS SDK init) — pre-warmed at server startup
- Token cached for 900s; refreshed 60s before expiry
- `pool_recycle=800` ensures connections are recycled before token expiry

---

## WhatsApp Setup

1. Create a Meta Business App at [developers.facebook.com](https://developers.facebook.com)
2. Add WhatsApp product, configure phone number
3. Set webhook URL to `https://<your-domain>/whatsapp/webhook`
4. Set verify token to match `WHATSAPP_VERIFY_TOKEN` in `.env`
5. Subscribe to `messages` webhook field
6. For local development, use [ngrok](https://ngrok.com): `ngrok http 8000`
