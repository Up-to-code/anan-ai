# `shared_logic` Zone Register

See `convex/shared_logic/README.md` for current package extraction and folder boundary rules.

## Top-Level Ownership
- `agencies/`, `offers/`, `properties/`, `market/`, `verifications/`, `subscriptions/`: reusable business capabilities
- `compliance/`, `knowledge/`, `memory/`, `content/`, `banks/`, `crm/`: focused shared domain modules
- `lib/`: generated refs, retry, providers, language, HTTP, middleware, profile helpers
- Root entry files: `inbox.ts`, `market.ts`, `offers.ts`, `notifications.ts`, `uploadthing.ts`, `workspaceWorkflows.ts`, `files.ts`

## Important Files And Exports
- `files.ts`: uploaded file validators reused by schema and owner zones
- `inbox.ts`: shared inbox capability entrypoint
- `market.ts` and `market/*`: market snapshot, analytics, and normalization logic
- `offers.ts` and `offers/*`: offer reads, mutations, recipients, and policy helpers
- `agencies/repositories/index.ts`: organization/membership/invite repository surface
- `users/index.ts`: user/session-facing shared helpers
- `lib/generatedApiRefs.ts`: typed Convex refs used across backend modules

## Main Consumers
- `ai_zone` orchestration and tools
- owner zones (`broker_zone`, `red_zone`, `admin_zone`)
- web server repository adapters and admin flows

## Public Vs Internal
- Public: documented capability entrypoints and stable root modules
- Internal: low-level capability helpers, nested utility files not called out as shared surfaces
