import RouteTabBar from "../../_components/Visuals/RouteTabBar";

/**
 * WHY:   The market workspace now needs route-backed analysis categories instead of local-state tab switching.
 * WHAT:  Renders the market zone navigation for cities, areas, opportunities, and research analysis pages.
 * HOW:   Reuses the shared route tab bar pattern already used in other workspace zones.
 */
export default function MarketRouteTabs() {
  return (
    <RouteTabBar
      tabs={[
        { href: "/ws/market/cities", label: "المدن" },
        { href: "/ws/market/areas", label: "الأحياء" },
        { href: "/ws/market/opportunities", label: "الفرص" },
        { href: "/ws/market/research", label: "البحث والكلمات" },
      ]}
    />
  );
}
