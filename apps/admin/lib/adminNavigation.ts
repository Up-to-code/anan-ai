import {
  Activity,
  BarChart3,
  BookOpen,
  Bug,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  ShoppingBag,
  ShieldCheck,
  Users,
  Waypoints,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  sectionKey: string;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export type RouteTab = {
  href: string;
  label: string;
  exact?: boolean;
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "القيادة والتحكم",
    items: [
      { href: "/dashboard", label: "لوحة المتابعة", icon: LayoutDashboard, sectionKey: "dashboard" },
      { href: "/analytics", label: "التحليلات", icon: BarChart3, sectionKey: "analytics" },
    ],
  },
  {
    label: "الشبكة والسوق",
    items: [
      { href: "/organizations", label: "المنظمات", icon: Waypoints, sectionKey: "organizations" },
      { href: "/users", label: "المستخدمون", icon: Users, sectionKey: "users" },
      { href: "/properties", label: "العقارات", icon: Building2, sectionKey: "properties" },
    ],
  },
  {
    label: "العمليات والحوكمة",
    items: [
      { href: "/orders", label: "الطلبات", icon: ShoppingBag, sectionKey: "orders" },
      { href: "/verifications", label: "التحقق", icon: ClipboardCheck, sectionKey: "verifications" },
      { href: "/activity", label: "النشاط", icon: Activity, sectionKey: "activity" },
      { href: "/compliance", label: "الامتثال", icon: ShieldCheck, sectionKey: "compliance" },
    ],
  },
  {
    label: "النظام والمعرفة التشغيلية",
    items: [
      { href: "/knowledge", label: "المعرفة", icon: BookOpen, sectionKey: "knowledge" },
      { href: "/diagnostics", label: "التشخيص", icon: Bug, sectionKey: "diagnostics" },
    ],
  },
];

export const adminPrimaryNav = adminNavGroups.flatMap((group) => group.items);

/**
 * WHY:   Admin pages need a reliable breadcrumb label for the primary navigation header.
 * WHAT:  Resolves the label for the active primary navigation item.
 * HOW:   Finds the first nav item whose href matches or prefixes the pathname.
 */
export function getPrimaryNavLabel(pathname: string) {
  const item =
    adminPrimaryNav.find((navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) ??
    adminPrimaryNav[0];

  return item.label;
}

/**
 * WHY:   The shared shell needs access to the full active nav item, not only its display label.
 * WHAT:  Returns the current primary navigation item for a pathname.
 * HOW:   Reuses the same prefix matching logic as the header-label resolver.
 */
export function getPrimaryNavItem(pathname: string) {
  return (
    adminPrimaryNav.find((navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) ??
    adminPrimaryNav[0]
  );
}
