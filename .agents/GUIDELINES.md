# Global LLM Agent Guidelines — anan-lit

> **Every AI agent (Gemini, Claude, GPT, Cursor, Copilot, etc.) MUST read this file before writing any code in this repo.**

---

## 1. Read Before You Code

| Document | When to read |
|----------|-------------|
| `CONVEX_RULES.md` | Before any Convex backend change |
| `.agents/skills/anan-platform-knowledge/SKILL.md` | Before any design, architecture, or feature decision |
| `.agents/skills/convex-docs/SKILL.md` | Before writing Convex queries, mutations, or actions |
| `.agents/skills/mobile-native-ui-ux/SKILL.md` | Before changing buyer mobile cards, React Native interaction patterns, or mobile AI conversation UI |
| `.agents/skills/ux-design-gemini/SKILL.md` | Before mobile UX, composer, or interaction-pattern changes |
| `apps/mobile/README.md` | Before changing mobile buyer UI behavior or shared mobile interaction rules |
| Zone's `ZONE_README.md` | Before touching any zone folder |

---

## 2. Convex: Use the Built-In Primitives

### ❌ Never do this

```typescript
// Custom subscription machinery — Convex useQuery is already real-time
const convex = useConvex();
const watch = convex.watchQuery(api.foo.bar, {});
useSyncExternalStore(subscribe, getSnapshot);
```

### ✅ Always do this

```typescript
// useQuery is reactive by default — one line, zero bugs
const data = useQuery(api.foo.bar, {});
```

**Rule:** Never reimplement what Convex already provides (`useQuery`, `useMutation`, `useAction`). The built-in hooks handle subscriptions, caching, deduplication, and error boundaries.

---

## 3. Database Reads: Index-First, Always Bounded

### ❌ Never do this

```typescript
// Full table scan — O(N) reads on every subscription tick
const all = await ctx.db.query("userProfiles").collect();
const match = all.find(p => p.email === email);
```

### ✅ Always do this

```typescript
// Indexed lookup — O(1) read
const match = await ctx.db
  .query("userProfiles")
  .withIndex("email", q => q.eq("email", email))
  .first();
```

### Rules

1. **Use `.withIndex()` for lookups.** Never `.collect().find()` or `.collect().filter()`.
2. **Never use unbounded `.collect()` in a `query`.** Queries are reactive — an unbounded collect runs on every subscription tick and reads the entire table.
3. **Use `.take(N)` when `.collect()` is unavoidable.** Cap reads: `.order("desc").take(200)`.
4. **Use `action` or `internalQuery` for heavy aggregations** that don't need real-time reactivity.
5. **Check if an index exists** in `convex/_core/schema/` before writing a table-scan fallback.

---

## 4. React: Stable References

### ❌ Never do this

```typescript
// New function identity every render → infinite re-subscription
useEffect(() => {
  const watch = convex.watchQuery(api.foo, {});
}, []); // stale closure

useSafeLiveQuery(() => convex.watchQuery(api.foo, {})); // new fn every render
```

### ✅ Always do this

```typescript
// useCallback for stable identity when passing functions as deps
const handler = useCallback(() => { /* ... */ }, [dep]);
```

**Rules:**
- Memoize callbacks passed as dependencies (`useCallback`, `useMemo`).
- Never create inline arrow functions for subscription factories.
- Prefer Convex's `useQuery` over manual `watchQuery` + `useSyncExternalStore`.

---

## 5. Architecture: Don't Over-Engineer

### Rules

1. **No god files.** Break complex pages into `Folder/index.tsx` + focused sub-components.
2. **No wrapper hooks that just re-export a primitive.** If `useQuery(api.foo, {})` is enough, don't create `useFooLiveQuery`.
3. **No duplicate abstractions.** Check `shared_logic/` before building a new utility.
4. **Delete dead code.** Don't leave unused types, helpers, or imports behind.
5. **JSDoc `WHY/WHAT/HOW` on every export.** No exceptions.

---

## 6. Performance Red Flags

If you see any of these in a PR, **stop and fix**:

| Red Flag | Fix |
|----------|-----|
| `.collect()` without `.withIndex()` in a `query` | Add index or use `.take(N)` |
| `.collect().find()` or `.collect().filter()` | Use `.withIndex().first()` or `.withIndex().collect()` |
| Custom `useSyncExternalStore` wrapping Convex | Replace with `useQuery` |
| `useConvex()` + `watchQuery()` in components | Replace with `useQuery` |
| Inline arrow functions as hook/effect deps | Memoize with `useCallback` |
| A `query` reading 3+ tables with `.collect()` | Consider `action` or add `.take(N)` bounds |
| React component >400 lines | Break into sub-components |

---

## 7. Naming & Conventions

- **Schema-level:** Use `RED` / `REDId` (storage names).
- **Contract-level:** Normalize to `developer` / `redId` at API boundaries only.
- **Arabic strings:** Use Arabic for user-facing labels, English for code identifiers.
- **File naming:** `camelCase.ts` for utilities, `PascalCase.tsx` for components.

---

## 8. Testing

- Add tests when changing: ownership checks, offer transitions, inbox counters, channel rules.
- Use the Convex test harness (`convex/test.setup.ts`).
- **Minimum bar:** If a bug was possible before your change, add a test preventing regression.

---

## 9. Quick Checklist Before Submitting

- [ ] No unbounded `.collect()` in any `query`
- [ ] All lookups use indexes
- [ ] No custom subscription machinery (use `useQuery`)
- [ ] No unused imports or dead code left behind
- [ ] JSDoc `WHY/WHAT/HOW` on every new export
- [ ] Existing tests still pass
