# Skill Best Practices Checklist

Apply this checklist while drafting a new skill's frontmatter and body. Read in full before drafting — don't skip on the assumption the rules are obvious.

## Description

- Phrase it as "Use when..." — a trigger condition, not a summary of contents.
- Name concrete situations a real user would actually say, not abstract categories.
- If a similar skill already exists (check via Glob over `.claude/skills/*/SKILL.md`), the description must make the boundary between them clear enough that Claude picks the right one.

## When to use / When NOT to use

- Always include a "When NOT to use" section if any other existing skill could plausibly be confused with this one.
- Each "when not" entry should say what to do instead (do the task directly, or defer to a named skill).

## Scope

- One skill, one job. If the draft is covering two unrelated tasks, split it into two skills instead.
- Don't let the skill do more than its trigger implies — e.g. a "checker" skill shouldn't also fix what it finds unless that's explicitly part of the ask.

## Tool access

- `allowed-tools` should list only what the process steps actually use — never grant `Bash` "just in case" if no step runs a command.
- If the skill only reads and reports, it should not have `Write` access.

## Structure

- Keep `SKILL.md` itself short: frontmatter, When to use / When NOT to use, Process, Output, Rules.
- Move bulky, detailed, or situational content into `references/*.md`, and have `SKILL.md` explicitly instruct when to read it.
- Move fill-in-the-blank output shapes into a `template.md`, and have `SKILL.md` explicitly instruct to fill it in and where to save the result.

## Before finishing

- Confirm the folder name, the `name:` field, and the file path all match.
- Confirm no existing skill already owns this folder name.
- Re-read the drafted description once more as if seeing it cold — would it correctly catch the intended request and correctly stay silent on unrelated ones?
