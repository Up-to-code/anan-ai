# Web User Zone

Thin web-facing endpoints for the Anan buyer/client surface.

- `contracts.ts` defines compact response validators used by the client web assistant.
- `properties.ts` exposes public property-detail reads shaped for the web client.
- `assistant.ts` orchestrates deterministic buyer replies over live property/search data.
- `threads.ts` owns authenticated buyer thread persistence and guest-to-auth transcript promotion.
- `orders.ts` exposes authenticated buyer handoff detail reads for the confirmation route.

Keep browser-specific orchestration here and reuse `user_zone/mobile` plus `shared_logic/` for shared domain behavior.
