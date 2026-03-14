# Convex Best Practices (Repo-Aligned)

---

## WHY

Convex makes it easy to ship features quickly, but the same ease can create silent correctness and performance problems:

- table scans in queries (`collect()`),
- authorization checks drift between modules,
- webhook handlers grow into “god handlers”,
- search implemented as scans instead of search indexes.

This chapter aligns official Convex best practices with our platform rules.

---

## WHAT

Practical guidance for this repo:

- use indexes and search indexes,
- prefer projections over raw rows,
- keep handlers thin and delegate to owning services,
- treat authZ and ownership as non-negotiable.

---

## HOW (Rules you must follow here)

### 1) Index-first and search-index-first

- Use `withIndex` for structured lookups.
- Use `searchIndex` + `withSearchIndex` for text retrieval.

Reference (official):

- https://docs.convex.dev/database
- https://docs.convex.dev/search

### 2) Avoid unbounded `collect()`

Treat `collect()` as a scan.

If a table can grow, do not `collect()` it for:

- directory searches,
- “company knowledge retrieval”,
- unread summaries,
- or “get latest” logic.

Use:

- index lookups,
- search indexes,
- pagination,
- summary queries.

### 3) Prefer stable projections

Return DTO-like shapes from queries (even inside Convex) to keep surfaces decoupled from storage layout.

### 4) Mutations must enforce prior state

Every mutation is a state transition and must verify:

- current state,
- ownership,
- prerequisites.

### 5) Actions are for external I/O and non-determinism

Use actions for:

- LLM calls,
- vendor APIs,
- heavy work.

Keep them authorization-safe and delegated.

Reference (official):

- https://docs.convex.dev/functions

---

## Where to change code

- Schema indexes: `convex/_core/schema/*`
- Search usage patterns: `convex/shared_logic/properties/search.ts` (reference implementation)
- Access policy helpers: `convex/_core/security/accessPolicy.ts`

