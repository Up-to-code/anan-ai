import KnowledgePage from "@/admin_zone/pages/KnowledgePage";

type KnowledgeRouteProps = {
  searchParams: Promise<{
    selected?: string;
  }>;
};

/**
 * WHY:   The knowledge route should delegate editor state and list rendering to the page orchestrator.
 * WHAT:  Renders the admin knowledge page with optional selected-document state.
 * HOW:   Resolves the search params and forwards them to `KnowledgePage`.
 */
export default async function KnowledgeRoute({ searchParams }: KnowledgeRouteProps) {
  return <KnowledgePage searchParams={await searchParams} />;
}
