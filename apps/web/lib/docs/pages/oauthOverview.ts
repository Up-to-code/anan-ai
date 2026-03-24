import type { DocsPageDefinition } from "../types";
import { OAUTH_SCOPES } from "../scopes";

export const oauthOverviewPage: DocsPageDefinition = {
    key: "oauth-overview",
    href: "/docs/oauth/overview",
    title: "OAuth Overview",
    description: "How the Anan authorization server works end-to-end.",
    summary:
      "Anan supports OAuth 2.0 Authorization Code with PKCE, refresh tokens, OpenID user identity scopes, and delegated resource access with scoped permissions.",
    sections: [
      {
        id: "supported-features",
        title: "Supported Features",
        bullets: [
          "Authorization endpoint: `GET /authorize`",
          "Token endpoint: `POST /token`",
          "Userinfo endpoint: `GET|POST /userinfo`",
          "Revocation endpoint: `POST /revoke`",
          "Metadata endpoint: `GET /.well-known/oauth-authorization-server`",
          "JWKS endpoint: `GET /jwks.json`",
          "Grant types: `authorization_code`, `refresh_token`",
          "Token auth methods: `none`, `client_secret_basic`",
          "Code challenge method: `S256` (PKCE required for authorize flow)",
        ],
      },
      {
        id: "openid-and-api-scopes",
        title: "OpenID + Delegated API Scopes",
        summary:
          "Scopes control both user identity claims (`openid`, `profile`, `email`) and delegated data permissions (`clients:*`, `properties:*`).",
        scopes: OAUTH_SCOPES,
      },
      {
        id: "high-level-sequence",
        title: "High-Level Sequence",
        bullets: [
          "Redirect user to Anan `/authorize` with PKCE challenge and requested scopes.",
          "User signs in (if needed) and approves requested scopes on Anan consent page.",
          "Anan redirects back with authorization code and state.",
          "Exchange code for access token (and optionally refresh token).",
          "Call delegated APIs with bearer token and keep scopes minimal.",
        ],
      },
    ],
};
