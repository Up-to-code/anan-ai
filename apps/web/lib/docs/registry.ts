import type { DocsNavGroup, DocsPageDefinition, DocsPageKey, DocsScope } from "./types";

const OAUTH_SCOPES: DocsScope[] = [
  { id: "openid", label: "Confirm your Anan identity" },
  { id: "profile", label: "Read your basic profile information" },
  { id: "email", label: "Read your verified email address" },
  { id: "offline_access", label: "Stay connected when you are not actively using Anan" },
  { id: "clients:read", label: "Read client records you can access" },
  { id: "clients:create", label: "Create clients on your behalf" },
  { id: "clients:update_own", label: "Update clients that belong to your account" },
  { id: "clients:read_own", label: "Read clients that belong to your account" },
  { id: "properties:read", label: "Read properties you can access" },
  { id: "properties:create_own", label: "Create properties that belong to your account" },
  { id: "properties:update_own", label: "Update properties that belong to your account" },
  { id: "properties:delete_own", label: "Delete properties that belong to your account" },
  { id: "properties:read_own", label: "Read properties that belong to your account" },
];

function scopeLabel(scopeId: string) {
  return OAUTH_SCOPES.find((scope) => scope.id === scopeId)?.label ?? scopeId;
}

export const docsPageOrder: DocsPageKey[] = [
  "getting-started",
  "api-keys",
  "oauth-overview",
  "oauth-get-credentials",
  "oauth-authorization-code-pkce",
  "scopes-and-org-permissions",
  "api-clients",
  "api-properties",
  "errors-and-security",
];

export const docsNavGroups: DocsNavGroup[] = [
  {
    id: "start",
    title: "Start Here",
    items: ["getting-started", "api-keys"],
  },
  {
    id: "oauth",
    title: "OAuth",
    items: ["oauth-overview", "oauth-get-credentials", "oauth-authorization-code-pkce"],
  },
  {
    id: "access",
    title: "Permissions & Access",
    items: ["scopes-and-org-permissions"],
  },
  {
    id: "api",
    title: "Delegated APIs",
    items: ["api-clients", "api-properties"],
  },
  {
    id: "ops",
    title: "Reliability & Security",
    items: ["errors-and-security"],
  },
];

