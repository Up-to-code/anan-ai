# Developer System Guide

Date: March 13, 2026
Audience: Engineers building in `web`, `admin`, `mobile`, and `convex`

## What This Repo Is

Anan is not a single frontend with a simple API. It is a shared product system with multiple runtime surfaces:

- `web/` for the main Next.js workspace and public site
- `admin/` for platform operations
- `mobile/` for the buyer-facing Expo app
- `convex/` for schema, auth, shared business logic, AI orchestration, and backend entrypoints

The practical rule is:

- UI surfaces render and orchestrate user interaction
- `web/server/` owns web-specific service boundaries
- Convex owns persistence, shared capabilities, and AI entrypoints
- `packages/*` owns stable shared systems that are meant to travel across surfaces or projects

## How To Think About The Architecture

### 1. Next.js app layer

In `web/` and `admin/`:

- route files should stay thin
- page-level behavior should live in page folders or server/domain helpers
- API routes under `web/app/api/*` should delegate to `web/server/*`

For `web/`, the important layers are:

- `web/app/`
  - App Router entrypoints
- `web/server/auth/`
  - session and role resolution
- `web/server/contracts/`
  - DTOs, validation, and stable shapes
- `web/server/domains/`
  - business orchestration for web features
- `web/server/infrastructure/convex/`
  - repository adapters for Convex reads and mutations
- `web/server/broker_zone/` and `web/server/red_zone/`
  - role-specific service entrypoints

### 2. Convex layer

In `convex/`, the repo is split by responsibility:

- `_core/`
  - schema
  - access policy
  - identity normalization
  - auth and OAuth internals
- `shared_logic/`
  - offers
  - inbox
  - market
  - properties
  - subscriptions
  - knowledge
  - agencies
  - notifications
- `ai_zone/`
  - assistant controllers
  - multi-agent orchestration
  - shared AI runtime helpers
- `user_zone/`
  - buyer/user features, including mobile-specific endpoints
- `broker_zone/` and `red_zone/`
  - owner-scoped repository-style endpoints for property and overview flows
- `admin_zone/`
  - admin read models and operational mutations

### 3. Mobile layer

The mobile app is currently a smaller buyer-focused surface:

- `mobile/app/`
  - Expo Router entrypoints
- `mobile/src/features/`
  - screen-level orchestration
- `mobile/src/hooks/`
  - feed and assistant state
- `mobile/src/lib/`
  - Convex wiring and mock data

The mobile app currently mixes real backend DTOs and mock fallback behavior, so changes there need extra care.

## Current Role Model

The repo uses several role terms. The important reality is:

- auth/profile role can be `admin`, `broker`, `developer`, `user`, or sometimes `RED`
- stored organization records use the `RED` table for developers
- access policy normalizes `RED` to `developer` in many server paths
- web contracts often expose `redId` while Convex documents still store `REDId`

When adding new code:

- keep storage naming aligned with schema
- normalize naming at the web contract boundary
- do not invent a third naming convention

## How Requests Usually Flow

### Web workspace feature

Typical path:

1. `web/app/.../page.tsx`
2. page-local orchestrator or server action
3. `web/server/...`
4. `web/server/infrastructure/convex/...`
5. `convex/...`

Use this when:

- the feature is web-only
- you need stable DTOs between UI and backend
- you want clearer contract boundaries than direct Convex calls from UI

### Shared Convex feature

Typical path:

1. frontend surface or server gateway
2. `convex/shared_logic/...` or zone-specific Convex entrypoint
3. schema tables

Use this when:

- the logic is shared across multiple clients
- the feature is fundamentally real-time or Convex-native
- the capability should remain backend-owned

### AI feature

Typical path:

1. client or channel submits a prompt
2. thin assistant controller receives it
3. `convex/ai_zone/services/assistantService.ts` or another AI service builds context
4. `convex/ai_zone/agents/anan/*` orchestrates team dispatch
5. result is persisted and returned

## Where To Put New Code

### Decide whether code should become a package

Use this rule:

- move code to `packages/*` only when it is already reused across apps/projects, or when it is intentionally being designed as a stable public surface
- do not package code only because a folder is large; first ask whether the real fix is a better local feature structure

Use `@anan/ag-ui` as the model extraction:

- package the generic reusable core
- keep app-specific behavior behind adapter entrypoints
- leave thin local wrappers where a host still needs its own contract shape

### Packaging readiness checklist

Before opening a package extraction:

- confirm the module is reused, or clearly intended for reuse, beyond one surface
- confirm the public entrypoints and ownership are stable enough to document
- confirm README/examples are justified and maintainable
- confirm the package can be typechecked and tested independently
- confirm app-only dependencies can be isolated behind adapters instead of leaking into the core API

If any of those are missing, prefer one of these instead:

- `refactor locally`
- `keep zone-local`
- `promote to app-wide shared folder`

