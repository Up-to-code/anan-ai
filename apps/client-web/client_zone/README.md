# Client Zone

- `public/` owns buyer-facing landing, about, and sign-in continuation pages.
- `assistant/` owns the chat-first buyer assistant shell, composer, and history drawer.
- `property/` owns the buyer property detail route.
- `history/` owns the saved-thread view.
- `handoff/` owns the advisor handoff confirmation view.
- `shared/` owns buyer-specific frontend types and prompt helpers.

This folder is the buyer-owned frontend surface for `apps/client-web`. Keep route entrypoints thin and keep buyer-specific UI, hooks, and copy inside this zone.
