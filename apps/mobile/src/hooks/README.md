# Hooks

Mobile hooks orchestrate buyer state while keeping feature components presentational.

- `usePropertyFeed.ts` owns the live property feed read surface.
- `usePropertyDetail.ts` loads one canonical buyer-facing property for route screens.
- `usePropertyAssistant.ts` manages guest-local transcripts, authenticated saved-thread hydration, live assistant turns, and in-app advisor actions.
- `usePropertySearch.ts` filters the shared feed data for the dedicated search screen.
- `useBuyerAccount.ts` keeps guest account state on device, hydrates signed-in buyer account state from Convex, and promotes guest state into the backend after auth.
- `useBuyerFinance.ts` resolves editable finance scenarios through the live backend contract only.
- `useBuyerAnalytics.ts` exposes the buyer-facing analytics summary from the live backend contract only.
