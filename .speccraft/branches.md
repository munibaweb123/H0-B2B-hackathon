# Branch Map

## Backend

| Phase | Branch | Depends On | Status |
|---|---|---|---|
| 01 — Foundation | `feature/backend/foundation` | — | ✅ complete |
| 02 — Core CRM | `feature/backend/core-crm` | `feature/backend/foundation` | ✅ complete |
| 03 — AI Agent | `feature/backend/ai-agent` | `feature/backend/core-crm` | ✅ complete |
| 04 — Integrations | `feature/backend/integrations` | `feature/backend/ai-agent` | ✅ complete |

## Frontend

| Phase | Branch | Depends On | Status |
|---|---|---|---|
| 01 — Foundation | `feature/frontend/foundation` | `feature/backend/foundation` | ✅ complete |
| 02 — Auth | `feature/frontend/auth` | `feature/frontend/foundation` | ✅ complete |
| 03 — Dashboard & Properties | `feature/frontend/dashboard-properties` | `feature/frontend/auth` | ✅ complete |
| 04 — Clients & Pipeline | `feature/frontend/clients-pipeline` | `feature/frontend/dashboard-properties` | ✅ complete |
| 05 — AI & Integrations | `feature/frontend/ai-integrations` | `feature/frontend/clients-pipeline` | ✅ complete |
