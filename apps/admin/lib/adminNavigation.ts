import {
  LayoutDashboard,
} from "lucide-react";
import { adminDomainRegistry, getActiveAdminPage, getAdminPagesForDomain } from "./adminPages";

export type AdminNavItem = {
  href: string;
  label: string;
  title: string;
  icon: typeof LayoutDashboard;
  sectionKey: string;
  dataMode: "mock" | "live";
  available: boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  defaultOpen: boolean;
  priority: number;
  items: AdminNavItem[];
};

export type RouteTab = {
  href: string;
  label: string;
  exact?: boolean;
};

export const adminNavGroups: AdminNavGroup[] = adminDomainRegistry
  .map((domain) => ({
    id: domain.id,
    label: domain.label,
    defaultOpen: domain.defaultOpen,
    priority: domain.priority,
    items: getAdminPagesForDomain(domain.id)
      .filter((page) => page.available)
      .map((page) => ({
        href: page.href,
        label: page.label,
        title: page.title,
        icon: page.icon,
        sectionKey: page.sectionKey,
        dataMode: page.dataMode,
        available: page.available,
      })),
  }))
  .sort((left, right) => left.priority - right.priority);

export const adminPrimaryNav = adminNavGroups.flatMap((group) => group.items);

/**
 * WHY:   Admin pages need a reliable breadcrumb label for the primary navigation header.
 * WHAT:  Resolves the label for the active primary navigation item.
 * HOW:   Finds the first nav item whose href matches or prefixes the pathname.
 */
export function getPrimaryNavLabel(pathname: string) {
  return getActiveAdminPage(pathname).label;
}

/**
 * WHY:   The shared shell needs access to the full active nav item, not only its display label.
 * WHAT:  Returns the current primary navigation item for a pathname.
 * HOW:   Reuses the same prefix matching logic as the header-label resolver.
 */
export function getPrimaryNavItem(pathname: string) {
  const page = getActiveAdminPage(pathname);
  return adminPrimaryNav.find((navItem) => navItem.sectionKey === page.sectionKey) ?? adminPrimaryNav[0];
}
