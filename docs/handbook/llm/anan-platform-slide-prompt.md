# Anan Platform Slide Deck Resource

## WHY

This document is a source resource for an external notebook LLM that will generate slide decks about Anan for a specific presentation goal: explaining how the platform works and why it matters to real estate developers.

It is intentionally written as a factual briefing pack, not as a long generic prompt. The model should use this resource as grounding material so the resulting deck stays specific to Anan and does not drift into generic proptech storytelling.

## WHAT

This resource provides:

- the presentation goal
- the intended audience
- the approved narrative angle
- the platform facts that must shape the deck
- the distinctions between current capabilities and future expansion
- the writing rules the deck should follow
- a compact handoff prompt that can be pasted into the notebook LLM together with this resource

## HOW

Use this document as context material when asking the notebook LLM to generate slide text. The model should treat the facts and framing below as the primary source of truth for the deck narrative.

---

## Presentation Goal

Generate slide-deck text that explains:

1. how Anan works as a platform
2. why that platform is strategically important for real estate developers

The deck should make Anan feel like a unified operating layer for modern real estate sales and distribution, not just another listings portal or CRM.

Primary framing for this deck:

- Anan should be presented as the central infrastructure layer for real estate technology
- the platform should feel like the neural network or control center that collects data once, understands it centrally, and reuses it across every product surface, channel, and workflow
- the story should emphasize that Anan is building one app form with multiple operating views, not unrelated apps stitched together

## Audience

Primary audience:
- real estate developers
- developer leadership teams
- commercial and growth decision-makers inside development companies

Secondary audience:
- partners or stakeholders who need to understand the platform from the developer value perspective

## Tone And Communication Style

The deck should sound:

- executive
- persuasive
- concrete
- credible
- commercially sharp

The deck should not sound:

- overly technical
- startup-hype driven
- abstract
- poetic
- generic

The writing style should use short, confident slide headlines and concise, boardroom-ready bullets.

---

## Core Platform Positioning

Anan should be positioned as a real estate infrastructure platform.

It is not just:

- a listings marketplace
- a CRM
- a broker directory
- a chatbot
- a lead form

It is a unified system connecting demand capture, project distribution, broker activation, deal visibility, collaboration, and market intelligence.

The most important positioning line behind the whole deck is:

Anan is a centralized real estate infrastructure that connects buyers, brokers, and developers through one operational system.

Expanded positioning for this specific deck:

Anan should be described as the central infrastructure brain for real estate operations: one core system that captures data, permissions, demand, inventory, relationships, and workflow signals once, then activates them across workspace tools, AI channels, mobile experiences, websites, CRM flows, and partner integrations.

---

## Platform Facts The Deck Must Reflect

### 1. Three-Sided Ecosystem

Anan connects three main parties:

- buyers and investors
- brokers
- developers

The platform is valuable because these three sides are not treated as disconnected audiences. They operate inside one shared system.

### 2. Multi-Surface Product

Anan is not a single interface. It spans:

- a web workspace for broker and developer workflows
- an admin/operations surface
- a mobile buyer experience
- a Convex-backed backend with shared business logic and AI orchestration

This matters because the platform is built as shared infrastructure across multiple operating surfaces, not as a one-off feature.

Important framing for this slide resource:

- these surfaces should be described as different expressions of one platform
- the deck should not make them feel like separate products with separate brains
- the platform should be presented as one shared core with different interfaces for different use cases

### 2A. The Two Main Product Lenses For This Deck

For this specific presentation, the deck should focus especially on:

- Overview
- Workspace

How to frame them:

- Overview is the command-level view of the platform: what is happening, where demand is moving, how projects are performing, and where decisions should be made
- Workspace is the execution layer: where teams operate, manage inventory, control offers, track CRM activity, activate brokers, manage settings, and run daily workflows

The deck should make clear that:

- Overview is where intelligence becomes visible
- Workspace is where that intelligence becomes action

### 3. Current Buyer Entry Point

Today, the main buyer entry point is a WhatsApp AI agent.

That AI flow currently helps:

- collect structured buyer intent
- understand preferences such as budget, area, property type, payment method, and timeline
- match users to properties, offers, and relevant next steps
- support handoff into broker or developer sales workflows

Important framing:

The AI is not just conversational UI. It acts as a qualification and sales-routing layer.

Code-backed detail:

