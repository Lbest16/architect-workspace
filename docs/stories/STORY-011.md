# STORY-011 — Queue Drafts for Human Approval

As a compliance officer, I want all drafts to be queued for human approval, so that no message is auto-sent without review.

**Release:** r2 · Security and Privacy Features (weeks 4–5)
**Owner:** Compliance Team
**Blocked by:** STORY-007

## The requirement this satisfies

- **REQ-016** (Safety, must) — The system must queue drafts for human approval and never auto-send messages.

## How to build it

Develop a queue system for draft messages. Implement an approval interface for human reviewers. Ensure audit logs capture approval decisions.

## Failure paths you must handle

- Drafts are auto-sent without approval
- Drafts are lost in the queue
- Audit log fails to record approval actions

## Acceptance — your stop condition

Tick each box as it genuinely passes. This file is yours — the platform reads
the same criteria out of `.colaberry/progress.json`, which Claude Code keeps in
step (see the managed block in CLAUDE.md). Ticking something you have not
actually met only misleads you.

- [ ] Given a draft message, When it is created, Then it is added to the approval queue
- [ ] Given a draft message, When it is in the queue, Then it is not auto-sent
- [ ] Trust: Given a draft message, When it is approved or rejected, Then an audit log records the decision and the approver

When every box above is ticked, stop and show the demo.
