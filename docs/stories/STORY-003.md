# STORY-003 — Recommend Product for Opportunity

As a luxury retail advisor, I want to receive a product recommendation, so that I can suggest relevant products to my clients.

**Release:** r0 · Initial Setup and Core Functionality (weeks 0–2)
**Owner:** Development Team
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-003** (Functional, must) — The system must recommend an appropriate product for the identified clienteling opportunity.

## How to build it

Implement product recommendation logic using the fictional product catalog.

## Failure paths you must handle

- Product catalog not loaded
- No matching products found
- AI model fails to recommend
- Recommendation timeout
- Incorrect product recommended

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [x] Given an identified opportunity, When the system recommends a product, Then the product is relevant to the client's preferences.
- [x] Given no available products, When the system attempts to recommend, Then it provides a meaningful error message.
- [x] Trust: The system logs the reasoning for each product recommendation.

When every box above is ticked, stop and show the demo.
