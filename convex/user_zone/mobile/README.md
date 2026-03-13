# Mobile User Zone

Thin mobile-facing endpoints for the Anan buyer feed.

- `contracts.ts` defines shared validators and typed result-card shapes for the mobile app.
- `feed.ts` exposes the swipe-feed query surface and property context reads.
- `assistant.ts` handles typed mobile AI results and qualified handoff creation.

Keep mobile discovery logic in this folder and delegate reusable domain work to `shared_logic/`.
