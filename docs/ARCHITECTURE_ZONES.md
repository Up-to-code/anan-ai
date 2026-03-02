# Anan-lit Architecture Zones

## Core Philosophy: The Fortress Concept

The UI is divided into absolutely strictly isolated zones to prevent cascading failures and ensure secure separation of concerns.

### Frontend (`dashboard/src`)

- **`_core`**: The root of the application. Contains app bootstrapping (`App.tsx`), standard routing, global auth providers (`auth-client.ts`), and global store config.
- **`public_zone`**: Landing pages, Auth pages (SignIn, Verification), public-facing content.
- **`shared_logic`**: Reusable layouts, components, hooks, and services used across multiple roles. (e.g., `PropertyList`, `DashboardChart`).
- **`admin_zone`**: Admin-only pages and APIs. 
- **`broker_zone`**: Broker-owned pages and APIs.
- **`red_zone`**: Real Estate Developer (RED)-owned pages and APIs.
- **`user_zone`**: Normal user pages.

### Backend (`convex`)

- **`_core`**: Root schema definition, auth configuration, HTTP router setup.
- **`shared_logic`**: Shared Convex services, error handling middleware, generic retry scripts.
- **`admin_zone`, `broker_zone`, `red_zone`, `user_zone`, `public_zone`**: Convex backend handlers isolated by zone.
- **`ai_zone`**: Contains the hierarchy of the LLM orchestration. Organized strictly by the Multi-Agent pattern.

## Enforcement Rules

1. **No deep cross-zone imports.** A zone can ONLY import from another zone's root `index.ts` file. (e.g., `import { BrokerProfile } from "@/broker_zone"` is correct. `import { Something } from "@/broker_zone/pages/CRM"` is FORBIDDEN).
2. **Dedicated Error Vaults.** Every frontend zone must have its own Error Boundary to catch render failures without compromising the core `App.tsx` router.
3. **API Isolation.** All data-fetching hooks MUST reside in `<zone_name>/api/`. Never create standalone `hooks/` folders that fetch data inside standard components.
4. **The Orchestrator Pattern.** Do not create monolithic pages. Pages are folders (`pages/Overview/index.tsx`) that fetch data and delegate to pure child UI components.
5. **Mandatory Documentation.** Every exported API hook and Orchestrator page MUST have a JSDoc block declaring `WHY`, `WHAT`, and `HOW`.
