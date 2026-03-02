# Backend: Broker Zone

## Architecture: The Fortress Pattern (Server-Side)

This zone owns all functions dedicated to Real Estate Brokers.

### 1. Handler Isolation
Convex functions in this folder MUST primarily target broker-specific schemas (`deals`, `offers`). Authorization checks must ensure only the owner or assigned broker can access data.

### 2. Service Pattern
Complex logic should reside in `services/`. Handlers should be thin Orchestrators.

### 3. Documentation (WHY/WHAT/HOW)
Mandatory for every exported handler.

### 4. Directives
- **X** DO NOT deep-import from `admin_zone`. Move shared logic to `shared_logic`.
- **X** ALWAYS use the specialized AI agents in `ai_zone` for matching logic via the `anan` orchestrator.
