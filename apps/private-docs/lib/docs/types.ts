export type DocsPageKey =
  | "overview"
  | "architecture"
  | "zones"
  | "data-and-contracts"
  | "security"
  | "convex"
  | "web"
  | "admin"
  | "mobile"
  | "ai-and-channels"
  | "workflow"
  | "add-table"
  | "add-web-domain"
  | "add-channel"
  | "add-agent"
  | "audit-overview"
  | "convex-review"
  | "web-review"
  | "documentation-gaps"
  | "remediation-roadmap";

export type DocsCalloutTone = "info" | "warning" | "success";

export type DocsCodeExample = {
  title: string;
  language: "bash" | "json" | "http" | "javascript" | "typescript" | "text";
  code: string;
};

export type DocsFinding = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  summary: string;
  evidence?: string[];
  ruleRefs?: string[];
  recommendations?: string[];
};

export type DocsCallout = {
  title: string;
  body: string;
  tone: DocsCalloutTone;
};

export type DocsLinkItem = {
  href: string;
  label: string;
  description: string;
};

export type DocsSourceReference = {
  path: string;
  description: string;
};

export type DocsTable = {
  headers: string[];
  rows: string[][];
};

export type DocsVisual = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export type DocsSection = {
  id: string;
  title: string;
  summary?: string;
  paragraphs?: string[];
  bullets?: string[];
  findings?: DocsFinding[];
  codeExamples?: DocsCodeExample[];
  callouts?: DocsCallout[];
  links?: DocsLinkItem[];
  table?: DocsTable;
  visuals?: DocsVisual[];
};

export type DocsPageDefinition = {
  key: DocsPageKey;
  href: string;
  title: string;
  description: string;
  summary: string;
  intro?: string[];
  sections: DocsSection[];
  deepSources?: DocsSourceReference[];
  related?: DocsPageKey[];
};

export type DocsNavGroup = {
  id: string;
  title: string;
  items: DocsPageKey[];
};
