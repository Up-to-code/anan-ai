# Mobile User Zone

Thin mobile-facing endpoints for the Anan buyer feed.

- `contracts.ts` defines shared validators and typed result-card shapes for the mobile app.
- `account.ts` owns the signed-in buyer mobile account record, preferences mutations, and authenticated assistant-history hydration for the live `ai_zone.assistantPublic` buyer threads.
- `feed.ts` exposes the swipe-feed query surface and property context reads.
- `assistant.ts` keeps the deterministic property helper and qualified handoff path used by older/supporting mobile surfaces. It is not the primary live buyer assistant orchestrator.
- `viewer.ts` re-exports the merged signed-in buyer account viewer used by the mobile account surface.
- `finance.ts` returns property-aware finance estimates and bank comparison rows.
- `analytics.ts` aggregates buyer-facing market intelligence for the analytics route.

Keep mobile discovery logic in this folder and delegate reusable domain work to `shared_logic/`.
