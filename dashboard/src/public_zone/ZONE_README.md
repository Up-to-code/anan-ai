# Public Zone

## The Fortress Pattern

This folder is strictly an isolated **Fortress** holding all unauthenticated workflows like Landing Pages and Auth entry points.

**CRITICAL RULES:**
1. **API Gateway:** Exports from this zone are ONLY permitted via `index.ts`. Deep imports into `/landing/` from outside this zone will cause compilation errors.
2. **Error Isolation:** If modifying top-level layouts, ensure you do not break the `PublicZoneErrorBoundary` wrapping `App.tsx`.
3. **Strict API Location:** All new data-fetching hooks (if any exist for the public) MUST reside in `api/`.
4. **Orchestrator Pages:** For every new route added, create a folder under `auth/NewRoute/index.tsx` or `landing/NewRoute/index.tsx`. Pure React components belong in `components/`.

**DOCUMENTATION:**
Every single exported file in `api/`, `auth/`, or `landing/` must start with the JSDoc syntax:
`WHY: [...] WHAT: [...] HOW: [...]`
