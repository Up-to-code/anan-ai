import type { DocsPageDefinition } from "../types";
export const apiClientsPage: DocsPageDefinition = {
    key: "api-clients",
    href: "/docs/api/clients",
    title: "Delegated Clients API",
    description: "Read and create CRM clients with delegated OAuth access.",
    summary:
      "Use `/api/oauth/clients` for delegated client operations. Scope requirements are enforced per method and the connected organization boundary.",
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
              "Access is limited to the organization connected to the OAuth grant.",
            ],
            responseExample: {
              title: "Example response",
              language: "json",
              code: `{
  "clients": [
    {
      "id": "<client-id>",
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
            description: "Creates a CRM client for the connected organization.",
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
    "id": "<client-id>",
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
  id: string;
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
};
