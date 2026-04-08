import type { DocsPageDefinition } from "../types";
export const oauthGetCredentialsPage: DocsPageDefinition = {
    key: "oauth-get-credentials",
    href: "/docs/oauth/get-credentials",
    title: "Authentication & Credentials",
    description: "How to obtain and configure your Anan API Keys and OAuth app credentials.",
    summary:
      "Organization API keys are created by organization owners from workspace settings, while OAuth app credentials remain onboarding-managed for delegated organization app access.",
    sections: [
      {
        id: "organization-api-keys",
        title: "Organization API Keys",
        summary: "Use org API keys when your backend acts on behalf of one organization and does not need delegated end-user consent.",
        paragraphs: [
          "Use organization API keys for first-party server integrations that should read or write only the current broker or developer organization’s clients, properties, deals, and broker relation data.",
          "Organization owners can create these keys directly from Workspace Settings → API Keys. Managers can list metadata and revoke keys. The secret is shown once and must be stored securely on your side.",
          "Each key can be limited to specific resource actions such as `clients:create`, `properties:update`, `deals:read`, or `brokers:read`.",
        ],
        codeExampleGroups: [
          {
            title: "Call the organization properties API",
            description: "Start with TypeScript, then switch to JavaScript or C#/.NET if needed.",
            defaultLanguage: "typescript",
            examples: [
              {
                title: "Call the organization properties API",
                language: "typescript",
                code: `const response = await fetch(\`\${process.env.ANAN_ISSUER}/api/org/properties\`, {
  headers: {
    "X-Anan-Api-Key": process.env.ANAN_ORG_API_KEY!
  }
});`
              },
              {
                title: "Call the organization properties API",
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
                title: "Call the organization properties API",
                language: "csharp",
                code: `using var http = new HttpClient();
http.DefaultRequestHeaders.Add("X-Anan-Api-Key", Environment.GetEnvironmentVariable("ANAN_ORG_API_KEY"));

var issuer = Environment.GetEnvironmentVariable("ANAN_ISSUER");
var response = await http.GetAsync($"{issuer}/api/org/properties");
response.EnsureSuccessStatusCode();

var json = await response.Content.ReadAsStringAsync();
Console.WriteLine(json);`,
              },
            ],
          },
        ],
        relatedLinks: [
          {
            label: "Organization API Keys",
            href: "/docs/api-keys",
            description: "Creation flow, permission model, and org API endpoint overview.",
          },
          {
            label: "Getting Started",
            href: "/docs/getting-started",
            description: "High-level decision guide for auth model selection.",
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
            body: "Organization API keys are created directly by owners in the current broker or developer workspace organization. Managers can still revoke existing keys.",
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
        summary: "Keep these values in secure environment storage. Use separate credentials for development, staging, and production.",
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
        callouts: [
          {
            title: "Environment Separation",
            body: "Do not reuse the same org API key or OAuth client secret across local development, staging, and production. Keep those environments isolated.",
            tone: "success",
          },
        ],
      },
    ],
};
