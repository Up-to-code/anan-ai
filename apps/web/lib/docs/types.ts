export type DocsPageKey =
  | "getting-started"
  | "api-keys"
  | "oauth-overview"
  | "oauth-get-credentials"
  | "oauth-authorization-code-pkce"
  | "scopes-and-org-permissions"
  | "api-clients"
  | "api-properties"
  | "errors-and-security";

export type DocsCalloutTone = "info" | "warning" | "success";

export type DocsCodeExample = {
  title: string;
  language: "bash" | "json" | "http" | "javascript" | "typescript" | "text";
  code: string;
};

export type DocsScope = {
  id: string;
  label: string;
};

export type DocsEndpoint = {
  title: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  requiredScopes?: string[];
  notes?: string[];
  requestExample?: DocsCodeExample;
  responseExample?: DocsCodeExample;
};

export type DocsCallout = {
  title: string;
  body: string;
  tone: DocsCalloutTone;
};

export type DocsSection = {
  id: string;
  title: string;
  summary?: string;
  paragraphs?: string[];
  bullets?: string[];
  codeExamples?: DocsCodeExample[];
  callouts?: DocsCallout[];
  scopes?: DocsScope[];
  endpoints?: DocsEndpoint[];
};

export type DocsPageDefinition = {
  key: DocsPageKey;
  href: string;
  title: string;
  description: string;
  summary: string;
  sections: DocsSection[];
};

export type DocsNavGroup = {
  id: string;
  title: string;
  items: DocsPageKey[];
};
