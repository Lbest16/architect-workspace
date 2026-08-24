# STORY-006 — Implement Privacy Protection Measures

As a luxury retail advisor, I want to ensure client data privacy, so that I comply with privacy regulations.

**Release:** r2 · Security and Privacy Features (weeks 4–5)
**Owner:** Security Team
**Blocked by:** STORY-005

## The requirement this satisfies

- **REQ-007** (Safety, must) — The system must protect client privacy by not using real customer information.
- **REQ-015** (Safety, must) — The system must include security and privacy considerations in its architecture.

## How to build it

Implement data anonymization and access controls to protect client data.

## Failure paths you must handle

- Unauthorized data access
- Data anonymization failure
- Privacy breach
- Access control misconfiguration
- Data leakage

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given client data, When the system processes it, Then it uses fictional/sample data only.
- [ ] Given a privacy breach attempt, When the system detects it, Then it logs and alerts the security team.
- [ ] Trust: The system logs all access to client data for audit purposes.

When every box above is ticked, stop and show the demo.
