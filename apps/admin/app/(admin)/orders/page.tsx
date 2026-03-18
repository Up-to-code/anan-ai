import OrdersPage from "@/admin_zone/pages/OrdersPage";

type OrdersRouteProps = {
  searchParams: Promise<{
    status?:
      | "new_lead"
      | "contacted"
      | "qualified"
      | "offer_made"
      | "under_contract"
      | "closed_won"
      | "closed_lost";
    sourceChannel?: "whatsapp" | "app" | "web";
    assignment?: "all" | "assigned" | "unassigned";
  }>;
};

/**
 * WHY:   The orders route should stay thin while still accepting status filtering from the URL.
 * WHAT:  Renders the admin orders page for the active filter.
 * HOW:   Resolves search params and hands them to `OrdersPage`.
 */
export default async function OrdersRoute({ searchParams }: OrdersRouteProps) {
  return <OrdersPage searchParams={await searchParams} />;
}
