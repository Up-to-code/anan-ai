# Workspace AG UI

Structured workspace UI cards and form surfaces used by assistant turns and project flows.

- External consumers must import stable exports from `@/app/(ws)/ws/public`.
- Workspace-internal files should prefer local relative imports.
- `AgPropertyForm/` now owns the project wizard internals; keep `AgPropertyForm.tsx` as the stable compatibility entrypoint.
