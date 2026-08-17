---
name: data-quality-gate
description: Use when the user explicitly asks to validate a dataset, CSV, ETL output, or query result against a quality contract, or asks whether data is ready to publish to a dashboard or report (publish-readiness — "is this safe to publish", "can we ship this data", "check this before it goes live"). Returns PASS/WARN/FAIL with evidence and a PUBLISH or BLOCK recommendation. Do NOT use for ordinary requests to write or debug SQL, calculate or define a metric, or design/build a dashboard's layout or visuals — those alone are not validation or publish-readiness requests.
---

## When to use

- Validate a dataset, CSV, ETL output, or query result before it's published or consumed downstream.
- Decide publish-readiness for a dashboard or report data source.

## When NOT to use

- Writing or fixing SQL, with no explicit ask to validate or check publish-readiness.
- Calculating or defining a metric, with no explicit ask to validate or check publish-readiness.
- Designing or building a dashboard's layout or visuals, with no explicit ask to validate or check publish-readiness.

If the request only matches one of the "when not to use" cases, do the requested task directly — do not invoke this skill.

## Inputs

1. Require a dataset path from the user. If none is given, ask for it before proceeding.
2. Look for a quality contract (e.g., `quality-contract.md` or similar) in the same directory or one supplied by the user. If found, use its rules. If none exists, fall back to the default checks in `references/quality-checks.md`.

## Checks

Run the checks below against the dataset. Do not modify the source data at any point — read-only analysis only.

Read `references/quality-checks.md` before running checks — it defines exactly what evidence to gather and how to judge severity for each check. Do not skip this on the grounds the check names are self-explanatory.

1. Schema
2. Freshness
3. Expected volume
4. Key uniqueness
5. Duplicates
6. Required fields
7. Nulls
8. Numeric rules

## Output

Return a single table with these columns:

| Check | Evidence | Status | Recommended Action |
|---|---|---|---|

Then finish with exactly one overall result line: `PASS`, `WARN`, or `FAIL`.

Then finish with exactly one recommendation line: `PUBLISH` or `BLOCK`.

## Rules

- Never modify, rewrite, or "clean" the source data — this skill only inspects and reports.
- Keep output concise and procedural: table, then status, then recommendation. No extra narrative.
- A single FAIL-level check (e.g., duplicate keys, contract violation) forces overall `FAIL` and `BLOCK`.
- Freshness or volume issues alone, with no key/duplicate/required-field violations, may warrant `WARN` and `BLOCK` or `PUBLISH` depending on severity — use judgment but state the reasoning in the Evidence column. See `references/quality-checks.md` for severity guidance per check.
