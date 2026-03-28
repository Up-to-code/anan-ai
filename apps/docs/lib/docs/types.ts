export type DocsPageKey =
  | "getting-started"
  | "api-keys"
  | "org-clients"
  | "org-properties"
  | "errors-and-security";

export type DocsCalloutTone = "info" | "warning" | "success";

export type DocsCodeExample = {
  title: string;
  language: "bash" | "json" | "http" | "javascript" | "typescript" | "csharp" | "text";
  code: string;
};

export type DocsCodeExampleGroup = {
  title: string;
  description?: string;
  defaultLanguage?: DocsCodeExample["language"];
  examples: DocsCodeExample[];
};

export type DocsRelatedLink = {
  label: string;
  href: string;
  description?: string;
};

export type DocsScope = {
  id: string;
  label: string;
};

export type DocsEndpoint = {
  title: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  requiredScopes?: string[];
  notes?: string[];
  requestExample?: DocsCodeExample;
  responseExample?: DocsCodeExample;
};

export type DocsImage = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

export type DocsVideo = {
  src: string;
  title?: string;
  className?: string;
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
  images?: DocsImage[];
  videos?: DocsVideo[];
  codeExamples?: DocsCodeExample[];
  codeExampleGroups?: DocsCodeExampleGroup[];
  callouts?: DocsCallout[];
  scopes?: DocsScope[];
  endpoints?: DocsEndpoint[];
  relatedLinks?: DocsRelatedLink[];
};

export type DocsPageDefinition = {
  key: DocsPageKey;
  pageType: "guide" | "api" | "endpoint" | "concept";
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
