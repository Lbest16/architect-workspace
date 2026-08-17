---
name: skill-builder
description: Use when the user wants to create a new Agent Skill from scratch and wants it scaffolded correctly — drafting the frontmatter, structure, and tool access rather than writing it by hand.
allowed-tools: Read, Glob, Write
---

## When to use

- The user wants to create a new Skill and wants help drafting its frontmatter, structure, or file layout.

## When NOT to use

- The user wants to *use* an existing skill, not create a new one — just run the relevant skill instead.
- The user wants to edit an existing skill's logic rather than scaffold a new one — do that edit directly, this skill is for net-new skills.

## Process

1. **Gather the purpose.** Confirm: what situation should trigger this skill, what it should explicitly NOT do, and whether it needs to read files, write files, or run commands. Ask the user for anything unclear rather than guessing.

2. **Check for collisions.** Glob `.claude/skills/*/SKILL.md` and check the new name and description don't duplicate or dangerously overlap an existing skill's trigger.

3. **Read the checklist.** Read `references/best-practices.md` in full before drafting.

4. **Draft from the template.** Fill in `template.md`'s placeholders based on the gathered purpose, applying every rule from the checklist.

5. **Decide single-file vs multi-file.** If the drafted body needs a fill-in output shape, add a `template.md` to the new skill. If it needs bulky reference detail not required on every trigger, add a `references/*.md` and cite it explicitly in the new `SKILL.md`. Otherwise keep it to a single `SKILL.md`.

6. **Write the new skill.** Create `.claude/skills/<new-name>/SKILL.md` (and any supporting files decided in step 5). Never overwrite an existing skill folder without explicit confirmation from the user.

## Output

Report:
- The exact path(s) created.
- The drafted `description`, so the user can sanity-check the trigger wording.
- Any checklist item from `references/best-practices.md` that couldn't be fully satisfied (e.g. an ambiguous boundary with another skill), so the user can decide how to resolve it.

## Rules

- Never overwrite an existing `SKILL.md` without explicit confirmation.
- Never grant `allowed-tools` beyond what the drafted Process steps actually use.
- Always check `references/best-practices.md` before drafting — don't rely on memory of the rules.
