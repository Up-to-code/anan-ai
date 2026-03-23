import type { DocsPageDefinition } from "../types";
export const gettingStartedPage: DocsPageDefinition = {
    key: "getting-started",
    href: "/docs/getting-started",
    title: "Getting Started",
    description: "Fast path from credentials to your first successful API call.",
    summary:
      "Choose between self-service organization API keys for org-owned server integrations or OAuth for delegated user access.",
    sections: [
      {
        id: "integration-checklist",
        title: "Integration Checklist",
        bullets: [
          "Choose your auth model first: organization API keys for backend-to-backend org access, or OAuth for delegated user access.",
          "For organization API keys, create the key in Workspace Settings → API Keys and store it securely because the full secret is shown once.",
          "For OAuth, get your `client_id` and `client_secret` from Anan onboarding and register redirect URIs before launch.",
          "Store API keys, access tokens, and refresh tokens securely; rotate or revoke them if you suspect exposure.",
          "Use the minimum permission set required for each integration path.",
        ],
      },
      {
        id: "base-endpoints",
        title: "Base Endpoints",
        paragraphs: [
          "Anan exposes two integration surfaces. Organization API keys call the workspace machine API under `/api/org/*`, while OAuth delegated integrations use `/authorize`, `/token`, and `/api/oauth/*`.",
          "Prefer organization API keys for first-party internal tools that should only touch the current organization’s data.",
        ],
        codeExamples: [
          {
            title: "List properties with an organization API key",
            language: "bash",
            code: "curl -sS -H \"X-Anan-Api-Key: $ANAN_ORG_API_KEY\" \"$ANAN_ISSUER/api/org/properties\"",
          },
          {
            title: "Fetch authorization-server metadata",
            language: "bash",
            code: "curl -sS \"$ANAN_ISSUER/.well-known/oauth-authorization-server\"",
          },
          {
            title: "Expected metadata keys (example)",
            language: "json",
            code: `{
  "issuer": "https://<anan-issuer>",
  "authorization_endpoint": "https://<anan-issuer>/authorize",
  "token_endpoint": "https://<anan-issuer>/token",
  "userinfo_endpoint": "https://<anan-issuer>/userinfo",
  "revocation_endpoint": "https://<anan-issuer>/revoke",
  "jwks_uri": "https://<anan-issuer>/jwks.json"
}`,
          },
        ],
      },
      {
        id: "first-oauth-call",
        title: "First OAuth Delegated API Call",
        paragraphs: [
          "After token exchange, start with a read operation. For example, list delegated clients with `clients:read` or `clients:read_own` scope.",
        ],
        codeExamples: [
          {
            title: "List delegated clients",
            language: "bash",
            code: "curl -sS -H \"Authorization: Bearer $ACCESS_TOKEN\" \"$ANAN_ISSUER/api/oauth/clients\"",
          },
        ],
      },
    ],
};
