# Tech Stack: AI-Powered Clienteling Assistant

Recommendations against [`architecture.md`](architecture.md) — same component names, so you can line the two documents up side by side.

## Fit-Rating Key

| Icon | Label | What it means |
|---|---|---|
| 🟢 | great fit | Matches this project's size and needs. Pick it, move on. |
| 🟡 | good fit | Works, but there's a real caveat to read before you commit — a cost, an operational ceiling, or a decision you'll need to revisit later. |
| 🔴 | consider carefully | Where this plan is most likely to hurt you. Still usable — but go in with eyes open, and read the caveat. |

Ratings are judged against **this** project's actual scale: one advisor, one store, day one. A technology can be excellent in general and still rated 🔴 here.

## Headline: where this stack is most likely to break

The part of this stack most likely to bite you isn't any single technology — it's the **Recommendation & Messaging Engine's** day-one shortcut of stuffing every candidate product into a single prompt. That's the right call to prove the idea works fast (which is exactly what Phase 2 asks for). But nothing in the architecture schedules the follow-up: a retrieval step for when the Product Catalog outgrows what comfortably fits in context. Everything else recommended below is a normal, well-worn choice for a single-advisor tool. That one decision is a ticking clock — plan the swap before the catalog forces it, not after.

**Least confident calls**, in order:
1. **Recommendation & Messaging Engine's prompt-stuffing approach** (🔴) — right for day one, wrong forever; the timing of the swap to retrieval is a judgment call nobody can make until you see real catalog size.
2. **Node.js + Express for the Clienteling API** vs. Python + FastAPI — Python's LLM tooling is more mature, but staying in TypeScript across Console and API keeps one small team from context-switching languages. Reasonable people land on either side.
3. **Anthropic Claude vs. OpenAI GPT for the LLM Provider** — close on raw quality; Claude was chosen for tone control on "the advisor's voice," which is a style judgment, not a benchmark result.

## Recommendations

### Things a person touches

| Component | Technology | Fit | Why | Learn it |
|---|---|---|---|---|
| Advisor Console | React 18 + Vite (TypeScript) | 🟢 great fit | It's the screen your one advisor actually looks at, and Vite (a tool that rebuilds your app instantly as you edit) gets a page from code to browser in under a second while you're iterating. | `Explain React and Vite to me like I'm new to frontend development, using my AI-Powered Clienteling Assistant's Advisor Console as the example. What would the actual screen look like?` |

### Things you write

| Component | Technology | Fit | Why | Learn it |
|---|---|---|---|---|
| Clienteling API | Node.js + Express (TypeScript) | 🟢 great fit | It's the traffic cop your architecture calls for, and writing it in the same language as the Console means one person can hold the whole request path in their head. | `Explain Node.js and Express to me like I'm new to backend development, using my AI-Powered Clienteling Assistant's Clienteling API as the example. What would one endpoint actually look like?` |
| Recommendation & Messaging Engine | Anthropic TypeScript SDK, called directly from the Clienteling API — no framework | 🔴 consider carefully | It's plain code that builds one prompt from a client's history and the catalog and sends it to the LLM Provider — simple enough to fully understand, which matters because this is the one thing that must work well on day one. | `Explain how to build the Recommendation & Messaging Engine for my AI-Powered Clienteling Assistant using the Anthropic SDK directly, without a framework like LangChain. Walk me through what one prompt to the LLM would actually contain.` |

> **Caveat — Recommendation & Messaging Engine:** This is where the design is most likely to hurt you. "Stuff every candidate product into the prompt" works cleanly for Phases 2–3 with a small catalog, but nothing in the architecture calls for a retrieval step — so as the Product Catalog grows past roughly a hundred items, prompts get slower, pricier, and the ranking gets less reliable. Plan the swap to a retrieval approach (embeddings + a vector search step) *before* the catalog forces it.

### Things you store