### Destination buckets for heavy modules

When auditing heavy code, place each module in one bucket:

- `package now`
  Cross-surface or cross-project system with stable public API
- `refactor locally`
  Heavy but still owned by one app or one surface; improve structure without packaging
- `keep zone-local`
  Closely tied to one route, workspace subsystem, or backend zone

### Add a new workspace page

Put code in:

- route entrypoint under `web/app/(ws)/...`
- page orchestrator inside the page folder
- web-facing domain logic in `web/server/...`
- Convex adapter in `web/server/infrastructure/convex/...` when needed

Avoid:

- putting data-fetching logic directly inside page JSX
- importing random Convex modules directly across zones

### Add a broker or developer backend capability

Put code in:

- `web/server/broker_zone/...` or `web/server/red_zone/...` for web-owned orchestration
- `convex/broker_zone/...` or `convex/red_zone/...` for owner-scoped low-level backend access

Use shared capability modules only when behavior really belongs to both audiences.

### Add a shared business capability

Put code in:

- `convex/shared_logic/<capability>/`

Split the capability by concern where possible:

- access
- queries
- mutations
- side effects
- tests

### Add an admin read model

Put code in:

- `convex/admin_zone/...` for the projection or mutation
- `admin/admin_zone/api/...` for admin app data loaders
- `admin/admin_zone/pages/...` for page-level rendering

### Current packaging audit decisions

Current repo guidance from the packaging audit is:

- `packages/ag-ui`
  Keep as the model extraction and source of truth for UI systems that are meant to travel
- `apps/web/components/shared/Sidebar`
  Possible future package candidate only if reuse expands beyond the web workspace
- `apps/web/app/(ws)/ws/_components/AIMotion`
  Possible future package candidate only if reuse expands beyond the web workspace
- `apps/web/app/(ws)/ws/_components/ZoneShell`
  Keep local for now; improve locally rather than package
- `apps/web/app/(ws)/ws/_components/WorkspaceBrand`
  Keep local for now; improve locally rather than package
- `apps/web/app/(ws)/ws/_components/OrganizationOnboarding`
  Keep local for now; improve locally rather than package
- `apps/web/app/(ws)/ws/_components/Visuals`
  Keep local for now; improve locally rather than package
- `convex/ai_zone`
  Keep zone-local unless a host-agnostic SDK or protocol emerges; its current value is backend orchestration, not cross-surface packaging

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the main backend:

```bash
pnpm dev
```

Run individual apps:

```bash
pnpm --dir web dev
pnpm --dir admin dev
pnpm --dir mobile dev
```

Check type health:

```bash
pnpm typecheck
pnpm --dir admin typecheck
pnpm --dir mobile typecheck
```

Current baseline:

- root typecheck passes
- admin typecheck currently fails due to React type-version mismatch
- mobile typecheck currently fails due to assistant contract drift

## Rules For Safe Changes

### Keep routes and controllers thin

If a file is mostly:

- auth lookup
- role branching
- DTO mapping
- business decisions

then that logic probably belongs in a server/domain or capability module, not a route file.

### Respect ownership boundaries

For any write path, always ask:

- who is the caller
- is ownership by auth user, broker, or developer
- is this public, private, or organization-scoped
- does verification or subscription status matter

### Treat `publicationState` and `status` as different things

Across offers and properties:

- `publicationState` controls visibility lifecycle
- `status` usually controls business outcome lifecycle

Do not collapse them into one idea in new code.

### Treat mock fallback and production data separately

This matters most in `mobile/`:

- mock data is useful for UI development
- production DTOs should not silently inherit unrelated mock semantics

### Add tests where state transitions matter

Tests are most valuable for:

- ownership checks
- visibility transitions
- deduplication
- unread counters
- offer acceptance/apply flows
- assistant message persistence

### Verification for package extractions

Every future package extraction should include:

- package-only typecheck
- focused consumer-app typecheck
- import smoke test from the consuming app
- docs/example usage that matches real exports
- at least one override or extensibility test when the package exposes adapters, registries, or pluggable surfaces

## Known Hotspots

The current highest-risk areas from the March 13, 2026 audit are:

- mobile assistant contract alignment
- public offer acceptance and duplicate-deal prevention
- inbox/offer recipient lookup scaling
- Arabic property-search normalization
- global versus organization-scoped assistant knowledge

See:

- [Codebase Knowledge Base](codebase-knowledge-base.md)
- [Logic Audit - March 13, 2026](logic-audit-2026-03-13.md)

## Recommended Development Workflow

1. Start from the relevant surface and role.
2. Find the thin entrypoint.
3. Trace the contract boundary.
4. Confirm which table or shared capability owns the behavior.
5. Change the narrowest layer that truly owns the rule.
6. Add or update tests around the state transition or ownership rule.

If a change touches AI behavior, read the LLM guide next.
