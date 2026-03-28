# Client Web App (`apps/client-web`)

Standalone Next.js surface for Anan buyers and clients.

- `app/(public)` owns the landing, search, loans, about, and sign-in routes.
- `app/(client)` owns the chat-first assistant, property detail, history, and handoff routes.
- `client_zone/` owns the client-specific pages, hooks, components, and bilingual copy.

This app reuses Anan's Cairo-first, blue-led visual system and live buyer-facing Convex endpoints.

## Local setup

Set `apps/client-web/.env.local` with:

- `NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud`
- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<your-posthog-project-token>`
- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

Set the same PostHog env vars in Convex for backend buyer funnel and AI analytics:

- `npx convex env set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN <your-posthog-project-token> --deployment dev:<name>`
- `npx convex env set NEXT_PUBLIC_POSTHOG_HOST https://us.i.posthog.com --deployment dev:<name>`
