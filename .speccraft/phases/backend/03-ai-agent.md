# Phase 03 — AI Agent

**Branch:** `feature/backend/ai-agent`
**Dependencies:** `feature/backend/core-crm`
**Effort:** ~2–3 hours

## Architectural Role
The intelligence layer of PropFlow. Wires up the OpenAI Agents SDK to agency data, enabling property matching, conversational access to agency data, AI-written follow-up messages, natural language property search, and real-time web search via Tavily. Also handles multilingual detection and Roman Urdu responses.

## Domain Ownership
- OpenAI Agents SDK setup and agent definition
- AI property matching (rank listings against client requirements)
- AI chat interface endpoint (conversational queries over agency data)
- AI-generated follow-up message drafting (per client, personalized)
- Natural language property search ("3-bed DHA Lahore under 80 lakh")
- Tavily web search tool (plugged into agent for property hunting)
- Language detection — English in → English out; Urdu script in → Roman Urdu out
- Agent tools: query properties, query clients, query pipeline, search web

## Explicit Boundaries
<!-- What this phase does NOT touch -->

## Core Capabilities
<!-- Intent and patterns — not code -->

## Service Interactions
<!-- Upstream: core-crm (reads properties, clients, pipeline) | Downstream: integrations (autonomous deal closer uses AI output) -->

## Architectural Constraints
<!-- Phase-specific constraints only -->

## Definition of Done
<!-- Behavioral and structural checkpoints -->

## Rollback Criteria
<!-- If something goes wrong -->