export const docsPages: Record<DocsPageKey, DocsPageDefinition> = {
  "getting-started": {
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
  },
  "api-keys": {
    key: "api-keys",
    href: "/docs/api-keys",
    title: "Organization API Keys",
    description: "Self-service org-scoped API keys for internal server integrations.",
    summary:
      "Organization API keys are created from workspace settings, reveal their secret once, and can access only the owning organization’s clients and properties.",
    sections: [
      {
        id: "create-key",
        title: "Create a Key",
        bullets: [
          "Open Workspace Settings → API Keys as an organization manager.",
          "Choose a name and resource-action permissions for `clients` and `properties`.",
          "Copy the secret immediately after creation; Anan stores only a hash and will not show the full value again.",
          "Revoke the key from the same settings tab if it is no longer needed.",
        ],
      },
      {
        id: "authenticate",
        title: "Authenticate Requests",
        paragraphs: [
          "Send the key in the `X-Anan-Api-Key` header. The key is always scoped to the organization that created it; callers never provide org ids in requests.",
        ],
        codeExamples: [
          {
            title: "Environment variable",
            language: "bash",
            code: "export ANAN_ORG_API_KEY=\"anan_abcd1234.<secret>\"",
          },
          {
            title: "List org clients",
            language: "bash",
            code: "curl -sS -H \"X-Anan-Api-Key: $ANAN_ORG_API_KEY\" \"$ANAN_ISSUER/api/org/clients\"",
          },
        ],
      },
      {
        id: "permissions",
        title: "Permission Model",
        bullets: [
          "Permissions are granted per resource and action: `read`, `create`, `update`, `delete`.",
          "v1 resources are `clients` and `properties` only.",
          "A key can never escape its owning organization even if a foreign resource id is supplied.",
          "Revoked keys stop working immediately.",
        ],
      },
      {
        id: "endpoints",
        title: "Available Endpoints",
        endpoints: [
          {
            title: "Clients collection",
            method: "GET",
            path: "/api/org/clients",
            description: "Lists CRM clients owned by the current organization.",
            notes: ["Requires `clients:read` permission."],
          },
          {
            title: "Create client",
            method: "POST",
            path: "/api/org/clients",
            description: "Creates a CRM client under the current organization.",
            notes: ["Requires `clients:create` permission."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "name": "Al Noor Investments",
  "phone": "+966511111111",
  "email": "team@alnoor.example"
}`,
            },
          },
          {
            title: "Properties collection",
            method: "GET",
            path: "/api/org/properties",
            description: "Lists properties owned by the current organization.",
            notes: ["Requires `properties:read` permission."],
          },
          {
            title: "Create property",
            method: "POST",
            path: "/api/org/properties",
            description: "Creates a draft property under the current organization.",
            notes: ["Requires `properties:create` permission."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "title": "Palm Residences Unit 301",
  "address": "Al Olaya District, Riyadh",
  "price": 1250000,
  "beds": 3,
  "baths": 3,
  "description": "High-floor unit with city view"
}`,
            },
          },
        ],
      },
    ],
  },
  "oauth-overview": {
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
  },
  "oauth-get-credentials": {
    key: "oauth-get-credentials",
    href: "/docs/oauth/get-credentials",
    title: "Authentication & Credentials",
    description: "How to obtain and configure your Anan API Keys and OAuth app credentials.",
    summary:
      "Organization API keys are self-service from workspace settings, while OAuth app credentials remain onboarding-managed for delegated user access.",
    sections: [
      {
        id: "organization-api-keys",
        title: "Organization API Keys",
        paragraphs: [
          "Use organization API keys for first-party server integrations that should read or write only the current organization’s clients and properties.",
          "Managers can create these keys directly from Workspace Settings → API Keys. The secret is shown once and must be stored securely on your side.",
        ],
        codeExamples: [
          {
            title: "Using an organization API key",
            language: "typescript",
            code: `const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/properties\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY!
  }
});`
          },
        ],
      },
      {
        id: "oauth-credentials",
        title: "OAuth Credentials",
        bullets: [
          "`client_id` (always)",
          "`client_secret` (confidential clients only)",
          "approved redirect URI list",
          "approved scope allowlist",
        ],
      },
      {
        id: "provisioning-model",
        title: "Provisioning Model",
        callouts: [
          {
            title: "Self-Service Keys",
            body: "Organization API keys are created directly by organization managers from workspace settings.",
            tone: "info",
          },
          {
            title: "OAuth Still Uses Onboarding",
            body: "OAuth client credentials are still provisioned by Anan onboarding. There is no public self-service endpoint for creating external OAuth apps.",
            tone: "warning",
          },
        ],
      },
      {
        id: "environment-setup",
        title: "Environment Setup",
        codeExamples: [
          {
            title: "Suggested environment variables",
            language: "bash",
            code: `export ANAN_ISSUER="https://<your-anan-issuer>"
export ANAN_ORG_API_KEY="<workspace-generated-api-key>"
export ANAN_CLIENT_ID="<provided-client-id>"
export ANAN_CLIENT_SECRET="<provided-client-secret-if-confidential>"
export ANAN_REDIRECT_URI="https://your-app.example.com/oauth/callback"`,
          },
        ],
      },
    ],
  },
  "oauth-authorization-code-pkce": {
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
  },
  "scopes-and-org-permissions": {
    key: "scopes-and-org-permissions",
    href: "/docs/scopes-and-org-permissions",
    title: "Scopes and Organization Permissions",
    description: "How scopes and ownership context affect delegated API access.",
    summary:
      "Access decisions are scope-driven and ownership-aware. Delegated resource handlers resolve caller context from token and user profile, including broker/RED links for organization-scoped resources.",
    sections: [
      {
        id: "scope-basics",
        title: "Scope Basics",
        paragraphs: [
          "Request the minimum scope set for each feature. Some endpoints accept either broad read scopes or own-resource read scopes.",
          "Examples: clients list accepts `clients:read_own` or `clients:read`; properties list accepts `properties:read_own` or `properties:read`.",
        ],
      },
      {
        id: "ownership-context",
        title: "Organization Ownership Context",
        bullets: [
          "Delegated handlers resolve token context and user profile before resource access.",
          "For property access, ownership links (`brokerId`, `REDId`) are used to scope delegated resources.",
          "For client access, owner auth user id is used to list user-owned clients.",
        ],
      },
      {
        id: "recommended-scope-profiles",
        title: "Recommended Scope Profiles",
        bullets: [
          "Read-only CRM sync: `openid profile clients:read_own properties:read_own`",
          "Client creation workflow: `openid profile clients:read_own clients:create`",
          "Property publishing assistant: `openid profile properties:read_own properties:create_own properties:update_own`",
        ],
      },
      {
        id: "scope-reference",
        title: "Scope Reference",
        scopes: OAUTH_SCOPES,
      },
    ],
  },
  "api-clients": {
    key: "api-clients",
    href: "/docs/api/clients",
    title: "Delegated Clients API",
    description: "Read and create CRM clients with delegated OAuth access.",
    summary:
      "Use `/api/oauth/clients` for delegated client operations. Scope requirements are enforced per method and caller identity.",
    sections: [
      {
        id: "clients-get",
        title: "List Delegated Clients",
        endpoints: [
          {
            title: "List clients",
            method: "GET",
            path: "/api/oauth/clients",
            description: "Returns CRM clients accessible to the delegated caller.",
            requiredScopes: ["clients:read_own", "clients:read"],
            notes: [
              "Requires bearer token in Authorization header.",
              "At least one of these scopes is required: `clients:read_own` or `clients:read`.",
              "Caller identity comes from access token context.",
            ],
            responseExample: {
              title: "Example response",
              language: "json",
              code: `{
  "clients": [
    {
      "_id": "<client-id>",
      "name": "Alya Trading",
      "email": "ops@alya.example",
      "phone": "+966500000000"
    }
  ]
}`,
            },
          },
        ],
      },
      {
        id: "clients-post",
        title: "Create Delegated Client",
        endpoints: [
          {
            title: "Create client",
            method: "POST",
            path: "/api/oauth/clients",
            description: "Creates a CRM client on behalf of the delegated user.",
            requiredScopes: ["clients:create"],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "name": "Al Noor Investments",
  "phone": "+966511111111",
  "email": "team@alnoor.example",
  "notes": "Imported from partner portal"
}`,
            },
            responseExample: {
              title: "Created response",
              language: "json",
              code: `{
  "client": {
    "_id": "<client-id>",
    "name": "Al Noor Investments"
  }
}`,
            },
          },
        ],
      },
      {
        id: "clients-type-safety",
        title: "Response Expectation & Type Safety",
        paragraphs: [
          "For seamless integration, use our provided TypeScript definitions to ensure type safety when handling responses and requests."
        ],
        codeExamples: [
          {
            title: "TypeScript Definitions",
            language: "typescript",
            code: `export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface ListClientsResponse {
  clients: Client[];
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}`
          }
        ]
      },
      {
        id: "clients-examples",
        title: "Code Examples",
        codeExamples: [
          {
            title: "GET clients (TypeScript fetch)",
            language: "typescript",
            code: `async function getClients(): Promise<Client[]> {
  const res = await fetch(\`\${process.env.ANAN_ISSUER}/api/oauth/clients\`, {
    headers: { Authorization: \`Bearer \${process.env.ACCESS_TOKEN}\` }
  });
  
  if (!res.ok) throw new Error("Failed to fetch clients");
  
  const data = await res.json() as ListClientsResponse;
  return data.clients;
}`
          },
          {
            title: "POST client (JavaScript fetch)",
            language: "javascript",
            code: `async function createClient(clientData) {
  const res = await fetch(\`\${process.env.ANAN_ISSUER}/api/oauth/clients\`, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.ACCESS_TOKEN}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(clientData)
  });
  
  return res.json();
}

// Usage
createClient({ name: "Al Noor Investments", email: "team@alnoor.example" });`
          },
        ],
      },
    ],
  },
  "api-properties": {
    key: "api-properties",
    href: "/docs/api/properties",
    title: "Delegated Properties API",
    description: "Read and create properties with delegated OAuth access.",
    summary:
      "Use `/api/oauth/properties` for delegated property operations. Ownership is tied to caller profile context and scope permissions.",
    sections: [
      {
        id: "properties-get",
        title: "List Delegated Properties",
        endpoints: [
          {
            title: "List properties",
            method: "GET",
            path: "/api/oauth/properties",
            description: "Returns properties accessible through caller ownership links.",
            requiredScopes: ["properties:read_own", "properties:read"],
            notes: [
              "At least one of these scopes is required: `properties:read_own` or `properties:read`.",
            ],
            responseExample: {
              title: "Example response",
              language: "json",
              code: `{
  "properties": [
    {
      "_id": "<property-id>",
      "title": "Palm Residences Unit 301",
      "publicationState": "draft",
      "status": "available"
    }
  ]
}`,
            },
          },
        ],
      },
      {
        id: "properties-post",
        title: "Create Delegated Property",
        endpoints: [
          {
            title: "Create property",
            method: "POST",
            path: "/api/oauth/properties",
            description: "Creates a draft property owned via caller broker/RED context.",
            requiredScopes: ["properties:create_own"],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "title": "Palm Residences Unit 301",
  "address": "Al Olaya District, Riyadh",
  "price": 1250000,
  "beds": 3,
  "baths": 3,
  "description": "High-floor unit with city view",
  "area": "160 sqm",
  "location": "Riyadh"
}`,
            },
            responseExample: {
              title: "Created response",
              language: "json",
              code: `{
  "property": {
    "_id": "<property-id>",
    "title": "Palm Residences Unit 301",
    "publicationState": "draft"
  }
}`,
            },
          },
        ],
      },
      {
        id: "properties-curl",
        title: "cURL Examples",
        codeExamples: [
          {
            title: "GET properties",
            language: "bash",
            code: "curl -sS -H \"Authorization: Bearer $ACCESS_TOKEN\" \"$ANAN_ISSUER/api/oauth/properties\"",
          },
          {
            title: "POST property",
            language: "bash",
            code: `curl -sS -X POST "$ANAN_ISSUER/api/oauth/properties" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Palm Residences Unit 301","address":"Riyadh","price":1250000,"beds":3,"baths":3,"description":"High-floor unit"}'`,
          },
        ],
      },
    ],
  },
  "errors-and-security": {
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
  },
};

export function getDocsPage(pageKey: DocsPageKey) {
  return docsPages[pageKey];
}

export function getDocsPageSiblings(pageKey: DocsPageKey) {
  const index = docsPageOrder.indexOf(pageKey);
  return {
    previousPageKey: index > 0 ? docsPageOrder[index - 1] : undefined,
    nextPageKey: index >= 0 && index < docsPageOrder.length - 1 ? docsPageOrder[index + 1] : undefined,
  } as const;
}

export function getDocsSectionId(pageKey: DocsPageKey, sectionId: string) {
  return `${pageKey}-${sectionId}`;
}

export function getScopeLabel(scopeId: string) {
  return scopeLabel(scopeId);
}
