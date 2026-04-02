# Anan Investor Pitch Brief

## Purpose

This brief is the research-backed source of truth for explaining Anan to investors.

It has two jobs:

- explain what Anan is from the real codebase
- explain how to write the investor story in a way that makes the company easy to understand and easy to remember

The goal is not to dump every product detail into slides. The goal is to create belief, clarity, and follow-up interest.

## The Simple Company Description

Anan is an AI-first real estate operating system with two live product surfaces:

- a buyer-side assistant that starts the journey across mobile and channel surfaces
- a workspace agent where developers and brokers can start from the first screen and operate projects, offers, CRM, collaboration, inbox, and market work

If the deck needs an even shorter line, use this:

Anan uses AI to turn real-estate demand and workspace operations into one operating system.

## What The Codebase Says The Product Is

The repo supports a sharper product story than the older generic platform wording.

### 1. The buyer-side AI assistant

The mobile app opens directly into a chat-first buyer assistant.

That assistant already supports:

- property-aware conversation
- property search
- property detail review
- finance-related guidance
- bank offers and financing comparison
- mortgage and installment estimation
- advisor handoff

The buyer-side assistant should be framed as the intake and qualification layer, not as a generic chatbot.

The codebase also shows that financing is not a loose future idea. The buyer flow already has:

- structured `bank_offer` cards
- `mortgage_check` and `loan_calculator` cards
- bank bundle queries and financing tools in the backend
- qualification and handoff state carried through the buyer context

This matters because the buyer story is not just search plus chat. It is search, property context, financing, qualification, and broker/advisor escalation inside one loop.

### 2. The workspace

The web workspace is not just a dashboard with navigation. Its primary entry point is a workspace assistant surface under `/ws`.

That first screen is an operator workspace for the current user.

The codebase shows that this assistant is designed to prioritize:

- projects
- offers
- CRM
- organizations and invitations
- inbox
- actionable next steps

The workspace assistant also supports concrete work patterns directly from the first screen, including:

- preparing offer-oriented asks
- searching projects
- searching offers
- listing clients and CRM context
- comparing broker performance
- analyzing market activity
- handling project deletion and follow-up confirmations when allowed by role

The workspace UI also includes structured assistant cards for:

- project creation drafts
- offer publish drafts
- offer send drafts
- approval and confirmation steps
- field and missing-data requests
- market insight and area-heat cards
- execution result states

This means the workspace assistant should be described as a working operator surface that can gather input, prepare actions, and move work toward execution from the same screen.

This matters because the workspace story should be framed as an active agent workspace first, and a zone-based application second.

Behind that first screen, the wider workspace still contains route zones for:

- overview and settings
- projects
- offers
- CRM
- inbox collaboration
- market

This is the practical operating layer of the product. The assistant opens the work, and the rest of the workspace carries it through.

### 3. The one-screen vision

The pitch should make one idea very clear:

Anan is trying to bring AI, workspace execution, broker help, and team workflow into one operating logic instead of spreading them across disconnected tools.

The phrase "one screen" should not mean literally one UI page for every action. It should mean one system of record and one operating experience that keeps context intact as users move from assistant to workspace to collaboration.

In investor language, the strongest version of this point is:

the main workspace itself starts as an agent workspace, so users do not begin from menus alone. They begin from an operator that can understand the request, pull the right context, and move the work forward.

## Research-To-Writing Method

This is the writing method we should use when building the deck.

### YC-style rule 1

Explain the company in very simple language.

If an investor cannot quickly repeat what Anan does, the writing is too complicated.

### YC-style rule 2

Reduce the story to a few memorable facts.

The deck should not try to prove everything at once. It should make investors remember a small number of strong ideas:

- what Anan is
- why now
- why this product is different
- why this team can build it

### Investor goal

The deck exists to get belief and follow-up interest, not to explain every feature in the product.

### Writing sequence

Write the story in this order:

