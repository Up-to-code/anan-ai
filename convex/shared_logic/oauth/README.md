# Shared OAuth Logic

This folder contains the auth-provider business logic that sits above `_core/oauth`:

- user-facing consent and security-center queries/actions
- internal token/code/grant persistence
- delegated resource APIs for OAuth bearer tokens

The HTTP edge lives in `_core/oauth/http.ts`; thin public handlers live in `index.ts`.
