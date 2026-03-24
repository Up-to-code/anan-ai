# Docs App (`apps/docs`)

Public client developer documentation portal for Anan integrations.

## Purpose

- Publish external integration docs in a standalone Next.js app.
- Keep docs content route-driven and typed (TSX + registry).
- Document current OAuth and delegated API behavior from the live backend contracts.

## Commands

From repo root:

```bash
pnpm dev:docs
pnpm build:docs
```

From this app directory:

```bash
pnpm dev
pnpm build
pnpm start
```

## Content Model

- Routes in `app/docs/**` stay thin and render registry-backed docs pages.
- Canonical content lives in `lib/docs/registry.ts`.
- Reusable docs primitives live in `components/docs/**`.

## Notes

- This app is intentionally public and has no authentication gate.
- API credential docs use OAuth client credentials (`client_id` and `client_secret`) as the current integration model.
