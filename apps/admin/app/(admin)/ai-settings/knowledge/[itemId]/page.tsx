import KnowledgeItemDetailPage from "@/admin_zone/pages/KnowledgeItemDetailPage";

type KnowledgeItemPageProps = {
  params: Promise<{ itemId: string }>;
};

/**
 * WHY:   Knowledge items need a route-backed detail view for review and CRUD actions.
 * WHAT:  Renders the knowledge-item detail page.
 * HOW:   Passes the resolved route param into the dedicated detail module.
 */
export default async function KnowledgeItemPage({ params }: KnowledgeItemPageProps) {
  const { itemId } = await params;
  return <KnowledgeItemDetailPage itemId={itemId} />;
}
