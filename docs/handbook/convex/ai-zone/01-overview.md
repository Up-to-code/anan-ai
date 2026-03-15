# AI Zone Overview

## What It Is

`ai_zone` is the backend subsystem that owns assistant endpoints, multi-agent orchestration, channel adapters, and AI persistence. It is a production system, not a demo chatbot.

## Who Uses It

- Public users via the app or WhatsApp.
- Partners (brokers, developers, admins) via the workspace assistant.
- Internal workflows that need AI-driven responses.

## Two Orchestrators

- `anan`: public assistant orchestration for end users.
- `anan_workspace`: workspace orchestration for partners and ops.

The two orchestrators are isolated at the config and runtime level but share the same core runtime code.

## Boundaries

- Orchestrators choose teams, agents, and merge results.
- Agents call tools; orchestrators do not call tools directly.
- Persistence is handled in the service layer, not in UI or channel handlers.

## Primary Entry Points

- `convex/ai_zone/assistant.ts`
- `convex/ai_zone/assistantWorkspace.ts`
- `convex/ai_zone/services/assistantService.ts`
- `convex/ai_zone/agents/anan/*`
- `convex/ai_zone/agents/anan_workspace/*`
- `convex/ai_zone/channels/*`

## Non-Goals

- Business logic for non-AI domain features does not belong here.
- Orchestrators are not allowed to write domain data directly.
