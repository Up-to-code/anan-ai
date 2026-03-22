## Domain Services

Each domain service coordinates one business capability:

- validate intent and inputs
- require the current session when needed
- delegate persistence to repository adapters
- return stable web-facing DTOs and domain errors

Controllers should not contain business orchestration.

Surface-aligned entrypoints:

- `domains/public/**` for public route handlers.
- `domains/auth/**` for auth-session-owned route handlers.
- `domains/workspace/**` for authenticated workspace and org route handlers.
