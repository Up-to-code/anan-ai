# Mock Assistant

Deterministic mock conversation sources for the client web assistant.

- `mockConversation.ts` owns seeded long-form demo threads.
- `mockHistory.ts` exposes demo thread summaries for the history drawer.
- `mockUiTurn.ts` adapts mock and live client assistant artifacts into AG UI turns.
- `adapters.ts` contains compatibility helpers for mapping existing property/card payloads.

These files keep mock conversational content out of the React view layer.
