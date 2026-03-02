# Backend: _core Zone

## Role in the Architecture
This is the foundational layer for the Convex backend. It defines the global schema and core authentication protocols.

## Directory Breakdown

- **`schema/`**: The definitive source of truth for the database. Organized into domain-specific files (e.g., `ai.ts`, `auth.ts`, `properties.ts`).
- **`auth.ts` / `auth.config.ts`**: Better Auth integration and Convex auth adapters.

## Rules of Engagement

1. **Schema Centralization:** All tables MUST be defined here. Do not try to define tables inside business zones.
2. **Core Security:** Auth logic here is critical. Do not modify `auth.ts` without verifying the `_core/middleware` impact.
3. **No Domain Handlers:** This folder contains definition and config only. No business-facing `query` or `mutation` should be defined here. They must live in a business `zone`.
