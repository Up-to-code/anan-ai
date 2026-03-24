# Public Zone

This route group owns the public web experience that renders on the main marketing and legal URLs.

## Belongs Here
- landing, marketing, legal, pricing, and public blog routes
- shared public chrome and page sections under `_components`
- docs routes under `docs`
- sign-in route UI that only belongs to the public surface

## Public Surface
- Import reusable public-zone UI from `@/app/(public)/public`.
- Keep route entrypoints thin and move view logic into local `_components` or `loaders.ts`.

## Does Not Belong Here
- workspace-only shells, cards, and assistants
- OAuth consent internals
- generic primitives that should live in `components/ui`
