# Backend: Admin Zone

## Architecture: The Fortress Pattern (Server-Side)

This zone owns all administrative logic. It is strictly isolated from other business domains.

### 1. Handler Isolation
Convex functions in this folder MUST only be accessible by users with the `admin` role. Logic that is reusable by other zones should be moved to `convex/shared_logic`.

### 2. Service Pattern
Complex business logic (e.g., specific bank calculation logic or user permission merging) should live in the `services/` subdirectory as side-effect-free functions. The main Convex handlers should act as Orchestrators that handle the database I/O and call these services.

### 3. Documentation (WHY/WHAT/HOW)
Mandatory for every exported `query` or `mutation`. 

```typescript
/**
 * WHY:   Allows root administrators to review system-wide bank entities.
 * WHAT:  Returns a paginated list of banks filtered by status.
 * HOW:   Uses `db.query("banks")` with a strict index filter.
 */
export const listBanks = query(...)
```

### 4. Directives
- **X** DO NOT import directly from another zone's handler files.
- **X** DO NOT bypass the centralized retry logic in `shared_logic`.
