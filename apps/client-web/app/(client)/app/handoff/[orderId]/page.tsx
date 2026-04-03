import HandoffScreen from "@/client_zone/mobile_web/screens/HandoffScreen";

export default async function BuyerHandoffRoute({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <HandoffScreen orderId={orderId} />;
}