- the live mobile/property assistant is designed around property-aware responses rather than generic free chat
- the assistant can return structured outputs such as ROI summary, payment-plan guidance, mortgage-check guidance, permit-status guidance, and comparison views
- qualified handoff from the assistant is routed into the existing order/CRM pipeline rather than being trapped in a separate AI-only flow

### 3A. Channel Strategy

The deck should explicitly describe the platform as channel-ready and channel-expanding.

Current and emerging channels to reference:

- Website AI
- Mobile
- App
- WhatsApp AI chat

How to frame them:

- these are not independent systems competing with each other
- they are connected entry points into the same platform core
- each channel should feed the same underlying data model, qualification logic, inventory context, and workflow system

Why this matters:

- the company does not need to rebuild business logic for every new channel
- insights collected in one channel can strengthen decisions and workflows in the rest of the system
- developers gain a single source of operational truth instead of fragmented channel-by-channel tools

Why we are using this model:

- buyer behavior is fragmented across surfaces
- real estate demand appears in different places, not in one perfect funnel
- centralizing the intelligence layer lets Anan capture demand wherever it starts and route it into one operating system

### 4. Developer Operating Layer

Developers use the platform to:

- add and manage projects
- control project data and visibility
- distribute opportunities into the AI and broker ecosystem
- create offers and define commission logic
- monitor performance and engagement
- manage broker relationships
- follow pipeline and deal progress through CRM-style workflows

The deck should make clear that developers are not just uploading inventory. They are activating a distribution and intelligence system.

Code-backed detail:

- developer property workflows are owner-scoped through the developer backend zone rather than treated as open shared inventory editing
- project records carry publication states such as draft, published, and archived
- developer-facing property flows support creation, update, publication, and controlled ownership access
- the workspace server layer resolves whether the current user is acting as broker or developer, then routes CRM, offers, and property behavior to the correct backend path

### 4A. Workspace As The Operating Core

For this deck, the workspace should be treated as the operational heart of the platform.

The workspace is where the platform turns centralized data into coordinated action across:

- projects
- offers
- CRM
- broker collaboration
- settings and permissions
- organization-level controls

The deck should explain that the workspace is not just a dashboard. It is the operating environment through which developers and teams execute.

### 5. Broker Layer

Brokers are a strategic part of the platform, not a side audience.

The broker layer helps developers:

- extend market reach
- activate distributed selling capacity
- open project access to a wider sales network
- support collaboration between brokers when a matching client/project opportunity exists
- accelerate deal movement through active distribution rather than passive listing

The deck must not hide the broker role. It is one of Anan's strongest differentiators for developers.

Code-backed detail:

- the platform has real offer and collaboration workflows, not just a conceptual broker network
- offers support public and private visibility
- offers can be open opportunities, targeted private offers, or collaboration cases tied to a client need
- the collaboration flow can start inside the inbox conversation itself, allowing users to create a private draft, publish it to the thread participant, and respond without leaving the conversation context

### 6. CRM And Visibility Layer

Anan includes CRM and deal-visibility workflows so developers can track:

- leads
- assigned brokers
- pipeline stages
- deal movement
- closed deals
- broker performance

This should be framed as operational clarity. Developers do not need to manage fragmented updates across disconnected tools and phone calls.

Code-backed detail:

- AI-qualified interest can become a `qualified` order in the system
- offer workflows can carry client context such as client name, budget, phone, and need
- collaboration and deal movement are tied to explicit states rather than ad hoc chat history alone
- the system is designed so sales activity, handoff, and follow-through can live in one operating environment

### 6A. External Systems And CRM Connection Points

The platform should also be described as integration-ready infrastructure.

Important connection points to mention:

- API keys and authorization controls
- OAuth and delegated access patterns
- CRM connection possibilities
- external system connectivity

How to frame this:

- Anan is not trying to become a dead-end internal tool
- it is designed to act as a core system that can connect outward to other software and operational environments
- this makes the platform more valuable because data collected inside Anan can be reused outside it, and external actions can be coordinated back through Anan

Code-backed signal:

- the repo includes organization API key management in workspace settings
- the backend includes OAuth and delegated API infrastructure
- the public docs surface includes API key and OAuth integration documentation

This means the deck can safely describe Anan as a platform core with authorization and integration surfaces, not just a closed user interface

### 7. Market Intelligence Layer

Anan includes a market intelligence capability built from live demand behavior, search patterns, inventory context, and related market signals.

This creates value for developers by helping them understand:

- which areas are attracting attention
- what budgets are most active
- what product types are converting
- where pricing or inventory decisions may need adjustment
- where future opportunity may be emerging

