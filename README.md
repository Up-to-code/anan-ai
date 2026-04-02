# Anan AI — Platform Overview

Anan AI is a **multi-surface real estate platform** built on a **Convex-first backend**. It connects **Users (buyers/investors)**, **Brokers**, and **Developers (RED)** through one shared system of data, rules, and AI-driven workflows.

🔒 **Private / closed-source / proprietary.** See `LICENSE` and `NOTICE.md`.

---

## What This Repo Contains

Five runtime surfaces, one backend:
- `apps/web` — public site + broker/developer workspace
- `apps/client-web` — buyer-facing Next.js assistant and buyer journey shell
- `apps/admin` — operations console (in-app handbook at `/docs`)
- `apps/mobile` — buyer-facing Expo app
- `convex` — schema, auth, access policy, shared logic, AI orchestration, channels, HTTP/OAuth ingress

---

## Technology + Architecture

**Core stack**
- Backend: **Convex** for schema, auth, access policy, business logic, AI orchestration, and channels.
- Web/Admin: **Next.js App Router**.
- Mobile: **Expo Router**.
- Language: **TypeScript** across the stack.

**Architecture model (the circle)**
Surface → Owning layer → Convex → Capability → Projection → UI.

```mermaid
graph TD
    A[Surface: Web, Admin, Mobile, Channel] -->|Delegates| B[Owning Layer: Web Gateway / Direct Convex]
    B -->|Identity & Policy| C[Convex Backend]
    C -->|Execute Capability| D[Shared Logic, AI, Owner Zone]
    D -->|Persist & Project| E[Convex Stable Projections]
    E -->|Real-time Update| A
```

**Backend zones (ownership boundaries)**
- `_core` — schema, auth, identity, access policy.
- `shared_logic` — shared business capabilities (offers, inbox, properties, market, knowledge).
- `ai_zone` — assistant endpoints, orchestration, channel adapters.
- `user_zone` — buyer/mobile endpoints.
- `admin_zone` — admin projections and operations.
- `broker_zone` — broker-scoped adapters and views.
- `red_zone` — developer (RED) adapters and views.
- `public_zone` — unauthenticated/public entry flows.

---

## How To Use This Repo

**1) Read the rules first**
- `ARCHITECTURE.md` — absolute architectural standards.
- `CONVEX_RULES.md` — rules for Convex queries/mutations/actions and channel handlers.
- `docs/handbook/README.md` — full handbook by area.

**2) Install**
```bash
pnpm install
```

**3) Configure auth redirects (required for Google OAuth)**
- Set `SITE_URL` (and optionally `ANAN_WEB_URL`) to the public web origin you want after sign-in.
- Set `ANAN_ADMIN_URL` for the admin app origin.
- Set `ANAN_MOBILE_URL` for the mobile app origin.
- If needed, set `ANAN_AUTH_ALLOWED_ORIGINS` (comma-separated) for extra safe redirects.

**4) Run locally**
```bash
pnpm dev          # Convex dev (backend)
pnpm dev:all      # backend + web + admin
pnpm dev:web
pnpm dev:client-web
pnpm dev:admin
pnpm mobile:dev
```

**5) Build + test**
```bash
pnpm build
pnpm test:once
```

## Verification Tiers

Use the root deep-test commands when you want broader verification than the default root Vitest run:

- `pnpm test:deep:fast`
  Root deterministic checks: root typecheck + root Vitest + admin/mobile typechecks + private-docs Vitest.
- `pnpm test:deep:surfaces`
  App-local non-browser suites not covered by the root Vitest config: `admin`, `client-web`, and `mobile`.
- `pnpm test:deep:e2e`
  Stable browser suites: workspace web smoke.
- `pnpm test:deep:build`
  Exhaustive build tier: `web`, `client-web`, `admin`, and `private-docs`.
- `pnpm test:deep`
  Runs `fast` → `surfaces` → `e2e`.
- `pnpm test:deep:optional`
  Setup-dependent browser scenarios only. These rely on existing self-skip behavior when local prerequisites are absent.
- `pnpm test:deep:exhaustive`
  Runs `test:deep`, then `build`, then `optional`.

App-specific setup notes:
- `apps/web/README.md` documents the authenticated Playwright storage-state flow for workspace upload e2e.
- `apps/client-web/README.md` documents the buyer journey setup and its Playwright handoff flow.

---

## Navigation Links (Rules + Architecture + Guides)

**Architecture and rules**
- `ARCHITECTURE.md` — platform architecture and standards.
- `CONVEX_RULES.md` — Convex “God rules”.
- `docs/handbook/security/README.md` — authZ and security patterns.

**Handbook (by area)**
- `docs/handbook/README.md` — master index.
- `docs/handbook/convex/README.md` — Convex mental model + zones.
- `docs/handbook/web/README.md` — web gateway + SSR rules.
- `docs/handbook/admin/README.md` — admin app rules.
- `docs/handbook/mobile/architecture.md` — mobile architecture flow.

**Project maps**
- `docs/codebase-knowledge-base.md` — current repo truth by surface.
- `docs/developer-system-guide.md` — system setup and workflow notes.
- `docs/llm-data-access-guide.md` — safe LLM access patterns.

---

## Quick Rules (Summary)

- Keep controllers and routes **thin**.
- Respect **zone boundaries** (no deep imports across zones).
- Put shared logic in `convex/shared_logic` once.
- Put code in `packages/*` only when it is a **stable shared system**, not just a large folder.
- Use **index-first** and **paginated** queries.
- Keep public web routes SSR/static-friendly.
