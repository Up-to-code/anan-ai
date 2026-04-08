import type { DocsPageDefinition } from "../types";
export const apiPropertiesPage: DocsPageDefinition = {
    key: "api-properties",
    href: "/docs/api/properties",
    title: "Delegated Properties API",
    description: "Read and create properties with delegated OAuth access.",
    summary:
      "Use `/api/oauth/properties` for delegated property operations. Ownership is tied to the connected organization and scope permissions.",
    sections: [
      {
        id: "properties-get",
        title: "List Delegated Properties",
        endpoints: [
          {
            title: "List properties",
            method: "GET",
            path: "/api/oauth/properties",
            description: "Returns properties accessible through the connected organization grant.",
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
      "id": "<property-id>",
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
            description: "Creates a draft property owned by the connected organization.",
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
    "id": "<property-id>",
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
};
