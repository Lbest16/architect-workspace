/*
  Single source of truth for the whole knowledge base.
  Every page reads from this object — nothing is duplicated in the HTML.
  Reference the bare identifier BLUEPRINT (top-level const is not window.BLUEPRINT).
*/
const BLUEPRINT = {
  meta: {
    title: "AI-Powered Clienteling Assistant",
    subtitle: "Turning client history into recommendations and ready-to-send messages",
    tagline: "System architecture & build blueprint"
  },

  idea: "I want to build an AI-powered clienteling assistant for luxury retail advisors. It helps sales associates manage client profiles, understand preferences, recommend relevant products, and create personalized outreach messages.",

  dayOne: "Generate personalized client recommendations and elegant follow-up messages based on client history and preferences.",

  components: [
    {
      id: "console",
      name: "Advisor Console",
      kind: "frontend",
      layer: "Interface",
      sentence: "The screen a sales associate opens to look at a client, see suggested products, and read a drafted message before sending it.",
      triggerWords: ["sales associates", "manage client profiles"],
      why: "a human uses this system, so it needs a screen"
    },
    {
      id: "api",
      name: "Clienteling API",
      kind: "backend",
      layer: "Coordination",
      sentence: "The traffic cop that takes a request from the console, pulls the right data from storage, hands it to the AI layer, and sends the result back.",
      triggerWords: ["manage", "recommend", "create"],
      why: "the console can't reach the database or the AI layer without something coordinating the request"
    },
    {
      id: "clientdb",
      name: "Client Data Store",
      kind: "database",
      layer: "Data",
      sentence: "Holds each client's profile, stated and observed preferences, and purchase or interaction history — the record an advisor is managing and the context the AI reasons over.",
      triggerWords: ["manage client profiles", "understand preferences", "client history"],
      why: "this data must outlive a single visit to the console"
    },
    {
      id: "catalog",
      name: "Product Catalog",
      kind: "database",
      layer: "Data",
      sentence: "Holds the products an advisor could recommend, so “relevant” has something to be relevant to.",
      triggerWords: ["recommend relevant products"],
      why: "recommendations need a real set of products to rank"
    },
    {
      id: "engine",
      name: "Recommendation & Messaging Engine",
      kind: "ai",
      layer: "Intelligence",
      sentence: "Reads a client's profile, preferences, and history alongside the product catalog, ranks the products most likely to land, and drafts a follow-up message in the advisor's voice.",
      triggerWords: ["understand preferences", "recommend relevant products", "create personalized outreach messages"],
      why: "this is the component that exists specifically to guarantee the day-one promise",
      dayOneOwner: true
    },
    {
      id: "llm",
      name: "LLM Provider",
      kind: "external",
      layer: "External",
      sentence: "The language model the Recommendation & Messaging Engine calls to do the actual ranking-by-meaning and writing.",
      triggerWords: ["generate", "personalized", "elegant follow-up messages"],
      why: "this requires reasoning over meaning, not a lookup table"
    }
  ],

  excludedComponents: [
    { name: "Job queue", reason: "nothing in the idea is described as slow or bursty" },
    { name: "Auth / multi-tenant layer", reason: "the paragraph describes one advisor's workflow, not account management" },
    { name: "Message delivery service (email/SMS/WhatsApp)", reason: "the paragraph says “create” outreach messages, not “send” them" }
  ],

  diagrams: {
    flowchart: `flowchart TD
    Advisor(["Sales Advisor"])
    Console[Advisor Console]
    API[Clienteling API]
    ClientDB[(Client Data Store)]
    Catalog[(Product Catalog)]
    Engine[Recommendation and Messaging Engine]
    LLM{{LLM Provider}}

    Advisor -->|opens a client profile| Console
    Console -->|requests recommendations| API
    API -->|"reads profile, preferences, history"| ClientDB
    ClientDB -->|client record| API
    API -->|reads candidate products| Catalog
    Catalog -->|product list| API
    API -->|client context plus candidates| Engine
    Engine -->|prompt with grounded context| LLM
    LLM -->|ranked picks plus draft message| Engine
    Engine -->|recommendations plus message draft| API
    API -->|response| Console
    Console -->|displays draft| Advisor
    Advisor -->|edits and approves| Console
    Console -->|logs the interaction| API
    API -->|"writes approved interaction"| ClientDB`,

    sequence: `sequenceDiagram
    participant Advisor
    participant Console as Advisor Console
    participant API as Clienteling API
    participant ClientDB as Client Data Store
    participant Catalog as Product Catalog
    participant Engine as Recommendation and Messaging Engine
    participant LLM as LLM Provider

    Advisor->>Console: opens client profile
    Console->>API: request recommendations
    API->>ClientDB: read profile, preferences, history
    ClientDB-->>API: client record
    API->>Catalog: read candidate products
    Catalog-->>API: product list
    API->>Engine: client context plus candidates
    Engine->>LLM: prompt with grounded context
    LLM-->>Engine: ranked picks plus draft message
    Engine-->>API: recommendations plus message draft
    API-->>Console: response
    Console-->>Advisor: displays draft
    Advisor->>Console: edits and approves
    Console->>API: log approved interaction
    API->>ClientDB: write interaction record`,

    gantt: `gantt
    title Build Order
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    section Phase 1 - Data foundation
    Schema plus bare console :p1, 2026-08-10, 10d
    section Phase 2 - Day-one promise
    Engine wired to LLM :crit, p2, after p1, 10d
    section Phase 3 - Real grounding
    Catalog wired into ranking :p3, after p2, 10d
    section Phase 4 - Advisor workflow
    Review, edit, approve UI :p4, after p3, 10d
    section Phase 5 - Deferred
    Auth, delivery, analytics :p5, after p4, 10d`
  },

  dataFlow: [
    { step: 1, text: "The advisor opens a client's profile in the Advisor Console.", touchesModel: false, actor: "console" },
    { step: 2, text: "The Console asks the Clienteling API for recommendations and a draft message for that client.", touchesModel: false, actor: "api" },
    { step: 3, text: "The API reads the client's profile, preferences, and history from the Client Data Store.", touchesModel: false, actor: "clientdb" },
    { step: 4, text: "The API reads candidate products from the Product Catalog.", touchesModel: false, actor: "catalog" },
    { step: 5, text: "The API hands both — client context and candidate products — to the Recommendation & Messaging Engine.", touchesModel: false, actor: "engine" },
    { step: 6, text: "The Engine builds a prompt grounded in that context and sends it to the LLM Provider.", touchesModel: true, actor: "llm" },
    { step: 7, text: "The LLM returns a ranked set of product picks and a drafted follow-up message.", touchesModel: true, actor: "llm" },
    { step: 8, text: "The Engine passes the recommendations and draft back through the API to the Console.", touchesModel: false, actor: "api" },
    { step: 9, text: "The Console shows the advisor the recommendations and the draft message.", touchesModel: false, actor: "console" },
    { step: 10, text: "The advisor edits and approves the message; the Console logs that interaction back into the Client Data Store, so the next recommendation has one more data point of real history.", touchesModel: false, actor: "clientdb" }
  ],

  buildPhases: [
    { id: "p1", name: "Data foundation", start: 0, duration: 10, critical: false, builds: "Client Data Store schema, Product Catalog schema, a bare-bones Advisor Console that can display one client record", proves: "The data model actually holds what an advisor needs to see" },
    { id: "p2", name: "Day-one promise", start: 10, duration: 10, critical: true, builds: "Recommendation & Messaging Engine wired to the LLM Provider for a single hard-coded test client", proves: "Recommendations and a message draft can be generated end-to-end — the one thing that must work well before anything else matters" },
    { id: "p3", name: "Real grounding", start: 20, duration: 10, critical: false, builds: "Product Catalog wired into the Engine's ranking, multiple real clients", proves: "Recommendations are grounded in actual inventory, not a placeholder list" },
    { id: "p4", name: "Advisor workflow", start: 30, duration: 10, critical: false, builds: "Console UI for reviewing, editing, and approving a draft; approved interactions written back to the Client Data Store", proves: "An advisor can use this in a real workday, and every use improves the next recommendation" },
    { id: "p5", name: "Deferred", start: 40, duration: 10, critical: false, builds: "Authentication, multi-advisor/multi-store support, message delivery integrations, analytics", proves: "Explicitly out of scope for day one" }
  ],

  coverage: [
    { capability: "Client profile management", status: "covered", phase: "Phase 1" },
    { capability: "Preference understanding", status: "covered", phase: "Phase 2" },
    { capability: "Product recommendations", status: "covered", phase: "Phase 3" },
    { capability: "Outreach message drafting", status: "covered", phase: "Phase 2" },
    { capability: "Interaction history logging", status: "covered", phase: "Phase 4" },
    { capability: "Message delivery (send)", status: "deferred", phase: "Not scheduled" },
    { capability: "Authentication / access control", status: "deferred", phase: "Phase 5" },
    { capability: "Multi-store / multi-brand support", status: "deferred", phase: "Phase 5" },
    { capability: "Analytics / reporting", status: "deferred", phase: "Phase 5" },
    { capability: "Real-time inventory sync", status: "deferred", phase: "Not scheduled" }
  ],

  assumptions: [
    { text: "Product catalog data already exists in some exportable form (a PIM, an inventory system, even a spreadsheet).", impact: "If no such source exists, the Product Catalog has to be built and populated from scratch before Phase 3 can start, pushing back grounded recommendations." },
    { text: "Messages are drafted for the advisor to send themselves, not auto-sent by the system.", impact: "If auto-send is actually required, a message-delivery integration (email/SMS/WhatsApp) becomes a day-one component, not a deferred one." },
    { text: "This is single-advisor / single-store scope for day one.", impact: "If multiple advisors or stores need to share or partition client data immediately, an auth and permissions layer moves from Phase 5 into Phase 1." },
    { text: "The AI layer is a general-purpose LLM API, not a custom-trained recommendation model.", impact: "If off-the-shelf ranking quality isn't good enough, a dedicated recommendation model becomes its own component and its own build phase." }
  ],

  openQuestion: {
    question: "Does the assistant need to send the message itself, or only draft it for the advisor to send?",
    branchA: {
      label: "Draft only",
      detail: "The current design holds as-is. The Engine hands a draft to the Console; the advisor sends it through whatever channel they already use."
    },
    branchB: {
      label: "Auto-send",
      detail: "A message-delivery service becomes a day-one component, and the Clienteling API needs delivery-status tracking (sent, opened, bounced)."
    }
  },

  notCovered: [
    "Authentication or access control for advisors",
    "Sending messages (email, SMS, WhatsApp delivery)",
    "Multi-store or multi-brand support",
    "Analytics or reporting on outreach effectiveness",
    "Real-time inventory sync with the Product Catalog"
  ],

  sections: [
    { id: "summary", file: "01-summary.html", nav: "Summary", title: "The Idea", description: "The project in one paragraph, and the promise day one must keep.", tile: "ribbon" },
    { id: "components", file: "02-components.html", nav: "Components", title: "Components", description: "Every piece the idea actually requires, traced back to its words.", tile: "layers" },
    { id: "architecture", file: "03-architecture.html", nav: "Architecture", title: "How It Fits Together", description: "The flowchart connecting every component and the data crossing each arrow.", tile: "graph" },
    { id: "data-flow", file: "04-data-flow.html", nav: "Data Flow", title: "Data Flow", description: "A numbered walkthrough of one recommendation request, start to finish.", tile: "steps" },
    { id: "build-order", file: "05-build-order.html", nav: "Build Order", title: "Build Order", description: "The phases, in order, and what each one proves before the next begins.", tile: "bars" },
    { id: "coverage", file: "06-coverage.html", nav: "Coverage", title: "Coverage", description: "What's covered on day one versus deliberately deferred.", tile: "grid" },
    { id: "assumptions", file: "07-assumptions.html", nav: "Assumptions", title: "Assumptions", description: "What this design is betting on, and the one question that would change it.", tile: "fork" },
    { id: "not-covered", file: "08-not-covered.html", nav: "Not Covered", title: "What This Design Does Not Cover", description: "An honest list of what day one deliberately leaves out.", tile: "list" }
  ]
};
