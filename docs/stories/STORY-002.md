# STORY-002 — Generate Personalized Outreach Message

As a luxury retail advisor, I want to receive a personalized outreach message, so that I can communicate effectively with my clients.

**Release:** r0 · Initial Setup and Core Functionality (weeks 0–2)
**Owner:** Development Team
**Blocked by:** nothing — you can start this now

## The requirement this satisfies

- **REQ-004** (Functional, must) — The system must generate an editable personalized outreach message for the advisor.
- **REQ-005** (Functional, must) — The system must allow advisors to review and edit AI-generated messages before sending.

## How to build it

Develop the message generation component ensuring messages are editable.

## Failure paths you must handle

- Message template not found
- AI fails to generate message
- Message exceeds character limit
- Invalid personalization data
- Message generation timeout

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given an identified opportunity, When the system generates a message, Then the message is personalized and editable.
- [ ] Given an invalid opportunity, When the system attempts to generate a message, Then it provides a meaningful error message.
- [ ] Trust: The system logs all generated messages for audit purposes.

When every box above is ticked, stop and show the demo.
