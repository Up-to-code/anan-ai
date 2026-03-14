import DocsArticle from "./DocsArticle";
import type { DocsPageKey } from "./registry";
import { getDocsPage } from "./registry";

type DocsPageProps = {
  pageKey: DocsPageKey;
};

/**
 * WHY:   The docs routes should stay thin and route-driven while sharing one typed rendering path.
 * WHAT:  Resolves and renders the requested handbook page by docs key.
 * HOW:   Loads the page definition from the registry and passes it into the shared article renderer.
 */
export default function DocsPage({ pageKey }: DocsPageProps) {
  const page = getDocsPage(pageKey);
  return <DocsArticle page={page} />;
}
