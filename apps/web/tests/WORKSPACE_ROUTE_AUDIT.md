# Workspace Route Audit

This note keeps the workspace regression suite intentional.

## Public marketing/docs

Smoke-only coverage. These routes do not depend on workspace org context.

## Authenticated non-org

Auth-only coverage. These routes require a valid session but do not depend on a linked organization.

## Org-aware workspace pages and APIs

These surfaces require bootstrap regression coverage for stale owner links or late active-org claims:

- `/ws`
- `/ws/inbox`
- `/ws/projects`
- `/ws/crm`
- `/ws/offers/create`
- `/api/workspaces`
- `/api/organizations`
- `/api/organizations/current/sync`

Workspace shell signal counts and notification reads are loaded through server functions during SSR, not through `/api/workspace/signals`.

The browser suite in `/Users/ahmedmansour/anan-lit/apps/web/tests/workspace-bootstrap.spec.ts` and the SSR/service tests under `/Users/ahmedmansour/anan-lit/apps/web/app/(ws)/ws` and `/Users/ahmedmansour/anan-lit/apps/web/server` are the primary regression net for this class of failures.
