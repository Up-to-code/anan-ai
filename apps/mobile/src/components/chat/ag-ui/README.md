# Mobile AG UI

Structured renderer for mobile assistant turns.

- `MobileAgUiTurnRenderer.tsx` renders assistant cards from the mobile AG-UI turn payload.
- `src/lib/mobileAgUi.ts` owns the turn builder that maps live assistant payloads into registry-friendly cards.
- Reuse existing mobile primitives (`MobilePropertyCard`, `InsightCard`) instead of introducing a parallel visual system.
