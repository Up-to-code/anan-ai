import RouteTabBar from "../../../../_components/Visuals/RouteTabBar";

type CrmRouteTabsLabels = {
  deals: string;
  clients: string;
};

/**
 * WHY:   CRM route navigation should be explicit so pipeline, clients, and brokers feel like one complete workspace.
 * WHAT:  Renders route-backed tabs for the CRM zone.
 * HOW:   Reuses the shared workspace tab bar with CRM-specific destinations.
 */
export default function CrmRouteTabs({ labels }: { labels: CrmRouteTabsLabels }) {
  return (
    <RouteTabBar
      tabs={[
        { href: "/ws/crm", label: labels.deals },
        { href: "/ws/crm/clients", label: labels.clients },
      ]}
    />
  );
}