| Component | Technology | Fit | Why | Learn it |
|---|---|---|---|---|
| Client Data Store | PostgreSQL 16 | 🟡 good fit | Postgres (a database that keeps records in strictly related tables) fits a client's profile, preferences, and history because those things link to each other and to real purchases. | `Explain PostgreSQL to me like I'm new to databases, using my AI-Powered Clienteling Assistant as the example. What tables would I actually have?` |
| Product Catalog | PostgreSQL 16 (same instance, separate schema) | 🟢 great fit | Products live in the same kind of table-shaped database as clients, so reusing the one Postgres instance means one less system to run and pay for. | `Explain how a Product Catalog table would work inside PostgreSQL for my AI-Powered Clienteling Assistant. What columns would it need so the Engine can rank products well?` |

> **Caveat — Client Data Store:** This table holds real personal data about real clients — preferences, purchase history, contact details. Your architecture defers authentication to Phase 5, but pick a host with encryption at rest and backups turned on from day one anyway, before the first real client record goes in.

### Things you depend on

| Component | Technology | Fit | Why | Learn it |
|---|---|---|---|---|
| LLM Provider | Anthropic Claude (Claude Sonnet 5, Messages API) | 🟡 good fit | Claude (the AI model that reads and writes text) is strong at writing in a specific tone — exactly what "elegant follow-up message in the advisor's voice" requires. | `Explain the Anthropic Claude API to me like I'm new to working with AI models, using my AI-Powered Clienteling Assistant's Recommendation & Messaging Engine as the example. What would the actual request and response look like?` |

> **Caveat — LLM Provider:** Every recommendation and every drafted message becomes a paid API call to a company you don't control — cost scales directly with advisor usage, and an Anthropic outage becomes your outage. Budget for it, and have a plan (even a manual fallback) for when the API is unreachable.

### What the data flow needs (not named in the component list)

| Need | Technology | Fit | Why | Learn it |
|---|---|---|---|---|
| Hosting — Advisor Console | Vercel | 🟢 great fit | It's built specifically to host exactly this kind of frontend, and shipping a new version is as simple as pushing to your code repository. | `Explain how to deploy the Advisor Console for my AI-Powered Clienteling Assistant to Vercel. What do I need to set up before my first deploy?` |
| Hosting — Clienteling API & databases | Railway | 🟡 good fit | One place to run the API and a managed Postgres database together, so a single advisor's day-one tool doesn't need a dedicated ops person. | `Explain how to deploy the Clienteling API and its PostgreSQL database for my AI-Powered Clienteling Assistant to Railway. What environment variables would I need to set?` |

> **Caveat — Backend & database hosting:** Railway is built for getting to a working deploy fast, not for multi-region, high-availability production traffic — completely fine for one advisor today, but revisit before Phase 5's multi-advisor/multi-store support goes live.

## All copy-ready prompts, in one table

| # | Component | Prompt |
|---|---|---|
| 1 | Advisor Console | `Explain React and Vite to me like I'm new to frontend development, using my AI-Powered Clienteling Assistant's Advisor Console as the example. What would the actual screen look like?` |
| 2 | Clienteling API | `Explain Node.js and Express to me like I'm new to backend development, using my AI-Powered Clienteling Assistant's Clienteling API as the example. What would one endpoint actually look like?` |
| 3 | Client Data Store | `Explain PostgreSQL to me like I'm new to databases, using my AI-Powered Clienteling Assistant as the example. What tables would I actually have?` |
| 4 | Product Catalog | `Explain how a Product Catalog table would work inside PostgreSQL for my AI-Powered Clienteling Assistant. What columns would it need so the Engine can rank products well?` |
| 5 | Recommendation & Messaging Engine | `Explain how to build the Recommendation & Messaging Engine for my AI-Powered Clienteling Assistant using the Anthropic SDK directly, without a framework like LangChain. Walk me through what one prompt to the LLM would actually contain.` |
| 6 | LLM Provider | `Explain the Anthropic Claude API to me like I'm new to working with AI models, using my AI-Powered Clienteling Assistant's Recommendation & Messaging Engine as the example. What would the actual request and response look like?` |
| 7 | Hosting — Console | `Explain how to deploy the Advisor Console for my AI-Powered Clienteling Assistant to Vercel. What do I need to set up before my first deploy?` |
| 8 | Hosting — API & databases | `Explain how to deploy the Clienteling API and its PostgreSQL database for my AI-Powered Clienteling Assistant to Railway. What environment variables would I need to set?` |

## What to learn first, in order

1. **PostgreSQL 16** — schema first; every other layer reads and writes through it. (Phase 1)
2. **Node.js + Express** — the API that will host all the logic that touches it. (Phase 1)
3. **React + Vite** — the console that displays one client record. (Phase 1)
4. **Anthropic Claude API** — wire the Engine to the LLM for one hard-coded client. (Phase 2 — the day-one promise)
5. **Vercel + Railway deployment** — get the whole thing running somewhere other than your laptop, once Phase 2 proves it works.

## Alternatives considered, and why not

| Component | Chosen | Alternative | Why not |
|---|---|---|---|
| Advisor Console | React + Vite | Next.js | Full app-router/SSR complexity isn't needed for one advisor's internal screen. |
| Clienteling API | Node.js + Express | FastAPI (Python) | Stronger LLM tooling in Python, but adds a second language when the Console is already TypeScript — a close call. |
| Client Data Store | PostgreSQL | MongoDB | Client ↔ interaction ↔ product data is inherently relational (joins), which is exactly what a document database avoids. |
| Recommendation & Messaging Engine | Direct Anthropic SDK calls | LangChain | Adds a framework layer of abstraction for what is currently one call shape (rank + draft); direct calls are easier to fully understand and debug at this scale. |
| LLM Provider | Anthropic Claude | OpenAI GPT | Comparable raw quality; Claude chosen for controllable tone on "the advisor's voice" — a style judgment, not a clear technical win. |
| Hosting | Vercel + Railway | AWS (ECS + RDS) | Far more powerful and production-grade, but the ops overhead isn't justified by one advisor's day-one traffic. |

## How hard each decision is to undo

| Decision | Difficulty to undo | Why |
|---|---|---|
| Console framework (React + Vite) | Easy–medium | Isolated to one component, but still a real rewrite. |
| API language/framework (Node + Express) | Medium | Other components call through it, so a swap touches every integration point — but the service itself stays contained. |
| Client Data Store (Postgres schema & data) | **Hard** | Holds the system's core asset — client history. Migrating live production data is the riskiest move on this list. |
| Product Catalog (Postgres) | Medium | Same technology as the Client Data Store, but per your own architecture assumptions, this data can be regenerated from the source PIM/inventory system. |
| Engine's approach (direct SDK, prompt-stuffing vs. retrieval) | Easy | A thin layer — swappable without touching any other component. |
| LLM Provider (Anthropic) | Easy–medium | Swapping means rewriting prompts and call code, but no schema or data migration. |
| Hosting (Vercel + Railway) | Easy | Both are stateless compute choices; the real anchor is the Postgres data they host, not the hosting picks themselves. |

## What this document does NOT tell you

- Exact pricing at your real advisor-usage volume — check current provider pricing pages before committing budget.
- Security/compliance requirements for storing real client PII (GDPR/CCPA, retention policy) — that needs its own legal/compliance review, not a stack pick.
- The actual database schema or API contract — this document names technologies, not table columns or endpoints.
- What Phase 5 (auth, multi-store, message delivery) will need — those are new components this document doesn't rate because they aren't built yet.
