import BuyerPropertyPage from "@/client_zone/property/BuyerPropertyPage";

export default async function BuyerPropertyRoute({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  return <BuyerPropertyPage propertyId={propertyId} />;
}
