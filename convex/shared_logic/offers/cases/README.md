# Offer Cases

Folder-backed offer case aggregate services.

- `types.ts`: shared offer case service contracts.
- `shared.ts`: lifecycle mapping and visibility helpers.
- `repositories.ts`: low-level table helpers reused by reads and writes.
- `queries.ts`: queue, list, and detail read models.
- `mutations.ts`: create, publish, archive, apply, and stage transitions.
- `index.ts`: stable re-export surface for `../cases.ts`.
