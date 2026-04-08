import type { DocsPageDefinition } from "../types";
import { OAUTH_SCOPES } from "../scopes";

export const oauthOverviewPage: DocsPageDefinition = {
    key: "oauth-overview",
    href: "/docs/oauth/overview",
    title: "OAuth Overview",
    description: "How the Anan authorization server works end-to-end.",
    summary:
      "Anan supports OAuth 2.0 Authorization Code with PKCE, refresh tokens, and manager-approved organization app access with scoped delegated permissions.",
    sections: [
      {
        id: "supported-features",
        title: "Supported Features",
        bullets: [
          "Authorization endpoint: `GET /authorize`",
          "Token endpoint: `POST /token`",
          "Revocation endpoint: `POST /revoke`",
          "Metadata endpoint: `GET /.well-known/oauth-authorization-server`",
          "JWKS endpoint: `GET /jwks.json`",
          "Grant types: `authorization_code`, `refresh_token`",
          "Token auth methods: `none`, `client_secret_basic`",
          "Code challenge method: `S256` (PKCE required for authorize flow)",
        ],
      },
      {
        id: "delegated-api-scopes",
        title: "Delegated API Scopes",
        summary:
          "Scopes control delegated organization data permissions such as `clients:*`, `properties:*`, and `offline_access`.",
        scopes: OAUTH_SCOPES,
      },
      {
        id: "organization-approval-model",
        title: "Organization Approval Model",
        bullets: [
          "The consent screen asks the signed-in user to choose the target organization.",
          "A manager approves a new app connection or scope expansion once per organization.",
          "Members and viewers can continue existing approved flows without re-approving unchanged scopes.",
        ],
      },
      {
        id: "high-level-sequence",
        title: "High-Level Sequence",
        bullets: [
          "Redirect user to Anan `/authorize` with PKCE challenge and requested scopes.",
          "User signs in (if needed), chooses an organization, and approves requested scopes on Anan consent page.",
          "Anan redirects back with authorization code and state.",
          "Exchange code for access token (and optionally refresh token).",
          "Call delegated APIs with bearer token and keep scopes minimal.",
        ],
      },
    ],
};
