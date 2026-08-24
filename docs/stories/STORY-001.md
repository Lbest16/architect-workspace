# STORY-001 — Identify Clienteling Opportunity

As a luxury retail advisor, I want to identify the strongest clienteling opportunity, so that I can prioritize my client interactions effectively.

**Release:** r0 · Initial Setup and Core Functionality (weeks 0–2)
**Owner:** Development Team
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-001** (Functional, must) — The system must identify the strongest clienteling opportunity from a given client profile, purchase history, preferences, and product catalog.
- **REQ-002** (Functional, must) — The system must explain the reasoning behind each clienteling opportunity recommendation.

## How to build it

Implement the opportunity detection algorithm using the fictional dataset.

## Failure paths you must handle

- Data missing for client profile
- Invalid purchase history format
- AI model fails to load
- Opportunity detection timeout
- Incorrect opportunity identified

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a client profile, purchase history, and preferences, When the system analyzes the data, Then it identifies the strongest clienteling opportunity.
- [ ] Given incomplete client data, When the system attempts analysis, Then it provides a meaningful error message.
- [ ] Trust: The system logs the reasoning for each opportunity identified.

When every box above is ticked, stop and show the demo.
