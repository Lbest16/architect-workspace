# STORY-007 — Implement Least-Privilege Access Control

As a system administrator, I want to enforce least-privilege access, so that I minimize security risks.

**Release:** r2 · Security and Privacy Features (weeks 4–5)
**Owner:** Security Team
**Blocked by:** STORY-006

## The requirement this satisfies

- **REQ-009** (Safety, must) — The system must follow least-privilege principles for tools and permissions.

## How to build it

Configure role-based access controls and audit logging for all system components.

## Failure paths you must handle

- Access control misconfiguration
- Unauthorized access
- Role assignment error
- Permission escalation
- Access control timeout

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given user roles, When the system assigns permissions, Then each user has only necessary access.
- [ ] Given an access control misconfiguration, When the system detects it, Then it logs and alerts the admin.
- [ ] Trust: The system logs all access control changes for audit purposes.

When every box above is ticked, stop and show the demo.
