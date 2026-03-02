# Security Rotation Checklist

- Rotate all credentials exposed in logs/chats (OAuth client secrets, Convex keys, JWT private keys).
- Invalidate existing session tokens; force logout for affected users.
- Regenerate Better Auth signing keys and update environment variables.
- Verify CORS/allowed origins after rotation.
- Re-run `npx convex codegen` and redeploy after env updates.
- Confirm logs are redacted for cookies/authorization headers going forward.
