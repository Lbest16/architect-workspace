---
name: claude-md-check
description: Use when the user has added or changed files in src/ and wants to verify the change follows this repo's CLAUDE.md rules before calling it done — naming/test pairing, the 200-line file limit, and a passing test run.
allowed-tools: Read, Glob, Bash
---

## When to use

- The user has just added or edited a file in `src/` and wants to confirm it's ready / complete.
- The user directly asks "does this follow CLAUDE.md" or "check the repo rules."

## When NOT to use

- No files in `src/` have changed — nothing to check.
- The user is asking about a rule that isn't in CLAUDE.md (e.g. code style opinions) — that's outside this skill's scope.

## Process

1. **List the source files.** Use Glob on `src/*.ts` to get every source file.

2. **Check naming and test pairing.** For each `src/<name>.ts`, confirm:
   - The file name is camelCase and matches its primary export (open the file with Read to check the export name).
   - A matching `tests/<name>.test.ts` exists (Glob for it).

3. **Check file size.** For each `src/*.ts` file, count its lines. Flag any file over 200 lines.

4. **Run the test suite.** Run `npm test` via Bash. Record whether it exits 0.

## Output

Report a simple pass/fail list, one line per rule:
- Naming + matching test file: pass, or which files are missing a test.
- File size: pass, or which files exceed 200 lines (with their actual line count).
- `npm test`: pass, or the failure output.

If everything passes, say so plainly — don't add extra suggestions or unrelated cleanup.

## Rules

- Only report on the three CLAUDE.md rules above — don't flag unrelated style or design issues.
- Don't modify any files. This skill checks compliance; it doesn't fix violations. If something fails, tell the user what and why, and let them decide the fix.
