# LLM And Data Access Guide

Date: March 13, 2026
Audience: Engineers building AI or LLM-backed features in Anan

## Purpose

This guide explains what data the LLM layer can access today, what it should access, and how new AI features should be wired so they stay aligned with the repo architecture.

The short version:

- not every AI-like feature in this repo uses the full multi-agent orchestrator
- some flows are deterministic and card-based by design
- the safe path is to gather explicit context first, then call the orchestrator or deterministic adapter, then persist the result

## Current AI Surfaces

### 1. Workspace assistant

Main path:

- `convex/ai_zone/assistant.ts`
- `convex/ai_zone/services/assistantService.ts`
- `convex/ai_zone/agents/anan/*`

This is the main LLM-backed assistant surface. It:

- resolves the current authenticated owner
- loads the latest thread
- checks subscription entitlement
- injects knowledge context
- calls the `anan` orchestrator
- persists the assistant exchange

### 2. WhatsApp channel

Related path:

- `convex/ai_zone/channels/whatsapp/*`

This is another LLM-backed entry surface, but channel-specific.

### 3. Mobile property assistant

Main path:

- `convex/user_zone/mobile/assistant.ts`

This is not currently using the full LLM orchestrator. It is a deterministic card-builder based on property context and keyword intent. Treat it as an AI-shaped product surface, not as a free-form agent runtime.

## What Data The LLM Layer Can Access Today

### Explicitly injected context in workspace assistant

Current context sources in `assistantService.ts`:

- identity and owner type
  - auth user id
  - broker/developer/user owner type
  - current thread id
- entitlement mode
  - `qa` or `action`
- knowledge snippets from `retrieveCompanyKnowledge`

Important caveat:

- despite the function name, `retrieveCompanyKnowledge` currently reads from global `knowledgePages` without organization scoping

### Persisted assistant conversation data

The assistant runtime persists:

- `assistantThreads`
- `assistantMessages`

This gives the system access to:

- thread ownership
- assistant kind
- mode
- raw message content
- optional metadata such as UI turn information

### Other AI-related data tables

The schema also includes:

- `aiTokenUsage`
- `aiOrchestrationUsage`
- `aiRAGEntries`
- `userKnowledgeBase`
- `agentMemory`

Important reality:

- these tables exist in schema, but not every current assistant path actively uses them for prompt assembly
- do not assume a table is part of live prompt context just because it exists

## What An LLM Feature Should Use

When building or changing an LLM path, use this sequence:

1. Resolve identity and role correctly.
2. Resolve product mode or entitlements.
3. Gather only the minimal structured business context needed.
4. Add relevant knowledge or memory explicitly.
5. Call the orchestrator or deterministic adapter.
6. Persist the interaction and analytics.

Do not:

- let the LLM read whole tables by default
- rely on ambiguous implicit globals
- mix mock-only UI assumptions into backend prompt context

## Recommended Context Sources By Use Case

### General workspace assistant

Use:

- current owner
- thread history
- entitlement mode
- role
- explicitly scoped knowledge
- optional structured business context from shared capabilities

Avoid:

- dumping large arbitrary collections into the prompt

### Property-specific AI

Use:

- property projection
- owner projection
- financing inputs
- explicit goal such as ROI, comparison, mortgage check, or permit status

Prefer deterministic or tool-backed responses when the output needs to be structured and auditable.

### Market or research assistant features

Use:

- market snapshots
- search logs
- knowledge research results
- normalized geography

Avoid:

- inventing unsupported market claims
- summarizing metrics that do not exist in stored data

## Current Known Constraints

### Company knowledge is not actually company-scoped

Current behavior:

- `convex/shared_logic/knowledge/index.ts` scores all `knowledgePages` rows for any authenticated caller

Implication:

- new AI features should not describe this source as tenant-safe or organization-specific until schema and retrieval are updated

### Mobile assistant is not an LLM orchestrator path

Current behavior:

- `convex/user_zone/mobile/assistant.ts` uses keyword routing and typed card output

Implication:

- do not add prompt-heavy assumptions to mobile assistant code unless you intentionally migrate it to the shared assistant model

### Thread invariants are soft today

Current behavior:

- `assistantThreads` can be patched with updated `mode`, `assistantKind`, and `orchestratorName`

Implication:

- if you need immutable thread identity, enforce it explicitly in code

## Safe Design Rules For New LLM Features

### Keep entrypoints thin

Thin entrypoint examples:

- Convex action/query/mutation controller
- Next.js route handler

These should:

- validate inputs
- resolve the right service
- return stable output

### Build context in services, not route files

Context assembly belongs in:

- `convex/ai_zone/services/*`
- capability-specific service modules

This keeps prompt assembly auditable and reusable.

### Prefer structured context over prose blobs

Good:

- typed property summary
- normalized market snapshot
- explicit owner/role metadata
- small retrieved knowledge excerpts

Bad:

- full table dumps
- uncontrolled concatenation of large documents
- inconsistent mixing of mock and production context

### Persist enough to debug AI behavior

For AI-backed flows, aim to preserve:

- user request
- resolved mode
- relevant thread id
- assistant output
- optional metadata about UI or tool usage
- token/orchestration usage where the runtime already supports it

## Recommended File Paths For Future AI Work

### Add a new shared assistant capability

Use:

- `convex/ai_zone/services/`
- `convex/ai_zone/agents/anan/`
- `convex/ai_zone/agents/team_*/`

### Add AI context from a product capability

Use:

- the existing capability module in `convex/shared_logic/*`
- a focused query/helper that returns only the context needed

Avoid:

- baking product-specific reads directly into an agent config if they belong in a service or tool layer

### Add admin visibility into AI behavior

Use:

- existing analytics and token usage tables
- admin read models in `convex/admin_zone/*`

## Practical Checklist

Before shipping an AI change, confirm:

- the role and owner are correct
- the knowledge source is truly scoped as claimed
- the thread model is correct for the feature
- the output shape matches the UI contract
- the flow is tested around ownership and state transitions

## Related Docs

- [Developer System Guide](developer-system-guide.md)
- [Codebase Knowledge Base](codebase-knowledge-base.md)
- [Logic Audit - March 13, 2026](logic-audit-2026-03-13.md)
