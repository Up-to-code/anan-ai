import { MobileAuthBridgePage } from "@/client_zone/pages/MobileAuthBridgePage";

type MobileAuthBridgeRouteProps = {
  searchParams: Promise<{
    payload?: string;
  }>;
};

export default async function MobileAuthBridgeRoute({ searchParams }: MobileAuthBridgeRouteProps) {
  const params = await searchParams;
  return <MobileAuthBridgePage payload={params.payload} />;
}
