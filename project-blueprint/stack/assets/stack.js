/*
  Single source of truth for the tech-stack knowledge base.
  Every page reads from this object — nothing is duplicated in the HTML.
  Reference the bare identifier STACK (top-level const is not window.STACK).
*/
const STACK = {
  meta: {
    title: "AI-Powered Clienteling Assistant",
    subtitle: "One technology per component, rated against this project's actual scale",
    tagline: "Tech stack recommendation & knowledge base"
  },

  sourceArchitecture: "../architecture.md",

  fitKey: [
    { icon: "🟢", label: "great fit", rating: "great", meaning: "Matches this project's size and needs. Pick it, move on." },
    { icon: "🟡", label: "good fit", rating: "good", meaning: "Works, but there's a real caveat to read first — a cost, an operational ceiling, or a decision you'll need to revisit later." },
    { icon: "🔴", label: "consider carefully", rating: "careful", meaning: "Where this plan is most likely to hurt you. Still usable — but go in with eyes open, and read the caveat." }
  ],

  headline: "The part of this stack most likely to bite you isn't any single technology — it's the Recommendation & Messaging Engine's day-one shortcut of stuffing every candidate product into a single prompt. That's the right call to prove the idea works fast, exactly what Phase 2 of the build order asks for. But nothing in the architecture schedules the follow-up: a retrieval step for when the Product Catalog outgrows what comfortably fits in context. Everything else recommended here is a normal, well-worn choice for a single-advisor tool. That one decision is a ticking clock — plan the swap before the catalog forces it, not after.",

  leastConfident: [
    { title: "Recommendation & Messaging Engine's prompt-stuffing approach", rating: "careful", detail: "Right for day one, wrong forever. The timing of the swap to retrieval is a judgment call nobody can make until real catalog size is known." },
    { title: "Node.js + Express for the Clienteling API, over Python + FastAPI", rating: "great", detail: "Python's LLM tooling is more mature, but staying in TypeScript across Console and API keeps one small team from context-switching languages. Reasonable people land on either side." },
    { title: "Anthropic Claude over OpenAI GPT for the LLM Provider", rating: "good", detail: "Close on raw quality. Claude was chosen for tone control on \"the advisor's voice\" — a style judgment, not a benchmark result." }
  ],

  groups: [
    { id: "touches", label: "Things a person touches", blurb: "The one screen a human actually looks at." },
    { id: "write", label: "Things you write", blurb: "Custom code your team builds and owns." },
    { id: "store", label: "Things you store", blurb: "Where the system's data lives between visits." },
    { id: "depend", label: "Things you depend on", blurb: "A third party's service, called over the network." },
    { id: "flow", label: "What the data flow needs", blurb: "Not named in the component list — but the flow can't run without it." }
  ],

  recommendations: [
    {
      id: "console",
      component: "Advisor Console",
      group: "touches",
      fromFlow: false,
      runsOn: "yours",
      tech: "React 18 + Vite (TypeScript)",
      rating: "great",
      why: "It's the screen your one advisor actually looks at, and Vite — a tool that rebuilds your app instantly as you edit — gets a page from code to browser in under a second while you're iterating.",
      caveat: null,
      prompt: "Explain React and Vite to me like I'm new to frontend development, using my AI-Powered Clienteling Assistant's Advisor Console as the example. What would the actual screen look like?"
    },
    {
      id: "api",
      component: "Clienteling API",
      group: "write",
      fromFlow: false,
      runsOn: "yours",
      tech: "Node.js + Express (TypeScript)",
      rating: "great",
      why: "It's the traffic cop your architecture calls for, and writing it in the same language as the Console means one person can hold the whole request path in their head.",
      caveat: null,
      prompt: "Explain Node.js and Express to me like I'm new to backend development, using my AI-Powered Clienteling Assistant's Clienteling API as the example. What would one endpoint actually look like?"
    },
    {
      id: "clientdb",
      component: "Client Data Store",
      group: "store",
      fromFlow: false,
      runsOn: "yours",
      tech: "PostgreSQL 16",
      rating: "good",
      why: "Postgres — a database that keeps records in strictly related tables — fits a client's profile, preferences, and history because those things link to each other and to real purchases.",
      caveat: "This table holds real personal data about real clients — preferences, purchase history, contact details. Your architecture defers authentication to Phase 5, but pick a host with encryption at rest and backups turned on from day one anyway, before the first real client record goes in.",
      prompt: "Explain PostgreSQL to me like I'm new to databases, using my AI-Powered Clienteling Assistant as the example. What tables would I actually have?"
    },
    {
      id: "catalog",
      component: "Product Catalog",
      group: "store",
      fromFlow: false,
      runsOn: "yours",
      tech: "PostgreSQL 16 (same instance, separate schema)",
      rating: "great",
      why: "Products live in the same kind of table-shaped database as clients, so reusing the one Postgres instance means one less system to run and pay for.",
      caveat: null,
      prompt: "Explain how a Product Catalog table would work inside PostgreSQL for my AI-Powered Clienteling Assistant. What columns would it need so the Engine can rank products well?"
    },
    {
      id: "engine",
      component: "Recommendation & Messaging Engine",
      group: "write",
      fromFlow: false,
      runsOn: "yours",
      tech: "Anthropic TypeScript SDK, called directly from the Clienteling API — no framework",
      rating: "careful",
      why: "It's plain code that builds one prompt from a client's history and the catalog and sends it to the LLM Provider — simple enough to fully understand, which matters because this is the one thing that must work well on day one.",
      caveat: "This is where the design is most likely to hurt you. “Stuff every candidate product into the prompt” works cleanly for Phases 2–3 with a small catalog, but nothing in the architecture calls for a retrieval step — so as the Product Catalog grows past roughly a hundred items, prompts get slower, pricier, and the ranking gets less reliable. Plan the swap to a retrieval approach (embeddings + a vector search step) before the catalog forces it.",
      prompt: "Explain how to build the Recommendation & Messaging Engine for my AI-Powered Clienteling Assistant using the Anthropic SDK directly, without a framework like LangChain. Walk me through what one prompt to the LLM would actually contain."
    },
    {
      id: "llm",
      component: "LLM Provider",
      group: "depend",
      fromFlow: false,
      runsOn: "theirs",
      tech: "Anthropic Claude (Claude Sonnet 5, Messages API)",
      rating: "good",
      why: "Claude — the AI model that reads text and writes text back — is strong at writing in a specific tone, exactly what “elegant follow-up message in the advisor's voice” requires.",
      caveat: "Every recommendation and every drafted message becomes a paid API call to a company you don't control — cost scales directly with advisor usage, and an Anthropic outage becomes your outage. Budget for it, and have a plan (even a manual fallback) for when the API is unreachable.",
      prompt: "Explain the Anthropic Claude API to me like I'm new to working with AI models, using my AI-Powered Clienteling Assistant's Recommendation & Messaging Engine as the example. What would the actual request and response look like?"
    },
    {
      id: "hosting-frontend",
      component: "Hosting — Advisor Console",
      group: "flow",
      fromFlow: true,
      runsOn: null,
      tech: "Vercel",
      rating: "great",
      why: "It's built specifically to host exactly this kind of frontend, and shipping a new version is as simple as pushing to your code repository.",
      caveat: null,
      prompt: "Explain how to deploy the Advisor Console for my AI-Powered Clienteling Assistant to Vercel. What do I need to set up before my first deploy?"
    },
    {
      id: "hosting-backend",
      component: "Hosting — Clienteling API & databases",
      group: "flow",
      fromFlow: true,
      runsOn: null,
      tech: "Railway",
      rating: "good",
      why: "One place to run the API and a managed Postgres database together, so a single advisor's day-one tool doesn't need a dedicated ops person.",
      caveat: "Railway is built for getting to a working deploy fast, not for multi-region, high-availability production traffic — completely fine for one advisor today, but revisit before Phase 5's multi-advisor/multi-store support goes live.",
      prompt: "Explain how to deploy the Clienteling API and its PostgreSQL database for my AI-Powered Clienteling Assistant to Railway. What environment variables would I need to set?"
    }
  ],

  learningOrder: [
    { step: 1, tech: "PostgreSQL 16", reason: "Schema first — every other layer reads and writes through it.", phase: "Phase 1" },
    { step: 2, tech: "Node.js + Express", reason: "The API that will host all the logic that touches the schema.", phase: "Phase 1" },
    { step: 3, tech: "React + Vite", reason: "The console that displays one client record.", phase: "Phase 1" },
    { step: 4, tech: "Anthropic Claude API", reason: "Wire the Engine to the LLM for one hard-coded client — the day-one promise.", phase: "Phase 2" },
    { step: 5, tech: "Vercel + Railway deployment", reason: "Get the whole thing running somewhere other than your laptop, once Phase 2 proves it works.", phase: "After Phase 2" }
  ],

  alternatives: [
    { component: "Advisor Console", chosen: "React + Vite", alternative: "Next.js", whyNot: "Full app-router/SSR complexity isn't needed for one advisor's internal screen." },
    { component: "Clienteling API", chosen: "Node.js + Express", alternative: "FastAPI (Python)", whyNot: "Stronger LLM tooling in Python, but adds a second language when the Console is already TypeScript — a close call." },
    { component: "Client Data Store", chosen: "PostgreSQL", alternative: "MongoDB", whyNot: "Client ↔ interaction ↔ product data is inherently relational (joins), which is exactly what a document database avoids." },
    { component: "Recommendation & Messaging Engine", chosen: "Direct Anthropic SDK calls", alternative: "LangChain", whyNot: "Adds a framework layer of abstraction for what is currently one call shape (rank + draft); direct calls are easier to fully understand and debug at this scale." },
    { component: "LLM Provider", chosen: "Anthropic Claude", alternative: "OpenAI GPT", whyNot: "Comparable raw quality; Claude chosen for controllable tone on “the advisor's voice” — a style judgment, not a clear technical win." },
    { component: "Hosting", chosen: "Vercel + Railway", alternative: "AWS (ECS + RDS)", whyNot: "Far more powerful and production-grade, but the ops overhead isn't justified by one advisor's day-one traffic." }
  ],

  lockIn: [
    { component: "Console framework (React + Vite)", difficulty: "easy", score: 1, reason: "Isolated to one component, but still a real rewrite." },
    { component: "API language/framework (Node + Express)", difficulty: "medium", score: 2, reason: "Other components call through it, so a swap touches every integration point — but the service itself stays contained." },
    { component: "Client Data Store (Postgres schema & data)", difficulty: "hard", score: 3, reason: "Holds the system's core asset — client history. Migrating live production data is the riskiest move on this list." },
    { component: "Product Catalog (Postgres)", difficulty: "medium", score: 2, reason: "Same technology as the Client Data Store, but per your own architecture assumptions, this data can be regenerated from the source PIM/inventory system." },
    { component: "Engine's approach (direct SDK, prompt-stuffing vs. retrieval)", difficulty: "easy", score: 1, reason: "A thin layer — swappable without touching any other component." },
    { component: "LLM Provider (Anthropic)", difficulty: "medium", score: 2, reason: "Swapping means rewriting prompts and call code, but no schema or data migration." },
    { component: "Hosting (Vercel + Railway)", difficulty: "easy", score: 1, reason: "Both are stateless compute choices; the real anchor is the Postgres data they host, not the hosting picks themselves." }
  ],

  notTold: [
    "Exact pricing at your real advisor-usage volume — check current provider pricing pages before committing budget.",
    "Security/compliance requirements for storing real client PII (GDPR/CCPA, retention policy) — that needs its own legal/compliance review, not a stack pick.",
    "The actual database schema or API contract — this document names technologies, not table columns or endpoints.",
    "What Phase 5 (auth, multi-store, message delivery) will need — those are new components this document doesn't rate because they aren't built yet."
  ],

  sections: [
    { id: "summary", file: "01-summary.html", nav: "Summary", title: "Fit Key & Headline", description: "What each rating means, and the one paragraph on where this stack is most likely to break.", tile: "bands" },
    { id: "stack", file: "02-stack.html", nav: "Stack", title: "The Recommendations", description: "One technology per component, grouped by what kind of thing it is.", tile: "topology" },
    { id: "prompts", file: "03-prompts.html", nav: "Prompts", title: "Copy-Ready Prompts", description: "Every follow-up prompt, collected in one table with working copy buttons.", tile: "prompts" },
    { id: "learning", file: "04-learning.html", nav: "Learn", title: "What To Learn First", description: "The order to learn these technologies in, tied to the build order.", tile: "ladder" },
    { id: "alternatives", file: "05-alternatives.html", nav: "Alternatives", title: "Alternatives Considered", description: "What else was on the table for each component, and why it lost.", tile: "vs" },
    { id: "lockin", file: "06-lockin.html", nav: "Lock-in", title: "How Hard To Undo", description: "A scale of how painful each decision is to reverse later.", tile: "lockin" },
    { id: "not-told", file: "07-not-told.html", nav: "Not Told", title: "What This Doesn't Tell You", description: "The honest gaps — pricing, compliance, schema, and what Phase 5 needs.", tile: "gap" },
    { id: "appendix", file: "08-appendix.html", nav: "Appendix", title: "Full Reference Table", description: "Every architecture component mapped to its technology and rating, in one place.", tile: "table" }
  ]
};
