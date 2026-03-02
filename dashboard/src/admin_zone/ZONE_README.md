# Admin Zone

## The Fortress Pattern

This folder is strictly an isolated **Fortress**. It owns standard administrative features and operations. 

**CRITICAL RULES:**
1. **API Gateway:** Exports from this zone are ONLY permitted via `index.ts`. Deep imports into `/pages/` from outside this zone will cause compilation errors.
2. **Error Isolation:** If modifying top-level layouts, ensure you do not break the `AdminZoneErrorBoundary` wrapping `App.tsx`.
3. **Strict API Location:** All new data-fetching hooks (e.g., getting users, updating banks) MUST reside in the `api/` directory.
4. **Orchestrator Pages:** For every new route added, create a folder under `pages/NewRoute/index.tsx`. Pure React components belong in `pages/NewRoute/components/`.

**DOCUMENTATION:**
Every single exported file in `api/` or `pages/` must start with the JSDoc syntax:
`WHY: [...] WHAT: [...] HOW: [...]`
