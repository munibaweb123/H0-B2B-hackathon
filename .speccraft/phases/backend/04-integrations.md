# Phase 04 — Integrations

**Branch:** `feature/backend/integrations`
**Dependencies:** `feature/backend/ai-agent`
**Effort:** ~2–3 hours

## Architectural Role
Connects PropFlow to the external world. Wires up WhatsApp (inbound webhook + outbound messaging), voice note transcription, email automation, and the autonomous deal closer trigger. Also delivers the agency dashboard aggregations and Google Places proxy for location auto-fill.

## Domain Ownership
- Meta WhatsApp Business API — inbound webhook (receive messages + voice notes) and outbound messaging (send pitches, reply to clients)
- OpenAI Whisper API — transcribe voice notes forwarded via WhatsApp
- Resend — send automated follow-up emails (post-visit, no-contact, new match)
- Autonomous deal closer — trigger on new property listed → AI matches clients → sends WhatsApp pitches → handles interest reply → books site visit slot → notifies agent
- In-app slot picker — agent sets available times, client picks, agent notified
- Agency dashboard — aggregation endpoints (listings count, active clients, pipeline value by stage, deals closed)
- Google Places API proxy — location autocomplete endpoint for frontend forms

## Explicit Boundaries
<!-- What this phase does NOT touch -->

## Core Capabilities
<!-- Intent and patterns — not code -->

## Service Interactions
<!-- Upstream: ai-agent (match results, generated messages) + core-crm (property/client data) | Downstream: frontend consumes all endpoints -->

## Architectural Constraints
<!-- Phase-specific constraints only -->

## Definition of Done
<!-- Behavioral and structural checkpoints -->

## Rollback Criteria
<!-- If something goes wrong -->
