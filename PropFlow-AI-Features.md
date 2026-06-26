# PropFlow AI — Project Requirements Document

**Prepared for:** Development Team
**Project Name:** PropFlow AI
**Type:** Multi-Tenant B2B SaaS Platform

---

## Executive Summary

PropFlow AI is an intelligent real estate agency management platform built specifically for the Pakistani market. It gives real estate agencies a single place to manage their properties, clients, and deals — while an AI agent works in the background to match properties, send follow-ups, and hunt new opportunities around the clock.

The platform is designed around one core belief: agents should spend their time closing deals, not managing chaos.

---

## The Problem

Pakistan has over 50,000 real estate agencies. The vast majority run their entire business through WhatsApp groups, Excel sheets, and paper diaries. There is no affordable, locally-built CRM that understands how Pakistani agents work, how they communicate, and what they need.

The result:

- Client details get lost when agents change phones or leave the agency
- Properties are manually matched to clients, taking hours of work
- Follow-ups are forgotten because there is no system to track them
- Agency owners have no visibility into how their team is performing
- Deals fall through simply because no one followed up in time

---

## The Solution

PropFlow AI is a platform where every part of the sales process — from listing a property to closing a deal — is managed in one place, with an AI agent that actively works to move deals forward without waiting for a human to initiate.

---

## Core Features

### 1. Agency Workspace & Team Management

When an agency signs up, PropFlow creates a private workspace exclusively for that agency. The agency owner can invite agents and team members, assign roles, and ensure everyone works from the same shared platform.

No two agencies can see each other's data. Every workspace is completely private and isolated.

---

### 2. Property Listings Management

Agents can add, edit, and manage all property listings in one place. Each listing stores the full details — location, price, size, number of rooms, photos, and any additional notes.

Properties can be searched and filtered instantly, so finding the right listing takes seconds instead of minutes of scrolling through WhatsApp chats.

---

### 3. Client Management

Every client gets a dedicated profile — name, contact number, budget, preferred area, and property requirements. All interactions and updates are stored against that profile so any agent in the team can pick up where another left off.

No client detail is ever lost, even when agents leave or change devices.

---

### 4. AI Property Matching

When a new client is added, PropFlow automatically scans all listings and identifies the properties that best match that client's requirements — based on budget, location preference, property type, and size.

Agents are presented with ranked matches instantly, eliminating the need to manually go through hundreds of listings.

---

### 5. Sales Pipeline

A visual board that shows every active deal and exactly where it stands. Deals move through the following stages:

- **New Lead** — initial interest received
- **Contacted** — agent has reached out
- **Site Visit** — client has visited the property
- **Negotiation** — price and terms under discussion
- **Closed** — deal successfully completed

At any point, agents and owners can see the full picture of what is in progress and what needs attention.

---

### 6. Automated Follow-Up Messages

PropFlow AI writes personalized follow-up messages for each client based on their profile, their requirements, and the properties they have shown interest in. These are not templates — each message is written specifically for that client.

Agents review and send. The message goes out over WhatsApp or email, fitting naturally into how agents already communicate.

---

### 7. Autonomous Deal Closer

This is the defining feature of PropFlow AI.

When a new property is listed, PropFlow immediately identifies the clients who are the best match, writes a personalized pitch for each one, and sends those messages automatically over WhatsApp — without the agent needing to do anything.

When a client replies with interest, PropFlow responds with available site visit slots. When the client confirms a slot, the agent's calendar is updated automatically.

The agent's role is to show up, present the property, and close. Everything before that moment is handled.

---

### 8. AI Chat Interface

A conversational interface inside PropFlow where agents and owners can ask questions and get things done through natural conversation — like having a colleague who knows everything about the agency.

Examples of what agents can ask:

- *"Which of my clients would be interested in this new listing?"*
- *"Draft a follow-up message for Ahmed"*
- *"Who hasn't been contacted in the last 7 days?"*
- *"What is the total value of deals in negotiation right now?"*
- *"Summarize everything we know about Sara Malik"*

PropFlow responds based on that agency's own data — not generic answers. Every other feature in the platform is accessible through this single conversation window.

---

### 9. WhatsApp as the Primary Interface

Agents are not required to use a web app to benefit from PropFlow. They can interact with the platform entirely through WhatsApp:

- Forward a client's message → PropFlow reads it and creates or updates that client's profile
- Forward a client's voice note → PropFlow listens, extracts the requirements, and saves them
- Ask a question in WhatsApp → PropFlow replies with the answer or takes the action

The web platform is available for agency owners who want a complete view of the business. For agents on the ground, PropFlow works inside the tool they already use every day.

