import DocsArticle from "./DocsArticle";
import { getDocsPage } from "@/lib/docs/registry";
import type { DocsPageKey } from "@/lib/docs/types";

type DocsPageProps = {
  pageKey: DocsPageKey;
};

/**
 * WHY:   Docs routes should remain thin while sharing one typed rendering path.
 * WHAT:  Resolves a docs page from the registry and renders it with the shared article template.
 * HOW:   Uses the registry key passed by each route and forwards the result to `DocsArticle`.
 */
export default function DocsPage({ pageKey }: DocsPageProps) {
  const page = getDocsPage(pageKey);
  return <DocsArticle page={page} />;
}