This is important because the platform is not only helping sell supply. It is also helping developers read demand.

Code-backed detail:

- the market layer aggregates from multiple persisted sources, including property inventory, research activity, and search logs
- the market snapshot supports filters such as city, area, search query, and time window
- outputs include headline demand signals, top cities, top areas, selling points, keyword insights, opportunities, and trend series
- this means the market story should be presented as a data product derived from platform behavior, not as a vague analytics promise

### 8. Multi-Channel Sales Architecture

Anan should be described as a layered distribution system, not a single marketing channel.

The current and strategic layers include:

- AI-led demand capture
- broker network distribution
- direct developer workflows
- collaboration between market participants
- optional marketing/service support
- future branded company AI agents

This matters because Anan increases reach and coordination across the sales stack.

Code-backed detail:

- the workspace is structured as one audience-aware server composition layer so routes do not split into disconnected broker and developer applications
- this supports the platform narrative that Anan is one operating system with different audience views, not separate disconnected tools stitched together

### 9. Central Data Reuse Philosophy

This deck should strongly reinforce one infrastructure idea:

Anan collects data once and uses it everywhere.

That means:

- buyer intent collected in AI flows can support sales workflows
- project data can support distribution, CRM context, and future company AI agents
- market behavior can support strategy, pricing, and targeting decisions
- authorization and API infrastructure can extend the same core data into partner systems and connected products

This is one of the most important reasons the platform matters.

The deck should contrast this with the traditional fragmented model where:

- one system stores leads
- another system stores listings
- another system manages broker conversations
- another system handles CRM
- another system powers the website
- another system powers messaging channels

Anan's value is that all of these become coordinated through one shared core.

---

## Real Operational Loop To Emphasize

When the notebook LLM explains "how the platform works," it should describe a loop close to the actual product behavior:

1. Demand enters through the AI layer, currently centered on WhatsApp and assistant-driven qualification
2. The platform captures structured user intent such as budget, area, property type, payment preference, and timeline
3. That demand is matched against project inventory, offer logic, and next-step workflows
4. Developers control the underlying project and offer supply through their workspace
5. Brokers extend distribution and collaboration capacity around that supply
6. Qualified intent and collaboration activity feed into CRM, order, inbox, and deal-tracking workflows
7. Aggregate behavior across inventory, research, and search activity strengthens the market-intelligence layer
8. The result is a platform that does not only publish inventory, but continuously learns from demand and routes it into execution

This loop is stronger and more accurate than a simple statement like "users browse listings and developers receive leads."

Additional lens for this loop:

- Overview makes the system legible
- Workspace makes the system actionable
- Channels make the system reachable
- integrations make the system extensible

## Code-Backed Signals The Deck Can Safely Use

The notebook LLM can safely use these ideas because they are supported by the current codebase shape:

- Anan has structured offer lifecycles, not only listing exposure
- Anan has audience-aware workspace routing for broker and developer roles
- Anan has draft/publish/archive concepts in inventory and offer workflows
- Anan has AI-to-sales handoff logic
- Anan has persisted market intelligence derived from multiple system behaviors
- Anan has inbox-linked collaboration rather than isolated messaging and isolated deal handling

The notebook LLM should treat these as operational truths and use them to make the deck more specific and more credible.

---

## Current Capabilities Vs Future Expansion

The deck must clearly separate what exists now from what is part of the platform vision.

### Current or Active Direction

- buyer entry through WhatsApp AI
- workspace-driven operations across projects, offers, CRM, and settings
- organization API key management and authorization infrastructure
- project onboarding and management
- broker-facing and developer-facing workspace flows
- offers and collaboration mechanisms
- CRM and deal tracking visibility
- market intelligence framing from live demand and search behavior

### Future Expansion

- dedicated branded AI agent per developer/company
- more channels beyond WhatsApp
- broader website AI and app-level expansion
- deeper campaign support
- template messaging
- automated follow-ups
- customer segmentation
- further company-specific automation

Rule:

Future items can be used to strengthen the infrastructure narrative, but they must be labeled clearly as future-facing or expansion-stage capabilities.

---

## Narrative Priorities For The Deck

The deck should build around the following story:

1. Real estate sales and distribution are fragmented
2. Developers often operate across disconnected tools, brokers, channels, websites, CRM systems, and reporting loops
3. Anan unifies those moving parts into one platform core
4. Overview gives leadership visibility into what the system is learning
5. Workspace gives teams one place to execute against that intelligence
6. Channels such as website AI, mobile, app, and WhatsApp become connected input/output layers around the same core
7. API keys, authorization, and external integrations let the same platform extend into other systems instead of becoming another silo
8. The result is a scalable infrastructure layer that can collect data once and activate it everywhere

