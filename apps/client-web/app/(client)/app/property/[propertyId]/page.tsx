import PropertyDetailScreen from "@/client_zone/mobile_web/screens/PropertyDetailScreen";

export default async function BuyerPropertyRoute({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  return <PropertyDetailScreen propertyId={propertyId} />;
}
