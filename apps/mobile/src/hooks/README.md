# Hooks

Mobile hooks orchestrate buyer state while keeping feature components presentational.

- `usePropertyFeed.ts` owns the live/fallback property feed read surface.
- `usePropertyDetail.ts` loads one canonical buyer-facing property for route screens.
- `usePropertyAssistant.ts` manages the guest transcript, live assistant turns, and in-app advisor actions.
- `usePropertySearch.ts` filters the shared feed data for the dedicated search screen.
- `useBuyerAccount.ts` merges live viewer identity with local saved properties, consent flags, and recent-thread continuity.
- `useBuyerFinance.ts` resolves editable finance scenarios through live or fallback calculation paths.
- `useBuyerAnalytics.ts` exposes the buyer-facing analytics summary in live and fallback modes.
