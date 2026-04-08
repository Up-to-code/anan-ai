import type { DocsPageDefinition } from "../types";
export const gettingStartedPage: DocsPageDefinition = {
    key: "getting-started",
    href: "/docs/getting-started",
    title: "Getting Started",
    description: "Fast path from credentials to your first successful API call.",
    summary:
      "Choose between owner-created organization API keys for broker or developer org data, or OAuth for delegated organization app access.",
    sections: [
      {
        id: "integration-checklist",
        title: "Integration Checklist",
        summary: "Start by choosing the correct auth model, then wire your environment and first request with the smallest possible permission set.",
        bullets: [
          "Choose your auth model first: organization API keys for backend-to-backend access to the current broker or developer organization, or OAuth for delegated organization app access.",
          "For organization API keys, create the key in Workspace Settings → API Keys as an organization owner and store it securely because the full secret is shown once.",
          "Managers can still view API key metadata and revoke keys, but only owners can create them.",
          "For OAuth, get your `client_id` and `client_secret` from Anan onboarding, register redirect URIs, and expect the consent screen to target one organization at a time.",
          "Store API keys, access tokens, and refresh tokens securely; rotate or revoke them if you suspect exposure.",
          "Use the minimum permission set required for each integration path.",
        ],
        callouts: [
          {
            title: "Recommended Starting Path",
            body: "Use organization API keys first if you are building an internal backend integration for one broker or developer organization. Move to OAuth only when an external app needs a manager-approved organization connection.",
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
            label: "Authentication & Credentials",
            href: "/docs/oauth/get-credentials",
            description: "Credential setup for both org API keys and OAuth applications.",
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
          "The machine API currently covers clients, properties as the project model, deals, and a read-only broker directory.",
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
            label: "Organization Clients API",
            href: "/docs/api/clients",
            description: "Delegated client operations for OAuth bearer tokens.",
          },
          {
            label: "Delegated Properties API",
            href: "/docs/api/properties",
            description: "OAuth-based property operations and scope requirements.",
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
            label: "OAuth Overview",
            href: "/docs/oauth/overview",
            description: "When to use OAuth and how delegated access fits into the platform.",
          },
          {
            label: "Authorization Code + PKCE",
            href: "/docs/oauth/authorization-code-pkce",
            description: "Production OAuth flow guidance for secure user authorization.",
          },
        ],
      },
    ],
};
