import PropertyDetailPage from "@/admin_zone/pages/PropertyDetailPage";

type PropertyPageProps = {
  params: Promise<{ propertyId: string }>;
};

/**
 * WHY:   Properties need a dedicated detail route for inspection and CRUD entry points.
 * WHAT:  Renders the property detail page for a single id.
 * HOW:   Resolves the dynamic route param and delegates to the property detail module.
 */
export default async function PropertyPage({ params }: PropertyPageProps) {
  const { propertyId } = await params;
  return <PropertyDetailPage propertyId={propertyId} />;
}
