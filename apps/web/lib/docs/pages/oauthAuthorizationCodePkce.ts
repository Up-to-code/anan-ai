import type { DocsPageDefinition } from "../types";
export const oauthAuthorizationCodePkcePage: DocsPageDefinition = {
    key: "oauth-authorization-code-pkce",
    href: "/docs/oauth/authorization-code-pkce",
    title: "Authorization Code + PKCE",
    description: "Complete browser authorization flow and token exchange examples.",
    summary:
      "Use Authorization Code + PKCE for user-granted delegated access. Include `state`, enforce callback validation, and store refresh tokens securely.",
    sections: [
      {
        id: "authorize-request",
        title: "Step 1: Redirect to `/authorize`",
        paragraphs: [
          "Request authorization code with PKCE (`code_challenge_method=S256`). Include only the scopes your feature needs.",
        ],
        codeExamples: [
          {
            title: "Authorize URL example",
            language: "text",
            code: `$ANAN_ISSUER/authorize?response_type=code&client_id=$ANAN_CLIENT_ID&redirect_uri=$ANAN_REDIRECT_URI&scope=openid%20profile%20offline_access%20clients:read_own&state=<opaque-state>&code_challenge=<pkce-challenge>&code_challenge_method=S256`,
          },
        ],
      },
      {
        id: "token-exchange",
        title: "Step 2: Exchange code at `/token`",
        paragraphs: [
          "Exchange the returned authorization code for access token. Include `code_verifier` that matches your original PKCE challenge.",
          "Confidential clients can authenticate with HTTP Basic (`client_id:client_secret`). Public clients can use `client_id` in form body without a secret.",
        ],
        codeExamples: [
          {
            title: "Authorization code grant",
            language: "bash",
            code: `curl -sS -X POST "$ANAN_ISSUER/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -u "$ANAN_CLIENT_ID:$ANAN_CLIENT_SECRET" \\
  --data-urlencode "grant_type=authorization_code" \\
  --data-urlencode "code=$AUTHORIZATION_CODE" \\
  --data-urlencode "redirect_uri=$ANAN_REDIRECT_URI" \\
  --data-urlencode "code_verifier=$PKCE_CODE_VERIFIER"`,
          },
          {
            title: "Authorization code grant (public client)",
            language: "bash",
            code: `curl -sS -X POST "$ANAN_ISSUER/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  --data-urlencode "grant_type=authorization_code" \\
  --data-urlencode "client_id=$ANAN_CLIENT_ID" \\
  --data-urlencode "code=$AUTHORIZATION_CODE" \\
  --data-urlencode "redirect_uri=$ANAN_REDIRECT_URI" \\
  --data-urlencode "code_verifier=$PKCE_CODE_VERIFIER"`,
          },
          {
            title: "Token response shape",
            language: "json",
            code: `{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "openid profile offline_access clients:read_own",
  "refresh_token": "<refresh-token>"
}`,
          },
        ],
      },
      {
        id: "refresh-exchange",
        title: "Step 3: Refresh token",
        paragraphs: [
          "Use refresh token grant when access token expires. Keep refresh token encrypted at rest and rotate according to your security policy.",
        ],
        codeExamples: [
          {
            title: "Refresh token grant",
            language: "bash",
            code: `curl -sS -X POST "$ANAN_ISSUER/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -u "$ANAN_CLIENT_ID:$ANAN_CLIENT_SECRET" \\
  --data-urlencode "grant_type=refresh_token" \\
  --data-urlencode "refresh_token=$REFRESH_TOKEN"`,
          },
        ],
      },
      {
        id: "userinfo",
        title: "Optional: Query `/userinfo`",
        paragraphs: [
          "Use `/userinfo` for identity claims that match granted scopes (`profile`, `email`).",
        ],
        codeExamples: [
          {
            title: "Userinfo request",
            language: "bash",
            code: "curl -sS -H \"Authorization: Bearer $ACCESS_TOKEN\" \"$ANAN_ISSUER/userinfo\"",
          },
        ],
      },
    ],
};
