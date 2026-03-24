import type { DocsNavGroup, DocsPageDefinition, DocsPageKey } from "./types";
import { auditAndDriftPages } from "./pages/auditAndDrift";
import { buildAndExtendPages } from "./pages/buildAndExtend";
import { foundationsPages } from "./pages/foundations";
import { runtimeSurfacePages } from "./pages/runtimeSurfaces";

export const docsPageOrder: DocsPageKey[] = [
  "overview",
  "architecture",
  "zones",
  "data-and-contracts",
  "security",
  "convex",
  "web",
  "admin",
  "mobile",
  "ai-and-channels",
  "workflow",
  "add-table",
  "add-web-domain",
  "add-channel",
  "add-agent",
  "audit-overview",
  "convex-review",
  "web-review",
  "documentation-gaps",
  "remediation-roadmap",
];

export const docsNavGroups: DocsNavGroup[] = [
  {
    id: "foundations",
    title: "Foundations",
    items: ["overview", "architecture", "zones", "data-and-contracts", "security"],
  },
  {
    id: "runtime-surfaces",
    title: "Runtime Surfaces",
    items: ["convex", "web", "admin", "mobile", "ai-and-channels"],
  },
  {
    id: "build-and-extend",
    title: "Build & Extend",
    items: ["workflow", "add-table", "add-web-domain", "add-channel", "add-agent"],
  },
  {
    id: "audit-and-drift",
    title: "Audit & Drift",
    items: ["audit-overview", "convex-review", "web-review", "documentation-gaps", "remediation-roadmap"],
  },
];

const pageGroups = [
  ...foundationsPages,
  ...runtimeSurfacePages,
  ...buildAndExtendPages,
  ...auditAndDriftPages,
] satisfies DocsPageDefinition[];

export const docsPages: Record<DocsPageKey, DocsPageDefinition> = Object.fromEntries(
  pageGroups.map((page) => [page.key, page]),
) as Record<DocsPageKey, DocsPageDefinition>;

export function getDocsPage(pageKey: DocsPageKey) {
  return docsPages[pageKey];
}

export function getDocsPageBySlug(slug: string) {
  return pageGroups.find((page) => page.href === `/docs/${slug}`);
}

export function getDocsPageSlug(pageKey: DocsPageKey) {
  return docsPages[pageKey].href.replace("/docs/", "");
}

export function getDocsPageSiblings(pageKey: DocsPageKey) {
  const index = docsPageOrder.indexOf(pageKey);

  return {
    previousPageKey: index > 0 ? docsPageOrder[index - 1] : undefined,
    nextPageKey: index >= 0 && index < docsPageOrder.length - 1 ? docsPageOrder[index + 1] : undefined,
  };
}

export function getDocsSectionId(pageKey: DocsPageKey, sectionId: string) {
  return `${pageKey}-${sectionId}`;
}
