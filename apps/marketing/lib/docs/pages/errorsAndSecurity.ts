import type { DocsPageDefinition } from "../types";
export const errorsAndSecurityPage: DocsPageDefinition = {
    key: "errors-and-security",
    href: "/docs/errors-and-security",
    title: "Errors and Security",
    description: "Operational guardrails, revocation, and secure integration patterns.",
    summary:
      "Treat OAuth flows as security-critical: validate redirects, preserve state, rotate secrets, and handle token errors with safe retries and clear user recovery paths.",
    sections: [
      {
        id: "common-errors",
        title: "Common OAuth Errors",
        bullets: [
          "`invalid_request`: missing required authorize/token parameters.",
          "`invalid_grant`: expired, used, or mismatched authorization code / refresh token.",
          "`invalid_token`: expired or revoked bearer token on delegated endpoints.",
          "`insufficient_scope`: token lacks required scope for target endpoint/action.",
        ],
      },
      {
        id: "token-revocation",
        title: "Token Revocation",
        paragraphs: [
          "Revoke refresh-token families with `/revoke`. Revocation invalidates long-lived delegated access and should be part of app disconnect workflows.",
        ],
        codeExamples: [
          {
            title: "Revoke refresh token",
            language: "bash",
            code: `curl -sS -X POST "$ANAN_ISSUER/revoke" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -u "$ANAN_CLIENT_ID:$ANAN_CLIENT_SECRET" \\
  --data-urlencode "token=$REFRESH_TOKEN"`,
          },
        ],
      },
      {
        id: "security-checklist",
        title: "Security Checklist",
        bullets: [
          "Always use PKCE (`S256`) in authorization code flow.",
          "Validate `state` on callback before token exchange.",
          "Store tokens in secure backend storage, never localStorage for sensitive apps.",
          "Use least-privilege scopes and separate staging vs production credentials.",
          "Rotate client secret if compromise is suspected and revoke active tokens.",
        ],
        callouts: [
          {
            title: "Credential Hygiene",
            body: "Treat `client_secret` like a production secret. Keep it server-side only, and never expose it in browser source code.",
            tone: "warning",
          },
          {
            title: "Issuer Discovery First",
            body: "Prefer loading OAuth endpoint URLs from metadata (`/.well-known/oauth-authorization-server`) to avoid hardcoded endpoint drift.",
            tone: "success",
          },
        ],
      },
    ],
};
