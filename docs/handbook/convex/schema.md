# Convex Schema (Tables, Indexes, Naming)

---

## WHY

Schema is architecture, not plumbing. The schema defines:

- what the platform can represent,
- what can be queried efficiently (indexes),
- how ownership is enforced,
- how multiple surfaces share capabilities without duplicating logic.

---

## WHAT

In this repo:

- Table definitions live in `convex/_core/schema/*`.
- The final schema is assembled in `convex/schema.ts`.

The schema is deliberately split into domain fragments (users, auth, agencies, properties, search, knowledge, sales, crm, offers, ai, workspace, admin, contact, etc.).

---

## HOW (Add / change schema safely)

### Naming rules (storage vs contracts)

- Storage-level fields should match existing schema naming conventions.
- If you must expose a different naming convention to a surface, do it at the **contract boundary** (e.g., web DTOs), not inside the database schema.

**Example pattern:**

- DB uses `REDId` (developer org id).
- Web contract may expose `redId`.
- Do not store `redId` in Convex tables as a separate field.

### Index rules

Indexes are required for any read path that can grow.

When adding an index, ask:

1. What are the most common query predicates? (e.g., `publicationState`, `status`, `ownerId`, `conversationId`)
2. What are the most common sort orders? (e.g., newest-first, updatedAt)
3. Do we need a unique key? (e.g., `directKey`, normalized email)

Avoid:

- “scan all then filter in JS”.
- “take(200)” to find a row.

### Tenant org mapping

Tenant organizations are stored in the `convex-tenants` component, with Anan’s domain ownership linked via:

- `tenantOrgLinks` (in `convex/_core/schema/agencies.ts`) — maps tenant org id → broker/RED owner.
- `userProfiles.currentTenantOrgId` — the active tenant for the current profile.

Legacy membership tables remain only for migration and should not receive new writes.

### State fields

Do not collapse different lifecycle concepts:

- `publicationState` — visibility lifecycle (draft/published/archived).
- `status` — business outcome lifecycle (pending/accepted/qualified/etc.).

If a table needs both concepts, it gets both fields.

---

## Where to change code

- Schema fragments: `convex/_core/schema/*`
- Final wiring: `convex/schema.ts`
- Access policy: `convex/_core/security/*`

---

## Common pitfalls

- Adding a new table but forgetting the index for its primary lookup.
- Introducing duplicate naming that conflicts with schema conventions.
- Adding “helper” fields that are really projections that should be computed, not stored.
