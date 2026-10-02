---
description: Test, format, and draft a PR for the current change
argument-hint: [pr-title]
allowed-tools: Bash(npm test:*), Bash(git add:*), Bash(git diff:*)
---

The ceremony after every change. Runs the real checks this repo has, stages the
result, and drafts a PR description — it never commits or pushes.

1. Run `npm test` (this project's real test command — `package.json` maps it to
   `vitest run`). If anything fails, STOP and report the failures verbatim. Do
   not continue to step 2 or 3.
   - *Why: verification is step one, and step one is allowed to say no.*

2. On green, stage the changes with `git add`.
   - Note: this repo has no formatter configured (no prettier, no eslint, no
     `format` script) — there is nothing to run here, so this step only stages.

3. Read the staged diff (`git diff --cached`) and draft a PR description titled
   **$ARGUMENTS**, with:
   - **Summary** — what changed, in plain terms, based on the diff.
   - **Test Evidence** — one line quoting the actual passing output from step 1.
   - **Risk** — what could break, or "none identified" if the diff is genuinely low-risk.
   - *Why: `$ARGUMENTS` is whatever was typed after `/ship` — the title travels into the body.*

This command prepares a change. It does not commit and does not push — do that
yourself once you've reviewed the draft.
