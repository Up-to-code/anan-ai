import { docsNavGroups, docsPageOrder } from "./nav";
import { docsPages } from "./pages";
import type { DocsPageKey } from "./types";
import { getScopeLabel } from "./scopes";

export { docsNavGroups, docsPageOrder, docsPages, getScopeLabel };

export function getDocsPage(pageKey: DocsPageKey) {
  return docsPages[pageKey];
}

export function getDocsPageSiblings(pageKey: DocsPageKey) {
  const index = docsPageOrder.indexOf(pageKey);
  return {
    previousPageKey: index > 0 ? docsPageOrder[index - 1] : undefined,
    nextPageKey: index >= 0 && index < docsPageOrder.length - 1 ? docsPageOrder[index + 1] : undefined,
  } as const;
}

export function getDocsSectionId(pageKey: DocsPageKey, sectionId: string) {
  return `${pageKey}-${sectionId}`;
}
