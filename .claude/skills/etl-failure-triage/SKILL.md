---
name: etl-failure-triage
description: Use when the user asks why an ETL or ELT pipeline, scheduled load, SQL job, data refresh, or ingestion process failed or produced suspicious output. Reviews logs and run metadata, ranks likely causes, cites evidence, and recommends the next safe diagnostic steps.
---

## Inputs

1. Require a log, run output, or failure description from the user. If none is given, ask for it before proceeding.
2. If run metadata (schedule, row counts, source/target, retry history, etc.) is supplied or discoverable alongside the log, read it before analyzing.

## Method

- Separate observed facts (quoted directly from the log/metadata) from hypotheses (your inference about cause). Never blend the two.
- Every likely cause must cite specific evidence — a log line, timestamp, row-count delta, error code. No cause without a citation.
- Rank causes most-to-least likely based on how directly the evidence supports each one.
- For each ranked cause, give one concrete next diagnostic step (read-only: a query to run, a file to inspect, a value to check) — not a fix.
- Read `references/common-failures.md` before ranking causes — it lists known ETL failure signatures (schema drift, mapping/conversion errors, retry-masking, duplicate-key load failures, etc.) and how to match log evidence to them.

## Rules

- Never change pipeline code or configuration.
- Never rerun, retry, or trigger any job.
- Never state a root cause without a cited piece of supporting evidence.
- Keep output procedural — no speculation presented as fact.

## Output

Return, in this order:

1. **Incident Summary** — 1–3 sentences: what failed, when, observed symptom.
2. **Evidence** — bullet list of facts pulled directly from the log/metadata, each with its source line or field.
3. **Ranked Causes** — ordered list; each cause paired with its supporting evidence citation.
4. **Next Tests** — one safe, read-only diagnostic step per ranked cause.
5. **Escalation Recommendation** — whether and to whom this should escalate now, based on severity and evidence strength.
