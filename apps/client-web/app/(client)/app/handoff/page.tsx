import { ClientHandoffPage } from "@/client_zone/pages/ClientHandoffPage";

type HandoffRouteProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function HandoffRoute({ searchParams }: HandoffRouteProps) {
  return <ClientHandoffPage orderId={(await searchParams).orderId} />;
}
