import BrandWorkspaceTabs, { type BrandWorkspaceTab } from "../WorkspaceBrand/BrandWorkspaceTabs";

export type RouteTab = {
  href: string;
  label: React.ReactNode;
};

/**
 * WHY:   The offers workspace needs route-backed tabs that feel like part of the zone layout, not generic links.
 * WHAT:  Renders a sticky horizontal tab bar and highlights the active route.
 * HOW:   Reads the current pathname and matches the nearest tab prefix.
 */
export default function RouteTabBar({
  tabs,
  className,
}: {
  tabs: RouteTab[];
  className?: string;
}) {
  return <BrandWorkspaceTabs tabs={tabs as BrandWorkspaceTab[]} className={className} />;
}
