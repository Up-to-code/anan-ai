# `_core` Zone Register

## Top-Level Ownership
- `schema/`: authoritative table/index definitions
- `security/`: identity, access policy, providers, delegated access, migrations
- `oauth/`: consent flow and OAuth HTTP support code

## Important Files
- `schema/*.ts`: domain-scoped table declarations consumed by `convex/schema.ts`
- `security/accessPolicy.ts`: central permission checks used by protected backend flows
- `security/identity.ts`: normalized session/context shape for callers
- `security/channelAuth.ts`: channel-facing auth helpers
- `oauth/http.ts`: OAuth callback/request handling used by the Convex HTTP router

## Core Exports And Consumers
- Access policy helpers consumed by business zones and auth wiring
- Identity/auth provider helpers consumed by Convex auth setup
- OAuth route helpers consumed by the top-level HTTP entrypoints
- Schema defaults consumed by `convex/schema.ts`

## Public Vs Internal
- Public for the repo: schema definitions, identity/auth helpers, access policy primitives
- Internal to `_core`: local crypto/jwt/constants and low-level OAuth mechanics
