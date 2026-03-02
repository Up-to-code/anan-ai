# Google OAuth Setup for anan-ai

Google OAuth is required for sign-in. Configure the following.

## 1. Google Cloud Console

1. Go to [Google Cloud Console – OAuth 2.0 credentials](https://console.cloud.google.com/apis/credentials)
2. Create or select an OAuth 2.0 Client ID (Web application)
3. Add **Authorized JavaScript origins**:
   ```
   https://<YOUR_CONVEX_SITE>.convex.site
   http://localhost:5173
   ```
4. Add **Authorized redirect URIs**:
   ```
   https://<YOUR_CONVEX_SITE>.convex.site/api/auth/callback/google
   ```
5. Copy the **Client ID** and **Client secret**

Replace `<YOUR_CONVEX_SITE>` with your Convex deployment name (e.g. `keen-oyster-497.eu-west-1`). Get it from `npx convex dev` output or the Convex dashboard.

## 2. Convex environment variables

Set in [Convex Dashboard](https://dashboard.convex.dev) → Settings → Environment Variables, or via CLI:

```
SITE_URL=https://<YOUR_CONVEX_SITE>.convex.site
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173,https://<YOUR_CONVEX_SITE>.convex.site
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Important**: `SITE_URL` must be the Convex HTTP/site URL (`.convex.site`), not the dashboard or app URL. Auth callbacks go through Convex.

## 3. Dashboard .env

Create `dashboard/.env.local` (or `.env`) with:

```
VITE_CONVEX_URL=https://<YOUR_CONVEX_SITE>.convex.cloud
VITE_CONVEX_SITE_URL=https://<YOUR_CONVEX_SITE>.convex.site
```

The auth client uses `VITE_CONVEX_SITE_URL` as the base for OAuth. If missing, it falls back to `VITE_CONVEX_URL` with `.cloud` replaced by `.site`.

## 4. Dev proxy (local testing)

The dashboard Vite dev server proxies `/api/auth` to the Convex site. Ensure `dashboard/.env` has `VITE_CONVEX_URL` or `VITE_CONVEX_SITE_URL` so the proxy target is correct.

## 5. Verify

1. Run `npx convex dev` (from anan-lit root) and `pnpm dev` (from dashboard)
2. Open http://localhost:5173 and click "Sign in"
3. You should be redirected to Google, then back to the app after sign-in

If OAuth fails, check:
- Redirect URI in Google Console matches exactly (including `/api/auth/callback/google`)
- `SITE_URL` and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set in Convex
- `VITE_CONVEX_SITE_URL` is set in dashboard `.env`