1. code truth
2. startup thesis
3. why now
4. differentiation
5. evidence
6. blanks for missing business facts

That sequence matters because product truth comes first. Business proof should be added only where it is real and available.

## Startup Logic For This Deck

The startup story should not read like “we built many proptech tools.”

It should read like this:

- real-estate workflows are still fragmented
- AI can now do more than answer questions; it can hold context and route work
- Anan is using that shift to build the operating layer that connects intake, execution, broker support, and visibility
- the long-term opportunity is to become the standard workflow system for AI-native real estate operations

This is the new vision of the company.

## Category Comparison

Use category comparison, not named-company attacks.

Anan is:

- not just a chatbot
- not just a CRM
- not just a marketplace
- not just broker software
- not just a property search app

Anan combines:

- assistant entry
- financing and qualification flow
- workspace-agent execution
- broker coordination
- CRM and inbox flow
- market visibility

That is the core comparison logic investors should remember.

## Why This Can Win

The deck should include a direct “why us” logic.

Some of this comes from the product and some comes from founder-supplied facts.

### Code-grounded edge

- the product already spans buyer assistant and execution workspace surfaces
- the workspace opens with an operator assistant rather than a passive home dashboard
- the assistant and workspace are part of one system, not separate products
- the buyer-side product already includes financing, bank comparison, and handoff logic
- the workspace already reflects operational categories that matter in real estate execution
- direct workspace commands already exist for projects, offers, and client/CRM workflows
- the workspace assistant UI is already built around draft, approval, insight, and execution cards

### User-supplied edge to keep in the draft

- speed and timing matter
- the competitive edge is becoming the operating standard early
- founder edge: technical builder who codes the product directly
- partner edge: deep real-estate experience and network
- market edge: grounded focus on Saudi / Jeddah real-estate behavior

These points are useful in the deck, but anything outside the repo should stay marked as founder-supplied until final validation.

## Why Now

The timing story should be explicit.

The best “why now” framing for this deck is:

- AI is moving from assistive chat to workflow-holding systems
- real estate still runs through fragmented channels and manual coordination
- that gap creates an opening for an agentic operating layer
- 2026 is a good time to define the standard before the category hardens

This section should sound sharp and believable, not hype-heavy.

## Suggested Slide Arc

Use this 10-slide sequence for the investor deck:

1. The broken real-estate workflow
2. What Anan is in one sentence
3. The buyer-side AI assistant
4. The workspace agent as the main operating screen
5. How buyer AI, financing, workspace, and broker support fit together
6. Why this is bigger than a point solution
7. Category comparison and why Anan is different
8. Why now in 2026 and why agentic real estate
9. Why this team can build it
10. The investor thesis plus blanks for traction and business proof

## Required Custom Blanks

These sections should remain explicit blanks until the founders provide real values:

- founder story
- team background details
- traction numbers
- customer proof
- business model
- fundraising target
- go-to-market proof

Do not invent these.

## Writing Guardrails

The deck should sound:

- simple
- credible
- investor-friendly
- commercially sharp
- grounded in product truth

The deck should avoid:

- feature dumping
- startup poetry
- engineering-heavy language
- unsupported market claims
- invented traction
- presenting future ideas as if they are already shipped

## Research Basis

The writing logic above follows three YC principles:

- explain the company simply
- make the deck easy to remember
- focus on the strongest facts, not maximum information

Useful references:

- [How to Pitch Your Company](https://www.ycombinator.com/blog/how-to-pitch-your-company/)
- [How to Design a Better Pitch Deck](https://www.ycombinator.com/blog/how-to-design-a-better-pitch-deck/)
- [Practical Design: Pitching](https://www.ycombinator.com/blog/practical-design-pitching/)

## Canonical Message

If the deck needs one repeated sentence, use this:

Anan starts with AI on both sides of the product, then turns demand and workspace operations into real-estate execution through one operating system.
