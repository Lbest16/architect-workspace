---
name: tech-stack-recommender
description: Use when the user has a system architecture and wants a recommended tech stack, explained simply.
---

## When to use

- The user has (or points to) a system architecture and asks what technology to use for it, or wants a tech stack recommended/explained in plain English.

## When NOT to use

- No architecture exists yet — send them to the `system-architect` skill first.
- The user wants deep implementation help (writing code, config) rather than a stack recommendation.

## Input

Read `project-blueprint/architecture.md`. If it doesn't exist, tell the user it's missing and suggest running the `system-architect` skill first rather than guessing at components.

## Process

1. **Extract the components.** Pull the component list straight from the "Components" section of `architecture.md` — don't invent components that aren't there, and don't skip ones that are.

2. **Recommend one real, current technology per component.** Pick a specific, actively-maintained product/library/service (not a category like "a database" — name the actual thing, e.g. "PostgreSQL", "Supabase", "Vercel"). Base the choice on what this idea actually needs, not a generic default stack.

3. **Rate the fit.** For each recommendation, assign one of:
   - 🟢 great fit — matches this idea's actual scale/needs well
   - 🟡 good fit — works, but there's a tradeoff or a better option exists at a different scale
   - 🔴 consider carefully — likely overkill, underpowered, or has a real gotcha for this specific idea

   The rating must be judged against THIS idea's scale and needs (e.g., a solo weekend project vs. a system expecting real production load), never assigned as a generic default rating for the technology.

4. **Explain the why in one plain-English sentence.** No unexplained jargon — if a technical term is unavoidable, give a one-line definition inline. No walls of text.

5. **Add a copy-ready follow-up prompt per row.** End each row with a prompt the user could paste into a later conversation to learn more about that specific technology in the context of their project, e.g. `Explain PostgreSQL to me like I'm new to databases, using my project as the example.`

6. **Format as a table (or icon-led rows), one row per component:**
   - Component
   - Recommended technology
   - Fit rating (icon + label)
   - Why (one sentence)
   - Copy-ready prompt

7. **Save the result** to `project-blueprint/tech-stack.md`.

## Output

When finished, report to the user:
- The exact file path written
- The fit-rating breakdown: count of 🟢 / 🟡 / 🔴

## Rules

- Every recommendation must be a real, currently-maintained technology — no invented or deprecated names.
- Fit ratings reflect this idea's actual scale and needs, not a generic/default rating for the technology.
- Keep each "why" to one plain-English sentence; define any jargon inline in that same sentence.
- Every row ends with a copy-ready prompt the user can paste later.
