# anan-lit Convex Rules (Architecture Contract)

This file is the source of truth for writing Convex backend code in `anan-lit`.

## 1) Zone Ownership

- `_core`: auth/bootstrap/schema/http wiring.
- `shared_logic`: reusable services, middleware, retry policies, cross-zone business logic.
- `admin_zone`, `broker_zone`, `red_zone`, `user_zone`, `public_zone`, `ai_zone`: feature-owned handlers only.

Rule: handlers in zone folders stay thin and delegate logic to zone services or `shared_logic`.

## 2) Handler Pattern (Mandatory)

For every `query/mutation/action`:

1. Validate args with `v.*`.
2. Resolve identity/authorization quickly.
3. Delegate to one service function.
4. Return typed output.

### Good
- Small handler, large testable service.
- One function = one responsibility.

### Bad
- Handler performs long loops, cross-zone joins, external requests, and retries inline.

## 3) Query vs Mutation vs Action vs Workflow

- `query`: read-only DB operations.
- `mutation`: DB writes, transactional business logic.
- `action`: network/external APIs/heavy compute.
- `workflow`: multi-step durable orchestration with retries and step tracking.

## 4) Authorization Rules

- Always derive identity from server context (`ctx.auth` or `authComponent`).
- Use role checkers (`brokerChecker`, `REDChecker`, `adminChecker`) for protected zones.
- Enforce verification on publication/distribution writes (e.g. publishing inventory/offers).
- Draft create/update writes may be allowed for unverified broker/RED accounts.

## 5) Retry Policy

Central policy in `shared_logic/lib/retry.ts`:

- HTTP tools: max `3` attempts.
- Workflows: max `5` attempts.
- Backoff: exponential with jitter (`250ms`, base `2`, capped at `4s`).
- Retry only transient classes (`429`, `503`, timeout, transient network reset).

Never retry non-idempotent writes without idempotency keys.

## 6) Middleware Rules

- `shared_logic/lib/middleware/auth.ts`: channel-level auth guards.
- `shared_logic/lib/middleware/rateLimit.ts`: centralized rate limiting.

Do not leave middleware as placeholders. If a channel is not implemented, return explicit typed failure reasons.

## 7) Service Decomposition Rules

When a function grows:

- Split into helpers by responsibility (auth/profile lookup, validation, write path, response shaping).
- Move reusable logic into `services/`.
- Keep each helper deterministic and unit-testable.

## 8) Naming and Paths

- Use canonical route/role naming in app-facing logic:
  - role remains `RED` in DB/profile
  - route segment is lowercase `red`
- Avoid legacy naming (`developer`) except compatibility redirects.

## 9) Testing Requirements

Minimum for changed feature:

- happy path
- authorization failure
- validation failure
- retry behavior (when external calls involved)

Target gates:

- `npm run typecheck`
- `npm run test:once`

## 10) AI Agent Orchestration Contract

- Main orchestration entrypoint lives in `ai_zone/agents/orchestration/mainAgent.ts`.
- Public API: `runMainAgent(input) => output`.
- Channel-specific logic goes under `orchestration/handlers`.
- Tool adapters go under `orchestration/tools`.

## 11) Practical Best/Worst Examples

### Best case
- `mutation` handler checks identity + role and calls `createXService`.
- Service uses helper functions and returns typed result.
- External fetch in an `action` uses `fetchJsonWithRetry`.

### Worst case
- Frontend-triggered handler performs direct role guessing from args.
- Business rules duplicated across `admin_zone` and `broker_zone` handlers.
- Hardcoded retries scattered in multiple files.
