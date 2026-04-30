# Convex Shared Logic

`convex/shared_logic` is the Convex runtime boundary for reusable backend capabilities. Keep
database access, Convex validators, generated refs, actions, queries, mutations, and `ctx`-bound
logic here.

## Folder Ownership

- `lib/`: Convex-local infrastructure helpers. Pure helpers should move to `packages/*-logic`
  and leave a compatibility wrapper here only when existing Convex imports need it.
- `agencies/`, `crm/`, `market/`, `offers/`, `inbox/`, `projects/`, `properties/`,
  `compliance/`, `oauth/`, `verifications/`, `memory/`, `content/`, `banks/`: capability
  folders with explicit `index.ts` gateways where the public surface is shared.
- `integrations/`: external runtime bridges such as webhook delivery and service-specific
  scheduling.
- root `*.ts` files: compatibility entrypoints for Convex function paths. Prefer thin exports
  from capability folders over new root implementations.

## Package Extraction Rule

Move logic to a package when it is pure TypeScript and does not import:

- `convex/*`, `ConvexError`, or `v`
- `_generated`, `api`, or `internal`
- `ctx`, database/query/mutation/action APIs, scheduler, or storage runtime APIs

Use the existing package families first:

- `@anan/base-logic`: generic text, language, retry, HTTP, parsing, provider constants
- `@anan/market-logic`: market normalizers and pure analytics helpers
- `@anan/crm-logic`: CRM mappers and pure CRM state helpers
- `@anan/offers-logic`: offer case status, visibility, and pure offer state helpers
- `@anan/workspace-logic`: workspace zones and capability helpers
- `@anan/compliance-logic`: compliance status, country, and organization-type helpers

Convex wrappers may import package `src` by relative path when Convex test/runtime resolution
cannot consume workspace package specifiers.

## Migration Pattern

1. Add or update the capability `index.ts`.
2. Move the implementation into the capability folder.
3. Leave the old root or nested file as a compatibility export.
4. Add package tests for pure helpers and focused Convex tests for runtime wrappers.
5. Run `pnpm typecheck`, focused Vitest files, then `pnpm test:once` and `pnpm build`.
