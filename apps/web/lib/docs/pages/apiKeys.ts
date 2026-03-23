import type { DocsPageDefinition } from "../types";
export const apiKeysPage: DocsPageDefinition = {
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
};
