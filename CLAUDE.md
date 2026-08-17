# CLAUDE.md

Rules for working in this repo. Each rule below is testable — if you can't check it mechanically, it doesn't belong here.

1. **Naming**: every file in `src/` uses camelCase and is named after its primary export (e.g., `src/greet.ts` exports `greet`). Every source file has a matching test at `tests/<sameName>.test.ts` (e.g., `src/greet.ts` → `tests/greet.test.ts`).
   Check: for each `src/*.ts`, `tests/<name>.test.ts` exists.

2. **File size**: no file in `src/` exceeds 200 lines. Split it before adding more code once it crosses that line.
   Check: `(Get-Content <file> | Measure-Object -Line).Lines` is ≤ 200 for every file in `src/`.

3. **Running tests**: run `npm test` (executes `vitest run`) and it must exit 0 before a change is considered done.
   Check: `npm test` exit code is `0`.