Extra narrative guidance:

- whenever possible, explain Anan as a flow system rather than a menu of features
- describe the developer benefit in terms of control, reach, visibility, and intelligence
- describe the broker benefit mainly as a distribution multiplier for developers
- describe the AI benefit mainly as qualification, routing, and operational acceleration
- describe integrations and authorization as infrastructure enablers, not side utilities
- make "collect data once, use it everywhere" a repeated theme

## Strategic Messages To Reinforce

Across the deck, reinforce these outcomes:

- faster qualification of demand
- wider and more organized distribution
- stronger broker coordination
- clearer sales visibility
- smarter pricing and inventory decisions
- better conversion efficiency
- less operational fragmentation
- a reusable data foundation across channels and systems
- lower duplication of work across apps, teams, and external tools

---

## What The Deck Should Avoid

Do not let the deck:

- describe Anan as only a chatbot
- describe Anan as only a property marketplace
- describe Anan as only a CRM
- ignore the broker network
- ignore market intelligence
- overuse generic phrases like "digital transformation"
- sound like a software feature list with no strategic message
- present future products as if they are already fully deployed
- use engineering or repo-specific terminology
- invent unsupported claims such as full autonomous deal closing or fully deployed company-branded AI agents today

---

## Recommended Slide Structure

The notebook LLM does not have to follow these titles exactly, but the narrative should cover these areas:

1. The problem: fragmented real estate sales and distribution
2. What Anan is: real estate infrastructure, not a point solution
3. Overview: the intelligence layer of the platform
4. Workspace: the execution layer of the platform
5. How the platform works end-to-end
6. The connected channel strategy: website AI, mobile, app, WhatsApp AI
7. The broker network and collaboration advantage
8. CRM visibility, API keys, authorization, and integration readiness
9. Market intelligence and decision support
10. Why this matters commercially for developers
11. The future infrastructure layer and platform expansion

If the deck needs more specificity, it can also include one slide focused on:

- how qualified demand moves from AI into offers, CRM, and deal workflows

or:

- how market intelligence is derived from real platform activity rather than external guesswork

or:

- how centralized permissions, API keys, and external connections let the platform operate as infrastructure rather than as a closed app

---

## Output Expectations For The Notebook LLM

Recommended output:

- one deck title
- one deck subtitle
- 10 to 12 slides
- each slide should include:
  - slide title
  - 3 to 5 short bullets
  - optional presenter note of 1 to 2 sentences

Default writing expectation:

- language: English
- tone: executive sales
- audience: developers and developer leadership
- slide count: 10
- presenter notes: included

---

## Compact Handoff Prompt

Use this prompt with this resource when asking the notebook LLM to produce the deck:

```text
Using the attached Anan platform resource as the source of truth, create a developer-facing slide deck in polished executive English that explains how Anan works and why it matters for real estate developers.

Requirements:
- produce 11 slides
- start with one deck title and one subtitle
- for each slide include a title and 3 to 5 short bullets
- include 1 to 2 sentences of presenter notes per slide
- keep the writing concise, credible, and commercially sharp
- position Anan as unified real estate infrastructure, not as a simple marketplace, CRM, or chatbot
- make Overview and Workspace two central slides in the story
- explicitly cover the connected channel strategy across website AI, mobile, app, and WhatsApp AI chat
- explain why centralized API keys, authorization, and CRM/external integrations matter to the infrastructure story
- reinforce the idea that Anan collects data once and uses it across the whole platform
- clearly separate current capabilities from future expansion

Make the deck feel strategic and presentation-ready for decision-makers.
```

## Quick Validation Checklist

- The deck explains how the platform operates, not only what it promises.
- Developers are clearly the primary audience of the story.
- The broker layer is visible as a strategic distribution engine.
- CRM and deal visibility are represented.
- Market intelligence is represented.
- AI is framed as qualification and operational infrastructure.
- Future capabilities are described as future-facing.
- The story reflects an operating loop grounded in the actual product shape, not a generic proptech narrative.
- Overview and Workspace are clearly treated as the two central operating lenses.
- The connected channel story is explicit.
- The infrastructure story includes permissions, API keys, and integration readiness.
- The deck clearly communicates the principle: collect data once, use it everywhere.
