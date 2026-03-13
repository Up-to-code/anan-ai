## Offer Mutations

This folder owns state-changing offer flows.

- `create.ts`: draft offer creation plus recipient-side effects.
- `publish.ts`: owner-only publish transition.
- `respond.ts`: recipient accept/reject transitions and deal creation.
- `apply.ts`: public-offer application flow for verified senders.
- `sideEffects.ts`: shared inbox/notification helpers for mutation flows.
- `types.ts`: shared mutation argument types.

`../mutations.ts` remains the stable entrypoint for existing callers.
