import { notFound } from "next/navigation";
import DocsPage from "@/components/docs/DocsPage";
import { docsPageOrder, getDocsPageBySlug, getDocsPageSlug } from "@/lib/docs/registry";

/**
 * WHY:   The handbook now has enough pages that one slug-driven route is easier to maintain than a folder per page.
 * WHAT:  Resolves a handbook page from the URL slug and renders the shared docs page component.
 * HOW:   Looks up the slug in the typed registry and raises `notFound()` for unknown pages.
 */
export default async function DocsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getDocsPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <DocsPage pageKey={page.key} />;
}

export function generateStaticParams() {
  return docsPageOrder.map((pageKey) => ({
    slug: getDocsPageSlug(pageKey),
  }));
}
