import {
  BookOpen,
  Building2,
  Bot,
  BrainCircuit,
  Building,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Settings2,
  SquareChartGantt,
  Users,
  WalletCards,
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
    label: "نظرة عامة",
    items: [
      { href: "/overview", label: "لوحة التحكم", icon: LayoutDashboard, sectionKey: "overview" },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { href: "/sales/projects", label: "المشاريع", icon: FolderKanban, sectionKey: "sales-projects" },
      { href: "/sales/properties", label: "العقارات", icon: SquareChartGantt, sectionKey: "sales-properties" },
    ],
  },
  {
    label: "التمويل والبنوك",
    items: [
      { href: "/banks", label: "البنوك", icon: CreditCard, sectionKey: "banks" },
    ],
  },
  {
    label: "المنظمات",
    items: [
      { href: "/organizations", label: "كل المنظمات", icon: Building, sectionKey: "organizations" },
    ],
  },
  {
    label: "المستخدمون",
    items: [
      { href: "/users", label: "كل المستخدمين", icon: Users, sectionKey: "users" },
    ],
  },
  {
    label: "إدارة العروض",
    items: [
      { href: "/offers", label: "مراجعة العروض", icon: WalletCards, sectionKey: "offers" },
    ],
  },
  {
    label: "إعدادات الذكاء",
    items: [
      { href: "/ai-settings/knowledge", label: "قاعدة المعرفة", icon: BookOpen, sectionKey: "ai-knowledge" },
      { href: "/ai-settings/models", label: "النماذج", icon: BrainCircuit, sectionKey: "ai-models" },
      { href: "/ai-settings/agents", label: "فرق الوكلاء", icon: Bot, sectionKey: "ai-agents" },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { href: "/settings/general", label: "عام", icon: Settings2, sectionKey: "settings-general" },
      { href: "/settings/team", label: "الفريق والصلاحيات", icon: Users, sectionKey: "settings-team" },
      { href: "/settings/profile", label: "الملف الشخصي", icon: Settings, sectionKey: "settings-profile" },
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
