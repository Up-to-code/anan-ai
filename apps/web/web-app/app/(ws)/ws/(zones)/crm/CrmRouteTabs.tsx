import RouteTabBar from "../../_components/Visuals/RouteTabBar";

/**
 * WHY:   CRM route navigation should be explicit so pipeline, clients, and brokers feel like one complete workspace.
 * WHAT:  Renders route-backed tabs for the CRM zone.
 * HOW:   Reuses the shared workspace tab bar with CRM-specific destinations.
 */
export default function CrmRouteTabs() {
  return (
    <RouteTabBar
      tabs={[
        { href: "/ws/crm", label: "خط الأنابيب" },
        { href: "/ws/crm/clients", label: "العملاء" },
        { href: "/ws/crm/brokers", label: "الوسطاء" },
      ]}
    />
  );
}
