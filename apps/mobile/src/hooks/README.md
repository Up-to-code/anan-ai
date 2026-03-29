# Hooks

Mobile hooks orchestrate buyer state while keeping feature components presentational.

- `usePropertyFeed.ts` owns the live/fallback property feed read surface.
- `usePropertyDetail.ts` loads one canonical buyer-facing property for route screens.
- `usePropertyAssistant.ts` manages the guest transcript, live assistant turns, and browser auth bridge actions.
- `usePropertySearch.ts` filters the shared feed data for the dedicated search screen.
