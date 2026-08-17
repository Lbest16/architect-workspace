---
name: system-architect
description: Use when the user has a project idea and wants a system architecture, a technical design, or a diagram of how it would work.
---

## When to use

- The user describes a project idea (even briefly, one paragraph) and asks for a system architecture, technical design, or a diagram of how it would work.

## When NOT to use

- The user wants to modify or debug existing code with no request for an architecture/design/diagram.
- The user asks for a generic explanation of an architecture pattern with no project idea of their own to ground it in.

## Input

Take the user's project idea as input — typically one paragraph. If the idea is too vague to identify real components (e.g., no sense of what the system does, who uses it, or what data moves through it), ask one clarifying question before proceeding rather than guessing.

## Process

1. **Identify the real components.** Read the idea carefully and list only the components this specific idea actually needs. Do not start from a generic template (frontend + backend + database + auth) and fill it in — derive each component from something stated or clearly implied in the idea. Typical candidates, include only what applies:
   - Frontend / client (web app, mobile app, CLI, chat interface, etc.)
   - Backend / API layer
   - Database(s) — and which kind of data each one holds
   - External services (payment processors, email/SMS providers, third-party APIs, auth providers)
   - AI/agent layer — only if the idea involves LLMs, agents, or ML inference
   - Background jobs / queues / schedulers — only if the idea implies async or scheduled work
   - Storage (files, media, blobs) — only if the idea handles uploads or media

   If a candidate component isn't implied by the idea, leave it out. It is fine to end up with three components or eight — let the idea decide.

2. **Draw the architecture as a Mermaid flowchart.** Use `flowchart TD` or `flowchart LR`. Every component identified in step 1 must appear as a node. Edges must represent actual data flow or calls between components (labeled with what flows across them, e.g., `-->|user query|`), not just a generic connection. Do not include a component in the diagram that wasn't explained in prose, and don't explain a component that isn't in the diagram — the two must match exactly.

3. **Explain each component.** For every node in the diagram, write one plain-English sentence describing what it does and why it's there — written so a non-technical reader can follow it. No jargon without a plain-English gloss.

4. **Save the result.** Write the full output (diagram + component explanations) to `project-blueprint/architecture.md`, creating the `project-blueprint/` directory if it doesn't exist. Structure the file as:
   - A one-line restatement of the project idea
   - The Mermaid flowchart in a ```mermaid fenced block
   - A "Components" section with one heading + one sentence per component, in the same order as introduced in the diagram

## Output

When finished, report to the user:
- The exact file path written
- The final one-paragraph description used to derive the architecture
- The full component list identified

## Rules

- Never fall back to a generic frontend/backend/database template unless the idea genuinely calls for exactly that — justify every component by something in the idea.
- The diagram and the prose explanations must stay in sync: same components, same names, in both places.
- Keep each component explanation to one sentence — no multi-paragraph descriptions.
