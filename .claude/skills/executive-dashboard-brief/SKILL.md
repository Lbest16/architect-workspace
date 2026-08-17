---
name: executive-dashboard-brief
description: Use when the user asks to turn a data-quality result, failed refresh, pipeline incident, KPI variance, or technical investigation into an executive dashboard update. Produces a concise leadership brief containing status, business impact, verified evidence, decision needed, owner, and next update time.
---

## Inputs

Require at least one supplied quality report and/or triage report to brief from (e.g., output from `data-quality-gate` or `etl-failure-triage`). If none is supplied, ask for it — do not fabricate an incident to brief on.

## Method

- Draw only from the supplied report(s). Do not re-derive findings from raw logs or source data yourself — the technical investigation has already happened; this skill translates it.
- Separate verified facts (stated as fact, with a result, status, or citation in the source report) from unresolved questions (anything the source report flagged as a hypothesis, an open next-test, or left unanswered).
- Never invent financial/business impact, root cause, owner, or timing that the source report(s) don't state. If the source report doesn't name a dollar figure, an owner, or an ETA, say so explicitly under "What We Do Not Know" rather than estimating one.
- Strip raw log lines, stack traces, query syntax, and other implementation detail — an executive brief states what happened and what's next, not how it was diagnosed.
- Explicitly state whether the dashboard/report should remain blocked, based on the source report's recommendation (e.g., a `BLOCK`/`FAIL` or unresolved incident status means it stays blocked).

## Output

Fill in `template.md` exactly — same field order, same field names, no added or removed sections. Keep every field to a few sentences at most.

## Rules

- Never modify the source quality/triage report(s) being briefed from.
- Never state a business impact, cause, owner, or timing not present in the source material.
- Keep the brief free of raw logs, queries, or technical jargon a non-technical executive reader wouldn't need.
