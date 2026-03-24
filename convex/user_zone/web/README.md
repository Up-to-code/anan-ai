# Web User Zone

Thin web-facing endpoints for the Anan buyer/client surface.

- `contracts.ts` defines compact response validators used by the client web assistant.
- `properties.ts` exposes public property-detail reads shaped for the web client.
- `assistant.ts` orchestrates deterministic buyer replies over live property/search data.

Keep browser-specific orchestration here and reuse `user_zone/mobile` plus `shared_logic/` for shared domain behavior.