---

### 10. Voice Note Understanding

Agents receive voice notes from clients constantly. Instead of listening to each one and manually entering the requirements, agents simply forward the voice note to PropFlow.

PropFlow listens to the note, understands what the client is asking for, and automatically saves the requirements to that client's profile. If any clarification is needed, PropFlow flags it.

---

### 11. Multilingual AI — Speaks the Way Your Team Does

PropFlow automatically detects the language of every incoming message and replies in the same language:

- Type in English → PropFlow replies in English
- Type in Urdu script → PropFlow replies in Roman Urdu (*"Bhai yeh property Ahmed ke budget mein fit hoti hai, visit arrange kar dein?"*)
- Send a voice note in Urdu → PropFlow transcribes it and replies in Roman Urdu the same way

No language settings to configure. The AI adapts automatically to however the agent or client communicates.

---

### 12. Email Automation

Alongside WhatsApp, PropFlow sends automated follow-up emails to clients at the right moments — after a site visit, after a period of no contact, or when a new matching property is listed.

Emails are written by the AI and personalized to each client, maintaining a professional and consistent communication standard across the agency.

---

### 13. Agency Dashboard

A live summary of agency performance visible to the owner and senior agents:

- Total properties listed
- Number of active clients
- Deals at each pipeline stage
- Total value of deals in progress
- Deals closed this month

Everything in one view, always up to date, without needing to ask anyone or pull a report.

---

### 14. Location Auto-Fill

When adding a property or saving a client's preferred area, PropFlow suggests and auto-completes location names as the agent types. Typing "DHA" immediately surfaces options like "DHA Phase 5, Lahore" or "DHA Phase 2, Islamabad" — the agent selects and moves on.

This ensures location data is consistent across the entire platform. Clean location data means accurate property matching, reliable search results, and a pipeline that makes sense at a glance.

---

### 15. Smart Natural Language Search

Agents can search for properties by typing naturally instead of filling in filter forms:

*"3-bedroom house in DHA Lahore under 80 lakh"*

PropFlow understands the query and returns matching listings immediately. It works the way people think, not the way databases are structured.

---

## Optional Features

The following features are considered stretch goals. They will be built if time and resources allow, but are not part of the core delivery commitment.

---

### 15. AI Web Search for Property Hunting *(Optional)*

PropFlow's AI agent can search the web in real time to find properties listed on Zameen.com, OLX, and other platforms that match a specific client's requirements.

When a match is found, the agent is notified immediately with a summary — giving them the opportunity to reach the seller before any competing agency does.

This turns PropFlow from a management tool into an active deal-sourcing engine.

---

### 16. Deal Probability Score *(Optional)*

Every client in the pipeline receives a live probability score showing how likely they are to close a deal in the near term.

PropFlow calculates this based on engagement signals — how quickly they reply, how many properties they have enquired about, how long they have been active, and how their behaviour has changed over time.

**Example: Ahmed Al-Farooqi — 84% likely to close this week.**

Agents focus their energy on the clients who are ready to act, not on guessing who to call next.

---

## Scope Summary

### In Scope

| # | Feature |
|---|---|
| 1 | Agency workspace and team management |
| 2 | Property listings management |
| 3 | Client management |
| 4 | AI property matching |
| 5 | Sales pipeline |
| 6 | Automated follow-up messages |
| 7 | Autonomous deal closer |
| 8 | AI chat interface |
| 9 | WhatsApp as primary interface |
| 10 | Voice note understanding |
| 11 | Multilingual AI (English, Urdu, Roman Urdu) |
| 12 | Email automation |
| 13 | Agency dashboard |
| 14 | Location auto-fill |
| 15 | Smart natural language search |

### Out of Scope

| # | Feature | Reason |
|---|---|---|
| 1 | Raw web scraping bots | Replaced by AI web search via Tavily |
| 2 | Deal probability score | Requires historical data — deferred to post-launch |
| 3 | Urdu voice input (real-time speech) | Needs specialized model fine-tuning |
| 4 | Payment and billing system | Not required for prototype |
| 5 | Mobile application | Web platform is sufficient for demonstration |

---

## How We Are Building It

| Layer | Detail |
|---|---|
| **Frontend** | Next.js — UI generated and scaffolded via v0.dev |
| **Backend** | Python, FastAPI — initialized with `uv init backend --package` |
| **Backend Tooling** | Built using Claude Code |
| **Database** | AWS (Amazon Web Services) |

---

*PropFlow AI — Close more deals. Lose fewer clients. Grow faster. Sleep better.*
