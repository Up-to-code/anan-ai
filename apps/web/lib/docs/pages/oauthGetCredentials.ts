import type { DocsPageDefinition } from "../types";
export const oauthGetCredentialsPage: DocsPageDefinition = {
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
};
