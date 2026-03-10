# Backend: _core Zone

## Role in the Architecture
This is the foundational layer for the Convex backend. It defines the global schema, Convex Auth verification config, identity normalization, channel sessions, and server-side access policy.

## Directory Breakdown

- **`schema/`**: The definitive source of truth for the database. Organized into domain-specific files.
- **`security/`**: Convex Auth integration (`providers.ts`, `identity.ts`, `channelAuth.ts`) and centralized access policy (`accessPolicy.ts`).

## Rules of Engagement

1. **Schema Centralization:** All tables MUST be defined here. Do not try to define tables inside business zones.
2. **Core Security:** Auth logic here is critical. Do not modify `_core/security/*` without validating login + protected zone access behavior.
3. **No Domain Handlers:** This folder contains definition and config only. No business-facing `query` or `mutation` should be defined here. They must live in a business `zone`.
