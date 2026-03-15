---
name: convex-docs
description: Convex reference for this repo. Use for Convex schema/functions, auth, env vars, and deployment workflows; consult references/llms.txt for up-to-date Convex guidance.
---

# Convex (Repo Skill)

Use this skill whenever a task touches Convex in this repo:
- Writing or changing Convex `query` / `mutation` / `action` / `httpAction`
- Updating `convex/schema.ts` or generated types
- Debugging Convex auth/session issues
- Setting Convex environment variables or deploying (dev/prod)

## Primary reference
- Read: `references/llms.txt` (progressively; search within it for the specific topic).

## Repo-specific workflow notes

### Run / generate
```bash
pnpm -C apps/web dev
```

```bash
npx convex dev
```

### Deploy (be explicit)
- Dev deploy (one-shot): `npx convex dev --once`
- Prod deploy: `npx convex deploy`

### Environment variables (Convex)
Use Convex env vars for correct redirects / absolute URLs:
- `ANAN_WEB_URL` (preferred)
- `SITE_URL`

Example:
```bash
npx convex env set ANAN_WEB_URL https://anan-lit-web.vercel.app --deployment dev:<name>
```

## How to use the reference effectively
1. Search the reference file for the keyword/topic (e.g. “auth”, “deployments”, “env”, “httpAction”, “indexes”).
2. Apply the smallest change that matches Convex’s recommended patterns.
3. Verify locally by running `npx convex dev` and exercising the route / query from the web app.

