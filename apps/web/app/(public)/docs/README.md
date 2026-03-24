# Web Docs Routes

This folder hosts the public developer documentation inside the main `web` Next.js app.

## Purpose
- Serve `/docs/*` from the same deployment as the public website.
- Keep docs reachable without requiring a separate Vercel project.
- Reuse the typed docs registry and renderer under `apps/web/app/(public)/docs/_components/docs` and `apps/web/lib/docs`.

## Structure
- `layout.tsx`: docs shell wrapper and metadata.
- `page.tsx`: `/docs` redirect to the getting-started page.
- nested routes: individual documentation pages.
