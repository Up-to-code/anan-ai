import BuyerHandoffPage from "@/client_zone/handoff/BuyerHandoffPage";

export default async function BuyerHandoffRoute({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <BuyerHandoffPage orderId={orderId} />;
}
