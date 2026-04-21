import { LayoutDashboard } from "lucide-react";
import { adminPageRegistry, getActiveAdminPage } from "./adminPages";

export type AdminNavItem = {
  href: string;
  label: string;
  title: string;
  icon: typeof LayoutDashboard;
  sectionKey: string;
};

export type RouteTab = {
  href: string;
  label: string;
  exact?: boolean;
};

export const adminPrimaryNav: AdminNavItem[] = adminPageRegistry.map((page) => ({
  href: page.href,
  label: page.label,
  title: page.title,
  icon: page.icon,
  sectionKey: page.sectionKey,
}));

/**
 * WHY:   Admin pages need a reliable label for the primary navigation header.
 * WHAT:  Resolves the title for the active navigation item.
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
