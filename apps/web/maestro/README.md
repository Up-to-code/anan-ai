# Maestro Web E2E

This workspace mirrors the high-value Playwright flows at a UI level.

Required environment:

- `MAESTRO_WEB_URL`, for example `http://localhost:3000`
- `E2E_SHARED_SECRET`
- `E2E_TEST_MODE=true` on the running web server
- Seeded persona env vars consumed by `/api/e2e/session`
- Optional dedicated `broker-onboarding` and `developer-onboarding` persona env vars for full-suite onboarding runs

Run from `apps/web`:

```bash
pnpm test:e2e:maestro
```

The flows bootstrap auth by opening `/api/e2e/session` with the shared secret in non-production E2E mode, then follow the redirected workspace route.
