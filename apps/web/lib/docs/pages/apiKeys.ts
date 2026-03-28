import type { DocsPageDefinition } from "../types";
export const apiKeysPage: DocsPageDefinition = {
    key: "api-keys",
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
        summary: "Keys should be scoped narrowly. Grant only the resource-action pairs that the integration actually uses.",
        bullets: [
          "Permissions are granted per resource and action: `read`, `create`, `update`, `delete`.",
          "v1 resources are `clients` and `properties` only.",
          "A key can never escape its owning broker or developer organization even if a foreign resource id is supplied.",
          "Revoked keys stop working immediately.",
        ],
        relatedLinks: [
          {
            label: "Organization Clients API",
            href: "/docs/api/clients",
            description: "Delegated OAuth clients API and scope-driven access model.",
          },
          {
            label: "Delegated Properties API",
            href: "/docs/api/properties",
            description: "OAuth property endpoints when you need user delegation instead of org-wide machine access.",
          },
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
            title: "Update client",
            method: "PATCH",
            path: "/api/org/clients/[clientId]",
            description: "Updates one CRM client owned by the current organization.",
            notes: ["Requires `clients:update` permission."],
          },
          {
            title: "Delete client",
            method: "DELETE",
            path: "/api/org/clients/[clientId]",
            description: "Deletes one CRM client owned by the current organization.",
            notes: ["Requires `clients:delete` permission."],
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
          {
            title: "Update property",
            method: "PATCH",
            path: "/api/org/properties/[propertyId]",
            description: "Updates one property owned by the current organization.",
            notes: ["Requires `properties:update` permission."],
          },
          {
            title: "Delete property",
            method: "DELETE",
            path: "/api/org/properties/[propertyId]",
            description: "Deletes one property owned by the current organization.",
            notes: ["Requires `properties:delete` permission."],
          },
        ],
      },
    ],
};
