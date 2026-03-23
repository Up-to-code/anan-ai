# Private Docs App (`apps/private-docs`)

Internal developer handbook for the Anan codebase.

## Purpose

- Publish a private developer handbook for the full repo while keeping the current Convex and web audit trail inside it.
- Publish the broader repo handbook for architecture, zones, runtime surfaces, and contribution recipes.
- Keep content route-driven and typed so handbook chapters and audit pages stay easy to update.
- Gate access with an internal-only PIN flow backed by an `HttpOnly` cookie.

## Commands

From repo root:

```bash
pnpm dev:private-docs
pnpm build:private-docs
pnpm lint:private-docs
pnpm test:private-docs
```

From this app directory:

```bash
pnpm dev
pnpm build
pnpm start
pnpm test
```

## Content Model

- Routes in `app/docs/**` stay thin and resolve pages from the typed handbook registry.
- Handbook chapters are grouped under `lib/docs/pages/*.ts`.
- Canonical page order and sidebar groups live in `lib/docs/registry.ts`.
- Access helpers live in `lib/privateAccess.ts`.
- Shared docs primitives live in `components/docs/**`.

## Notes

- The current access model is intentionally minimal and internal-only.
- The hardcoded PIN for v1 is `2004`.
- The app keeps audit pages, but they now live under the `Audit & Drift` section instead of defining the whole app.
- Deep markdown under `docs/handbook/**` remains the upstream reference source for now; this app is the curated in-app handbook shell.
