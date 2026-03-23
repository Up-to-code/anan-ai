import ModelDetailPage from "@/admin_zone/pages/ModelDetailPage";

type ModelPageProps = {
  params: Promise<{ modelId: string }>;
};

/**
 * WHY:   Models need a detail route for review and CRUD navigation.
 * WHAT:  Renders the model detail page.
 * HOW:   Delegates the route param to the model detail module.
 */
export default async function ModelPage({ params }: ModelPageProps) {
  const { modelId } = await params;
  return <ModelDetailPage modelId={modelId} />;
}
