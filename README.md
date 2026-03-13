# Anan

Anan is a multi-surface real estate platform connecting buyers, brokers, and developers through shared inventory, collaboration flows, CRM-style handoffs, and AI-assisted experiences.

## Core Surfaces

- `web/`
  - Main Next.js App Router workspace and public site.
  - Hosts broker and developer workflows plus public landing/auth pages.
- `admin/`
  - Standalone Next.js admin console for operations, verification, diagnostics, and knowledge management.
- `mobile/`
  - Expo buyer app with swipe feed and property assistant flows.
- `convex/`
  - Shared backend for schema, auth, business logic, AI orchestration, and real-time data.

## Architecture At A Glance

- `web/app/` and `admin/app/` should stay thin.
- `web/server/` owns web-side auth, DTO contracts, domain orchestration, and Convex adapters.
- `convex/_core/` owns schema and access policy.
- `convex/shared_logic/` owns shared product capabilities such as inbox, offers, properties, market, subscriptions, notifications, and knowledge.
- `convex/ai_zone/` owns assistant entrypoints and the multi-agent runtime.
- `convex/broker_zone/` and `convex/red_zone/` provide owner-scoped backend surfaces.

## Developer Docs

Start here if you are building in this repo:

- [Developer System Guide](docs/developer-system-guide.md)
- [LLM And Data Access Guide](docs/llm-data-access-guide.md)
- [Codebase Knowledge Base](docs/codebase-knowledge-base.md)
- [Logic Audit - March 13, 2026](docs/logic-audit-2026-03-13.md)

## Development

Install and run the main services:

```bash
pnpm install
pnpm dev
```

Useful commands:

```bash
pnpm typecheck
pnpm --dir web dev
pnpm --dir admin dev
pnpm --dir mobile dev
pnpm --dir admin typecheck
pnpm --dir mobile typecheck
```

## Coding Rules

All contributors should follow these repo rules:

1. Use thin orchestrator files for routes, pages, and entrypoints.
2. Keep business logic out of route files and UI rendering code.
3. Respect zone boundaries instead of deep-importing across surfaces.
4. Add `WHY / WHAT / HOW` JSDoc blocks to exported modules.
5. Prefer focused capability folders with local `README.md` manifests.
