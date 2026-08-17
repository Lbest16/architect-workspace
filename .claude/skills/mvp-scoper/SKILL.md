---
name: mvp-scoper
description: Use when the user wants to know what to build first, see what their idea could look like, and get a short pitch for it.
allowed-tools: Read, Write, Bash
---

## When to use

- The user has a project idea and wants to know the smallest thing to build first, wants to see what it could look like, and wants a short pitch to share with someone else.

## When NOT to use

- The user only wants an architecture or tech stack — send them to `system-architect` / `tech-stack-recommender` instead.
- No `project-blueprint/architecture.md` and `project-blueprint/tech-stack.md` exist yet and the user isn't willing to run those skills first — don't invent components or technologies to fill the gap.

## Input

Read `project-blueprint/architecture.md` and `project-blueprint/tech-stack.md`. If either is missing, tell the user which one and suggest running `system-architect` and/or `tech-stack-recommender` first rather than guessing at components or technologies.

## Process

1. **Scope the Week 1 slice.** From the components in `architecture.md` and the technologies in `tech-stack.md`, identify the smallest real slice that proves the idea works — something a user could actually touch, not a scaffolding/setup task. Decide what's explicitly out of scope for Week 1 and why.

2. **Write the plan.** Fill in `template.md` exactly — same section order, same headings — and save the result to `project-blueprint/mvp-plan.md`, creating the `project-blueprint/` directory if it doesn't exist. Every checklist item and every "grounded in" entry must trace back to something actually in `architecture.md` or `tech-stack.md` — don't add components neither file mentions.

3. **Build the mockup.** Write a real, self-contained `project-blueprint/mockup.html`: one file, inline `<style>` (no external stylesheets, fonts, or CDNs — this must render offline), showing the idea's main screen (a landing page or the core app view, whichever better represents the idea). Use the one-line idea description from `architecture.md` to invent real-feeling content for THIS idea specifically: a plausible product name, a real headline, real feature callouts, real sample data/copy. Use color and simple icons (inline SVG or unicode glyphs, not an icon-font CDN). No lorem ipsum, no "Feature 1 / Feature 2" placeholders, no gray wireframe boxes — it should look like a page someone could actually ship.

4. **Build the one-pager PDF.** Write short, punchy marketing copy: what it does, who needs it, one sentence on why it matters — plus a couple of icons/visual accents. This is a pitch, not a spec; no architecture or implementation detail. Then generate `project-blueprint/one-pager.pdf` as a real single-page PDF using exactly one Bash command, chosen from whatever is actually available in this environment (check what's installed rather than assuming):
   - a headless Chromium/Edge/Chrome binary's `--headless --print-to-pdf` flag against an HTML file you wrote, or
   - a Python library such as `reportlab` or `weasyprint`, run via a script you wrote with Write, or
   - a Node library such as `puppeteer`, run via a script you wrote with Write.

   Use Write for any intermediate script/HTML the chosen method needs. Bash is only for invoking that single generator command — do not use it to install packages, probe the system beyond confirming the tool exists, or do anything else in this skill.

## Output

When finished, report to the user:
- Every file created, with its exact path
- One line on what each file contains
- Which tool/method generated the PDF

## Rules

- Never invent an architecture component or technology that isn't in `architecture.md` / `tech-stack.md` — the Week 1 slice must be traceable to both.
- `mockup.html` must be self-contained (no external network requests) and use real, idea-specific content — never lorem ipsum or generic placeholder text.
- `one-pager.pdf` must be an actual PDF file produced by a PDF-generation tool — never a `.md` or `.html` file renamed with a `.pdf` extension.
- Bash is used for exactly one command in this skill: the one that produces the PDF.
