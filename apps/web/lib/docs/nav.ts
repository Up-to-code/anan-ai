import type { DocsNavGroup, DocsPageKey } from "./types";

export const docsPageOrder: DocsPageKey[] = [
  "getting-started",
  "oauth-get-credentials",
  "api-keys",
  "scopes-and-org-permissions",
  "oauth-overview",
  "oauth-authorization-code-pkce",
  "api-clients",
  "api-properties",
  "errors-and-security",
];

export const docsNavGroups: DocsNavGroup[] = [
  {
    id: "start",
    title: "Start Here",
    items: ["getting-started", "oauth-get-credentials"],
  },
  {
    id: "machine-api",
    title: "Organization Machine API",
    items: ["api-keys"],
  },
  {
    id: "access",
    title: "Permissions & Access",
    items: ["scopes-and-org-permissions"],
  },
  {
    id: "oauth",
    title: "OAuth",
    items: ["oauth-overview", "oauth-authorization-code-pkce"],
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
