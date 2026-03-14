import {
  Activity,
  BarChart3,
  Building2,
  ClipboardCheck,
  LayoutDashboard,
  Users,
  Waypoints,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  sectionKey: string;
};

export type RouteTab = {
  href: string;
  label: string;
  exact?: boolean;
};

export const adminPrimaryNav: AdminNavItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, sectionKey: "dashboard" },
  { href: "/analytics", label: "التحليلات", icon: BarChart3, sectionKey: "analytics" },
  { href: "/users", label: "المستخدمون", icon: Users, sectionKey: "users" },
  { href: "/organizations", label: "المنظمات", icon: Waypoints, sectionKey: "organizations" },
  { href: "/verifications", label: "التحقق", icon: ClipboardCheck, sectionKey: "verifications" },
  { href: "/properties", label: "العقارات", icon: Building2, sectionKey: "properties" },
  { href: "/activity", label: "النشاط", icon: Activity, sectionKey: "activity" },
];

export function getPrimaryNavLabel(pathname: string) {
  const item =
    adminPrimaryNav.find((navItem) => pathname === navItem.href || pathname.startsWith(`${navItem.href}/`)) ??
    adminPrimaryNav[0];

  return item.label;
}
