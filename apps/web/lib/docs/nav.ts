import type { DocsNavGroup, DocsPageKey } from "./types";

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
