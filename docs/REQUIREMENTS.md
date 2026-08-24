# Luxury Client Intelligence Agent — Requirements

An AI-powered tool for luxury retail client advisors to manage client relationships by identifying clienteling opportunities, recommending products, and generating personalized messages.

This is the source of truth for what you are building. Your Claude Code prompts
point here. If you sharpen a requirement, edit it — your version is the real one.

| Kind | Meaning |
|---|---|
| Functional | something the system does |
| Safety | a guardrail, with a check that enforces it |
| Reliability | how it behaves when something fails |
| Constraint | a technology or vendor you must use — context, not a task |

## AI Utilization

### REQ-013 — Constraint

The system must use AI for semantic understanding, ranking, recommendation, or generation where needed.

Fulfilled by: STORY-008

## Data Management

### REQ-006 — Constraint

The system must use fictional/sample data for client profiles, preferences, purchase history, product catalog, and availability.

Context for the stories that use it — constraints do not get their own story.

### REQ-007 — Safety · must

The system must protect client privacy by not using real customer information.

Fulfilled by: STORY-006

### REQ-008 — Functional · must

The system must persistently store information that must survive a session.

Fulfilled by: STORY-005

### REQ-017 — Constraint

The system must use realistic fictional sample data for 10 clients, including preferences, purchase history, and product catalog.

Context for the stories that use it — constraints do not get their own story.

## Message Generation

### REQ-004 — Functional · must

The system must generate an editable personalized outreach message for the advisor.

Fulfilled by: STORY-002

### REQ-005 — Functional · must

The system must allow advisors to review and edit AI-generated messages before sending.

Fulfilled by: STORY-002

### REQ-016 — Safety · must

The system must queue drafts for human approval and never auto-send messages.

Fulfilled by: STORY-011

## Opportunity Detection

### REQ-001 — Functional · must

The system must identify the strongest clienteling opportunity from a given client profile, purchase history, preferences, and product catalog.

Fulfilled by: STORY-001

### REQ-002 — Functional · must

The system must explain the reasoning behind each clienteling opportunity recommendation.

Fulfilled by: STORY-001

## Product Recommendation

### REQ-003 — Functional · must

The system must recommend an appropriate product for the identified clienteling opportunity.

Fulfilled by: STORY-003

## Project Planning

### REQ-014 — Functional · must

The system must provide a component list, data model, and data flow analysis before implementation.

Fulfilled by: STORY-010

### REQ-018 — Functional · must

The system must provide a recommended build order and risk assessment before implementation.

Fulfilled by: STORY-010

## Scalability

### REQ-012 — Non-functional · should

The system must be designed to scale for future expansion.

Fulfilled by: STORY-009

## Security

### REQ-009 — Safety · must

The system must follow least-privilege principles for tools and permissions.

Fulfilled by: STORY-007

### REQ-015 — Safety · must

The system must include security and privacy considerations in its architecture.

Fulfilled by: STORY-006

## User Interface

### REQ-010 — Functional · must

The system must clearly distinguish facts from AI-generated recommendations.

Fulfilled by: STORY-008

### REQ-011 — Functional · must

The system must provide a user interface for luxury retail sales advisors.

Fulfilled by: STORY-004
