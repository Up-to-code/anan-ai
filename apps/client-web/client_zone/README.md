# Client Zone

This folder owns the buyer/client-only web experience.

- `pages/` contains thin page orchestrators for landing, assistant, property, history, handoff, and sign-in.
- `components/` contains client-web-specific presentation primitives and chrome.
- `hooks/` contains assistant state, local thread persistence, and view helpers.
- `i18n/` contains the bilingual copy dictionaries and locale helpers.
- `lib/` contains client-web types and small formatters.

Do not import page or feature internals from `apps/web` or `apps/mobile`.
