## Convex Adapters

This folder is the only place where the web server layer should call Convex directly.

### Domain Map
- `ai/`: assistant and agent-facing adapters
- `auth/`: session, profile, and OAuth adapters
- `public/`: public-zone forms and contact adapters
- `messaging/`: inbox and notifications adapters
- `deals/`: CRM, offers, and verifications adapters
- `organizations/`: organization management plus API keys and assets
- `properties/`: ownership, access, analytics, and viewer-safe property reads
- `compliance/`: compliance ruleset adapter
- `market/`: market snapshot adapter

### Internal Module Shape
- `index.ts`: exported repository object and public exports
- `types.ts`: repository contract and transport-only local types
- `api.ts`: `apiUnsafe` bindings and Convex reference typing
- `mappers.ts`: only when the adapter transforms raw payloads into stable DTOs

### Rules
- Keep repository methods narrow and domain-oriented.
- Return stable DTOs instead of raw Convex mutation/query payloads.
- Hide token-based Convex transport details from domain services.
- Add `mappers.ts` only when the adapter normalizes ids, unwraps nested responses, or reshapes payloads.
