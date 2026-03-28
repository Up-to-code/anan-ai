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
  "org-clients",
  "org-properties",
  "errors-and-security",
];

export const docsNavGroups: DocsNavGroup[] = [
  {
    id: "start",
    title: "Start Here",
    items: ["getting-started", "api-keys"],
  },
  {
    id: "api",
    title: "Organization APIs",
    items: ["org-clients", "org-properties"],
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
    pageType: "guide",
    href: "/docs/getting-started",
    title: "Getting Started",
    description: "Fast path from credentials to your first successful API call.",
    summary:
      "Choose between manager-created organization API keys for broker or developer org data, or OAuth for delegated user access.",
    sections: [
      {
        id: "integration-checklist",
        title: "Integration Checklist",
        summary: "Start by choosing the correct auth model, then wire your environment and first request with the smallest possible permission set.",
        bullets: [
          "Choose your auth model first: organization API keys for backend-to-backend access to the current broker or developer organization, or OAuth for delegated user access.",
          "For organization API keys, create the key in Workspace Settings → API Keys as an organization manager and store it securely because the full secret is shown once.",
          "For OAuth, get your `client_id` and `client_secret` from Anan onboarding and register redirect URIs before launch.",
          "Store API keys, access tokens, and refresh tokens securely; rotate or revoke them if you suspect exposure.",
          "Use the minimum permission set required for each integration path.",
        ],
        callouts: [
          {
            title: "Recommended Starting Path",
            body: "Use organization API keys first if you are building an internal backend integration for one broker or developer organization. Move to OAuth only when you need delegated user authorization.",
            tone: "info",
          },
        ],
        relatedLinks: [
          {
            label: "Organization API Keys",
            href: "/docs/api-keys",
            description: "How managers create keys, choose permissions, and revoke access.",
          },
          {
            label: "Organization Clients API",
            href: "/docs/org-clients",
            description: "Machine API examples and endpoint references for client records.",
          },
        ],
      },
      {
        id: "base-endpoints",
        title: "Base Endpoints",
        summary: "The machine API and delegated OAuth API are separate on purpose. Choose one surface per request flow and keep that boundary clear in your integration.",
        paragraphs: [
          "Anan exposes two integration surfaces. Organization API keys call the workspace machine API under `/api/org/*`, while OAuth delegated integrations use `/authorize`, `/token`, and `/api/oauth/*`.",
          "Prefer organization API keys for first-party internal tools that should only touch the currently selected organization’s data. The key itself carries the organization binding, so requests never send broker, developer, or org ids for scoping.",
        ],
        codeExampleGroups: [
          {
            title: "List organization properties",
            description: "TypeScript is the default example. Use the selector to switch to JavaScript, C#/.NET, or cURL.",
            defaultLanguage: "typescript",
            examples: [
              {
                title: "List organization properties",
                language: "typescript",
                code: `type ListPropertiesResponse = {
  properties: Array<{
    id: string;
    title: string;
    publicationState?: string;
  }>;
};

const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/properties\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY!,
  },
});

const data = (await response.json()) as ListPropertiesResponse;
console.log(data.properties);`,
              },
              {
                title: "List organization properties",
                language: "javascript",
                code: `const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/properties\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY,
  },
});

const data = await response.json();
console.log(data.properties);`,
              },
              {
                title: "List organization properties",
                language: "csharp",
                code: `using System.Net.Http.Headers;

using var http = new HttpClient();
http.DefaultRequestHeaders.Add("X-Anan-Api-Key", Environment.GetEnvironmentVariable("ANAN_ORG_API_KEY"));

var issuer = Environment.GetEnvironmentVariable("ANAN_ISSUER");
var response = await http.GetAsync($"{issuer}/api/org/properties");
response.EnsureSuccessStatusCode();

var json = await response.Content.ReadAsStringAsync();
Console.WriteLine(json);`,
              },
              {
                title: "List organization properties",
                language: "bash",
                code: "curl -sS -H \"X-Anan-Api-Key: $ANAN_ORG_API_KEY\" \"$ANAN_ISSUER/api/org/properties\"",
              },
            ],
          },
        ],
        codeExamples: [
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
        relatedLinks: [
          {
            label: "Organization Properties API",
            href: "/docs/org-properties",
            description: "Full org-scoped property endpoint reference and payload examples.",
          },
          {
            label: "Errors and Security",
            href: "/docs/errors-and-security",
            description: "Operational guardrails and credential handling guidance.",
          },
        ],
      },
      {
        id: "first-oauth-call",
        title: "First OAuth Delegated API Call",
        summary: "Once token exchange succeeds, validate the whole OAuth path with one small read call before you build write flows.",
        paragraphs: [
          "After token exchange, start with a read operation. For example, list delegated clients with `clients:read` or `clients:read_own` scope.",
        ],
        codeExampleGroups: [
          {
            title: "List delegated clients",
            description: "Use the selector to switch between TypeScript, JavaScript, C#/.NET, and cURL.",
            defaultLanguage: "typescript",
            examples: [
              {
                title: "List delegated clients",
                language: "typescript",
                code: `type ListClientsResponse = {
  clients: Array<{
    id: string;
    name: string;
  }>;
};

const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/oauth/clients\`, {
  headers: {
    Authorization: \`Bearer \${process.env.ACCESS_TOKEN!}\`,
  },
});

const data = (await response.json()) as ListClientsResponse;
console.log(data.clients);`,
              },
              {
                title: "List delegated clients",
                language: "javascript",
                code: `const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/oauth/clients\`, {
  headers: {
    Authorization: \`Bearer \${process.env.ACCESS_TOKEN}\`,
  },
});

const data = await response.json();
console.log(data.clients);`,
              },
              {
                title: "List delegated clients",
                language: "csharp",
                code: `using System.Net.Http.Headers;

using var http = new HttpClient();
http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
    "Bearer",
    Environment.GetEnvironmentVariable("ACCESS_TOKEN")
);

var issuer = Environment.GetEnvironmentVariable("ANAN_ISSUER");
var response = await http.GetAsync($"{issuer}/api/oauth/clients");
response.EnsureSuccessStatusCode();

var json = await response.Content.ReadAsStringAsync();
Console.WriteLine(json);`,
              },
              {
                title: "List delegated clients",
                language: "bash",
                code: "curl -sS -H \"Authorization: Bearer $ACCESS_TOKEN\" \"$ANAN_ISSUER/api/oauth/clients\"",
              },
            ],
          },
        ],
        callouts: [
          {
            title: "Scope Check",
            body: "If this request fails with insufficient scope, inspect the granted scopes on your access token before debugging the endpoint itself.",
            tone: "warning",
          },
        ],
        relatedLinks: [
          {
            label: "Organization Clients API",
            href: "/docs/org-clients",
            description: "Compare delegated access with the machine API shape for clients.",
          },
          {
            label: "Errors and Security",
            href: "/docs/errors-and-security",
            description: "Token revocation and OAuth operational guidance.",
          },
        ],
      },
    ],
  },
  "api-keys": {
    key: "api-keys",
    pageType: "guide",
    href: "/docs/api-keys",
    title: "Organization API Keys",
    description: "Manager-created org-scoped API keys for internal server integrations.",
    summary:
      "Organization API keys are created by organization managers in workspace settings, reveal their secret once, and can access only the owning broker or developer organization’s clients and properties.",
    sections: [
      {
        id: "create-key",
        title: "Create a Key",
        summary: "API keys are created by workspace managers and are always bound to the current organization. They are intended for server-side integrations, not browser clients.",
        bullets: [
          "Open Workspace Settings → API Keys as a manager of the current broker or developer organization.",
          "Choose a name and granular resource-action permissions for `clients` and `properties`.",
          "Permissions are assigned per action: `read`, `create`, `update`, `delete`.",
          "Copy the secret immediately after creation; Anan stores only a hash and will not show the full value again.",
          "Revoke the key from the same settings tab if it is no longer needed.",
        ],
        callouts: [
          {
            title: "Server-Side Only",
            body: "Treat organization API keys like production secrets. Keep them in backend environment variables or a secret manager and never expose them in frontend bundles.",
            tone: "warning",
          },
        ],
        relatedLinks: [
          {
            label: "Getting Started",
            href: "/docs/getting-started",
            description: "Start here if you still need to choose between org API keys and OAuth.",
          },
          {
            label: "Errors and Security",
            href: "/docs/errors-and-security",
            description: "Credential hygiene, revocation, and operational recovery notes.",
          },
        ],
      },
      {
        id: "authenticate",
        title: "Authenticate Requests",
        summary: "TypeScript is the primary example. Use the selector to switch languages without leaving the same code block.",
        paragraphs: [
          "Send the key in the `X-Anan-Api-Key` header. The key is always scoped to the organization that created it, so callers never provide org ids, broker ids, or developer ids in requests.",
        ],
        codeExampleGroups: [
          {
            title: "Authenticate a request to the organization clients API",
            description: "Use TypeScript by default, then switch to the language your team uses.",
            defaultLanguage: "typescript",
            examples: [
              {
                title: "Authenticate a request to the organization clients API",
                language: "typescript",
                code: `type ListClientsResponse = {
  clients: Array<{
    id: string;
    name: string;
    email?: string;
  }>;
};

const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/clients\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY!,
  },
});

const data = (await response.json()) as ListClientsResponse;
console.log(data.clients);`,
              },
              {
                title: "Authenticate a request to the organization clients API",
                language: "javascript",
                code: `const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/clients\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY,
  },
});

const data = await response.json();
console.log(data.clients);`,
              },
              {
                title: "Authenticate a request to the organization clients API",
                language: "csharp",
                code: `using var http = new HttpClient();
http.DefaultRequestHeaders.Add("X-Anan-Api-Key", Environment.GetEnvironmentVariable("ANAN_ORG_API_KEY"));

var issuer = Environment.GetEnvironmentVariable("ANAN_ISSUER");
var response = await http.GetAsync($"{issuer}/api/org/clients");
response.EnsureSuccessStatusCode();

var json = await response.Content.ReadAsStringAsync();
Console.WriteLine(json);`,
              },
              {
                title: "Authenticate a request to the organization clients API",
                language: "bash",
                code: "curl -sS -H \"X-Anan-Api-Key: $ANAN_ORG_API_KEY\" \"$ANAN_ISSUER/api/org/clients\"",
              },
            ],
          },
        ],
        codeExamples: [
          {
            title: "Environment variable",
            language: "bash",
            code: "export ANAN_ORG_API_KEY=\"anan_abcd1234.<secret>\"",
          },
        ],
      },
      {
        id: "permissions",
        title: "Permission Model",
        bullets: [
          "Permissions are granted per resource and action: `read`, `create`, `update`, `delete`.",
          "v1 resources are `clients` and `properties` only.",
          "A key can never escape its owning broker or developer organization even if a foreign resource id is supplied.",
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
            responseExample: {
              title: "Example Response",
              language: "json",
              code: `{
  "clients": [
    {
      "id": "c_123xyz",
      "name": "Ahmed Mansour",
      "email": "ahmed@example.com",
      "phone": "+966555555555",
      "createdAt": 1774346400000,
      "updatedAt": 1774346400000
    }
  ]
}`
            }
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
}`
            },
            responseExample: {
              title: "Created Response",
              language: "json",
              code: `{
  "client": {
    "id": "c_999abc",
    "name": "Al Noor Investments",
    "phone": "+966511111111",
    "email": "team@alnoor.example",
    "createdAt": 1774346400000,
    "updatedAt": 1774346400000
  }
}`
            }
          },
          {
            title: "Properties collection",
            method: "GET",
            path: "/api/org/properties",
            description: "Lists properties owned by the current organization.",
            notes: ["Requires `properties:read` permission."],
            responseExample: {
              title: "Example Response",
              language: "json",
              code: `{
  "properties": [
    {
      "id": "p_444def",
      "title": "Palm Residences Unit 301",
      "price": 1250000,
      "beds": 3,
      "baths": 3,
      "address": "Al Olaya District, Riyadh",
      "description": "High-floor unit with city view",
      "publicationState": "draft"
    }
  ]
}`
            }
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
}`
            },
            responseExample: {
              title: "Created Response",
              language: "json",
              code: `{
  "property": {
    "id": "p_555ghi",
    "title": "Palm Residences Unit 301",
    "address": "Al Olaya District, Riyadh",
    "price": 1250000,
    "beds": 3,
    "baths": 3,
    "publicationState": "draft"
  }
}`
            }
          },
        ],
      },
      {
        id: "api-key-usage-examples",
        title: "Fetching & Modifying Data (Examples)",
        paragraphs: [
          "Use your organization API key to read and modify data inside the current organization boundary."
        ],
        codeExamples: [
          {
            title: "Fetch properties (GET)",
            language: "javascript",
            code: `const fetchProperties = async () => {
  const res = await fetch("https://<anan-issuer>/api/org/properties", {
    headers: { "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY }
  });
  const data = await res.json();
  console.log(data.properties);
};`
          },
          {
            title: "Add a new client (POST)",
            language: "javascript",
            code: `const addClient = async (clientData) => {
  const res = await fetch("https://<anan-issuer>/api/org/clients", {
    method: "POST",
    headers: {
      "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(clientData)
  });
  const data = await res.json();
  console.log("Created Client:", data.client);
};

// Usage
addClient({ name: "Omar Real Estate", phone: "+966550000001" });`
          }
        ]
      }
    ]
  },
  "org-clients": {
    key: "org-clients",
    pageType: "api",
    href: "/docs/org-clients",
    title: "Organization Clients API",
    description: "Manage CRM clients exclusively using Organization API Keys.",
    summary:
      "Use `/api/org/clients` for first-party organization client operations. The `X-Anan-Api-Key` header binds every request to the current broker or developer organization.",
    sections: [
      {
        id: "clients-get",
        title: "List Clients",
        endpoints: [
          {
            title: "List clients",
            method: "GET",
            path: "/api/org/clients",
            description: "Returns CRM clients owned by the organization.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `clients:read`."],
            responseExample: {
              title: "Example response",
              language: "json",
              code: `{
  "clients": [
    {
      "id": "<client-id>",
      "name": "Alya Trading",
      "email": "ops@alya.example",
      "phone": "+966500000000",
      "createdAt": 1774346400000,
      "updatedAt": 1774346400000
    }
  ]
}`
            }
          }
        ]
      },
      {
        id: "clients-post",
        title: "Create Client",
        endpoints: [
          {
            title: "Create client",
            method: "POST",
            path: "/api/org/clients",
            description: "Creates a CRM client under the current organization.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `clients:create`."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "name": "Al Noor Investments",
  "phone": "+966511111111",
  "email": "team@alnoor.example"
}`
            },
            responseExample: {
              title: "Created response",
              language: "json",
              code: `{
  "client": {
    "id": "<client-id>",
    "name": "Al Noor Investments"
  }
}`
            }
          }
        ]
      },
      {
        id: "clients-patch",
        title: "Update Client",
        endpoints: [
          {
            title: "Update client",
            method: "PATCH",
            path: "/api/org/clients/[clientId]",
            description: "Updates a specific CRM client via its unique ID.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `clients:update`."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "name": "Al Noor Renewed"
}`
            },
            responseExample: {
              title: "Updated response",
              language: "json",
              code: `{
  "client": {
    "id": "<client-id>",
    "name": "Al Noor Renewed"
  }
}`
            }
          }
        ]
      },
      {
        id: "clients-delete",
        title: "Delete Client",
        endpoints: [
          {
            title: "Delete client",
            method: "DELETE",
            path: "/api/org/clients/[clientId]",
            description: "Permanently deletes a CRM client via its unique ID.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `clients:delete`."],
            responseExample: {
              title: "Deleted response",
              language: "json",
              code: `{
  "deleted": true
}`
            }
          }
        ]
      }
    ]
  },
  "org-properties": {
    key: "org-properties",
    pageType: "api",
    href: "/docs/org-properties",
    title: "Organization Properties API",
    description: "Manage real estate properties exclusively using Organization API Keys.",
    summary:
      "Use `/api/org/properties` for property operations within the current broker or developer organization. Supports full CRUD controls.",
    sections: [
      {
        id: "properties-get",
        title: "List Properties",
        endpoints: [
          {
            title: "List properties",
            method: "GET",
            path: "/api/org/properties",
            description: "Returns properties owned by the organization.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `properties:read`."],
            responseExample: {
              title: "Example response",
              language: "json",
              code: `{
  "properties": [
    {
      "id": "<property-id>",
      "title": "Palm Residences",
      "address": "Al Olaya District, Riyadh",
      "price": 1250000,
      "beds": 3,
      "baths": 3,
      "description": "High-floor unit",
      "publicationState": "draft"
    }
  ]
}`
            }
          }
        ]
      },
      {
        id: "properties-post",
        title: "Create Property",
        endpoints: [
          {
            title: "Create property",
            method: "POST",
            path: "/api/org/properties",
            description: "Creates a draft property under the current organization.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `properties:create`."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "title": "Palm Residences",
  "address": "Al Olaya District, Riyadh",
  "price": 1250000,
  "beds": 3,
  "baths": 3,
  "description": "High-floor unit"
}`
            },
            responseExample: {
              title: "Created response",
              language: "json",
              code: `{
  "property": {
    "id": "<property-id>",
    "title": "Palm Residences",
    "publicationState": "draft"
  }
}`
            }
          }
        ]
      },
      {
        id: "properties-patch",
        title: "Update Property",
        endpoints: [
          {
            title: "Update property",
            method: "PATCH",
            path: "/api/org/properties/[propertyId]",
            description: "Updates a specific property.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `properties:update`."],
            requestExample: {
              title: "Request body",
              language: "json",
              code: `{
  "price": 1300000
}`
            },
            responseExample: {
              title: "Updated response",
              language: "json",
              code: `{
  "property": {
    "id": "<property-id>",
    "price": 1300000
  }
}`
            }
          }
        ]
      },
      {
        id: "properties-delete",
        title: "Delete Property",
        endpoints: [
          {
            title: "Delete property",
            method: "DELETE",
            path: "/api/org/properties/[propertyId]",
            description: "Permanently deletes a property via its unique ID.",
            notes: ["Requires the `X-Anan-Api-Key` HTTP header with `properties:delete`."],
            responseExample: {
              title: "Deleted response",
              language: "json",
              code: `{
  "deleted": true
}`
            }
          }
        ]
      }
    ]
  },
  "errors-and-security": {
    key: "errors-and-security",
    pageType: "concept",
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
