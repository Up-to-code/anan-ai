# anan-lit

Architecture: Convex Auth (Google OAuth) for backend authentication, server-side authorization policy in `convex/_core/security/accessPolicy.ts`, and a configurable multi-agent backend in `convex/ai_zone/agents/core/`.

## Setup

```bash
cd anan-lit
npm install
npx convex dev   # Creates deployment, generates _generated/, starts dev server
```

## Package Manager

This repo standardizes on **Bun**.

```bash
bun install
bunx convex dev   # Creates deployment, generates _generated/, starts dev server
```

After `npx convex dev`, the `_generated/` folder will be created and Convex components (agent, rate-limiter, workflow, etc.) will be available.

## Structure

- `convex/_core/security/` – Convex Auth wiring, identity normalization, channel sessions, centralized access policy
- `convex/http.ts` – Convex Auth HTTP routes, health, and channel entrypoints
- `convex/ai_zone/agents/core/` – shared configurable agent runtime, prompts, tools, analytics
- `frontend/src/app/` – App Router entrypoints for `/`, `/signin`, `/workspaces`, `/admin`, `/broker`, `/red`
- `frontend/src/workspace/` – shared workspace shell, nav config, and role-aware layout primitives
- `frontend/src/lib/auth.ts` – Convex Auth client adapter for the unified Next.js frontend

## Backend Architecture

See `convex/SYSTEM_STRUCTURE_ARCHITECTURE.md` for the backend system structure, request flow, agent factory design, and tool ownership model.

## Plan

See `anan-lit_complete_plan_435416d4.plan.md` and `.cursor/rules/anan-lit-agent.mdc`.
