# Search (Full-Text Indexes + Queries)

---

## WHY

Search should not be implemented by scanning tables and filtering in JS.

Convex supports full-text search indexes at the schema layer, and `withSearchIndex` at the query layer. Use them for:

- knowledge retrieval,
- developer handbook retrieval,
- property search,
- any feature that needs “text contains …”.

---

## WHAT

This chapter documents:

- how to define `.searchIndex(...)` in schema,
- how to use `.withSearchIndex(...)` safely,
- how to avoid correctness/perf traps.

---

## HOW (Repo pattern)

### Schema

Example (properties):

- Schema defines search indexes in `convex/_core/schema/properties.ts`.

Pattern:

- `.searchIndex("search_full", { searchField: "searchText" })`

### Query

Example (properties search):

- `convex/shared_logic/properties/search.ts`

Pattern:

```ts
ctx.db
  .query("properties")
  .withSearchIndex("search_full", (s) => s.search("searchText", normalizedQuery))
  .take(limit)
```

### Rules

1. Normalize input (trim, collapse whitespace).
2. Take a bounded number of results.
3. Apply *post filters* only when they can’t be expressed in index/search constraints.
4. Never scan and score an unbounded set in JS.

Official reference:

- https://docs.convex.dev/search

