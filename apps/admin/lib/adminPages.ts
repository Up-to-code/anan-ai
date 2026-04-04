import {
  Activity,
  BookOpen,
  Bot,
  BrainCircuit,
  Building,
  Building2,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Settings2,
  ShieldAlert,
  SquareChartGantt,
  Users,
  WalletCards,
} from "lucide-react";

export type AdminDomainId =
  | "command_center"
  | "partner_ops"
  | "catalog_finance"
  | "ai_ops"
  | "settings";

export type AdminDataMode = "mock" | "live";

export type AdminPageRouteDefinition = {
  list: string;
  detailPattern?: string;
  createPath?: string;
  editPattern?: string;
  deletePattern?: string;
};

export type AdminPageOperation = "list" | "create" | "detail" | "edit" | "delete";

export type AdminPageDefinition = {
  id: string;
  domainId: AdminDomainId;
  label: string;
  eyebrow: string;
  title: string;
  sectionKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  matchPrefixes: string[];
  priority: number;
  dataMode: AdminDataMode;
  available: boolean;
  routes: AdminPageRouteDefinition;
};

export type AdminDomainDefinition = {
  id: AdminDomainId;
  label: string;
  defaultOpen: boolean;
  priority: number;
};

export const adminDomainRegistry: AdminDomainDefinition[] = [
  { id: "command_center", label: "مركز القيادة", defaultOpen: true, priority: 10 },
  { id: "partner_ops", label: "عمليات الشركاء", defaultOpen: true, priority: 20 },
  { id: "catalog_finance", label: "الكتالوج والتمويل", defaultOpen: true, priority: 30 },
  { id: "ai_ops", label: "عمليات الذكاء", defaultOpen: false, priority: 40 },
  { id: "settings", label: "الإعدادات", defaultOpen: false, priority: 50 },
];

export const adminPageRegistry: AdminPageDefinition[] = [
  {
    id: "overview",
    domainId: "command_center",
    label: "لوحة التحكم",
    eyebrow: "مركز القيادة",
    title: "لوحة التحكم",
    sectionKey: "overview",
    href: "/overview",
    icon: LayoutDashboard,
    matchPrefixes: ["/overview"],
    priority: 10,
    dataMode: "mock",
    available: true,
    routes: { list: "/overview" },
  },
  {
    id: "analytics",
    domainId: "command_center",
    label: "التحليلات",
    eyebrow: "مركز القيادة",
    title: "التحليلات",
    sectionKey: "analytics",
    href: "/analytics",
    icon: SquareChartGantt,
    matchPrefixes: ["/analytics"],
    priority: 20,
    dataMode: "mock",
    available: true,
    routes: { list: "/analytics" },
  },
  {
    id: "activity",
    domainId: "command_center",
    label: "سجل النشاط",
    eyebrow: "مركز القيادة",
    title: "سجل النشاط",
    sectionKey: "activity",
    href: "/activity",
    icon: Activity,
    matchPrefixes: ["/activity"],
    priority: 30,
    dataMode: "mock",
    available: true,
    routes: { list: "/activity" },
  },
  {
    id: "diagnostics",
    domainId: "command_center",
    label: "التشخيص",
    eyebrow: "مركز القيادة",
    title: "التشخيص",
    sectionKey: "diagnostics",
    href: "/diagnostics",
    icon: ShieldAlert,
    matchPrefixes: ["/diagnostics"],
    priority: 40,
    dataMode: "mock",
    available: true,
    routes: { list: "/diagnostics" },
  },
  {
    id: "organizations",
    domainId: "partner_ops",
    label: "المنظمات",
    eyebrow: "عمليات الشركاء",
    title: "كل المنظمات",
    sectionKey: "organizations",
    href: "/organizations",
    icon: Building,
    matchPrefixes: ["/organizations"],
    priority: 10,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/organizations",
      detailPattern: "/organizations/[organizationId]",
      createPath: "/organizations/new",
      editPattern: "/organizations/[organizationId]/edit",
      deletePattern: "/organizations/[organizationId]/delete",
    },
  },
  {
    id: "users",
    domainId: "partner_ops",
    label: "المستخدمون",
    eyebrow: "عمليات الشركاء",
    title: "كل المستخدمين",
    sectionKey: "users",
    href: "/users",
    icon: Users,
    matchPrefixes: ["/users"],
    priority: 20,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/users",
      detailPattern: "/users/[userId]",
      createPath: "/users/new",
      editPattern: "/users/[userId]/edit",
      deletePattern: "/users/[userId]/delete",
    },
  },
  {
    id: "verifications",
    domainId: "partner_ops",
    label: "طلبات التوثيق",
    eyebrow: "عمليات الشركاء",
    title: "طلبات التوثيق",
    sectionKey: "verifications",
    href: "/verifications",
    icon: Building2,
    matchPrefixes: ["/verifications"],
    priority: 30,
    dataMode: "live",
    available: true,
    routes: {
      list: "/verifications",
      detailPattern: "/verifications/[requestId]",
    },
  },
  {
    id: "offers",
    domainId: "partner_ops",
    label: "مراجعة العروض",
    eyebrow: "عمليات الشركاء",
    title: "مراجعة العروض",
    sectionKey: "offers",
    href: "/offers",
    icon: WalletCards,
    matchPrefixes: ["/offers"],
    priority: 40,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/offers",
      detailPattern: "/offers/[offerId]",
      createPath: "/offers/new",
      editPattern: "/offers/[offerId]/edit",
      deletePattern: "/offers/[offerId]/delete",
    },
  },
  {
    id: "sales-projects",
    domainId: "catalog_finance",
    label: "المشاريع",
    eyebrow: "الكتالوج والتمويل",
    title: "المشاريع",
    sectionKey: "sales-projects",
    href: "/sales/projects",
    icon: FolderKanban,
    matchPrefixes: ["/sales/projects"],
    priority: 10,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/sales/projects",
      detailPattern: "/sales/projects/[projectId]",
      createPath: "/sales/projects/new",
      editPattern: "/sales/projects/[projectId]/edit",
      deletePattern: "/sales/projects/[projectId]/delete",
    },
  },
  {
    id: "sales-properties",
    domainId: "catalog_finance",
    label: "العقارات",
    eyebrow: "الكتالوج والتمويل",
    title: "العقارات",
    sectionKey: "sales-properties",
    href: "/sales/properties",
    icon: SquareChartGantt,
    matchPrefixes: ["/sales/properties"],
    priority: 20,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/sales/properties",
      detailPattern: "/sales/properties/[propertyId]",
      createPath: "/sales/properties/new",
      editPattern: "/sales/properties/[propertyId]/edit",
      deletePattern: "/sales/properties/[propertyId]/delete",
    },
  },
  {
    id: "banks",
    domainId: "catalog_finance",
    label: "البنوك",
    eyebrow: "الكتالوج والتمويل",
    title: "البنوك",
    sectionKey: "banks",
    href: "/banks",
    icon: CreditCard,
    matchPrefixes: ["/banks"],
    priority: 30,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/banks",
      detailPattern: "/banks/[bankId]",
      createPath: "/banks/new",
      editPattern: "/banks/[bankId]/edit",
      deletePattern: "/banks/[bankId]/delete",
    },
  },
  {
    id: "ai-knowledge",
    domainId: "ai_ops",
    label: "قاعدة المعرفة",
    eyebrow: "عمليات الذكاء",
    title: "قاعدة المعرفة",
    sectionKey: "ai-knowledge",
    href: "/ai-settings/knowledge",
    icon: BookOpen,
    matchPrefixes: ["/ai-settings/knowledge"],
    priority: 10,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/ai-settings/knowledge",
      detailPattern: "/ai-settings/knowledge/[itemId]",
      createPath: "/ai-settings/knowledge/new",
      editPattern: "/ai-settings/knowledge/[itemId]/edit",
      deletePattern: "/ai-settings/knowledge/[itemId]/delete",
    },
  },
  {
    id: "ai-models",
    domainId: "ai_ops",
    label: "النماذج",
    eyebrow: "عمليات الذكاء",
    title: "النماذج",
    sectionKey: "ai-models",
    href: "/ai-settings/models",
    icon: BrainCircuit,
    matchPrefixes: ["/ai-settings/models"],
    priority: 20,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/ai-settings/models",
      detailPattern: "/ai-settings/models/[modelId]",
      createPath: "/ai-settings/models/new",
      editPattern: "/ai-settings/models/[modelId]/edit",
      deletePattern: "/ai-settings/models/[modelId]/delete",
    },
  },
  {
    id: "ai-agents",
    domainId: "ai_ops",
    label: "فرق الوكلاء",
    eyebrow: "عمليات الذكاء",
    title: "فرق الوكلاء",
    sectionKey: "ai-agents",
    href: "/ai-settings/agents",
    icon: Bot,
    matchPrefixes: ["/ai-settings/agents"],
    priority: 30,
    dataMode: "mock",
    available: true,
    routes: {
      list: "/ai-settings/agents",
      detailPattern: "/ai-settings/agents/[teamId]",
      createPath: "/ai-settings/agents/new",
      editPattern: "/ai-settings/agents/[teamId]/edit",
      deletePattern: "/ai-settings/agents/[teamId]/delete",
    },
  },
  {
    id: "settings-general",
    domainId: "settings",
    label: "عام",
    eyebrow: "الإعدادات",
    title: "الإعدادات العامة",
    sectionKey: "settings-general",
    href: "/settings/general",
    icon: Settings2,
    matchPrefixes: ["/settings/general"],
    priority: 10,
    dataMode: "mock",
    available: true,
    routes: { list: "/settings/general" },
  },
  {
    id: "settings-team",
    domainId: "settings",
    label: "الفريق والصلاحيات",
    eyebrow: "الإعدادات",
    title: "الفريق والصلاحيات",
    sectionKey: "settings-team",
    href: "/settings/team",
    icon: Users,
    matchPrefixes: ["/settings/team"],
    priority: 20,
    dataMode: "mock",
    available: true,
    routes: { list: "/settings/team" },
  },
  {
    id: "settings-profile",
    domainId: "settings",
    label: "الملف الشخصي",
    eyebrow: "الإعدادات",
    title: "الملف الشخصي",
    sectionKey: "settings-profile",
    href: "/settings/profile",
    icon: Settings,
    matchPrefixes: ["/settings/profile"],
    priority: 30,
    dataMode: "mock",
    available: true,
    routes: { list: "/settings/profile" },
  },
];

export const adminDomainTabs = {
  commandCenter: ["overview", "analytics", "activity", "diagnostics"],
  partnerOps: ["organizations", "users", "verifications", "offers"],
  catalogFinance: ["sales-projects", "sales-properties", "banks"],
  aiOps: ["ai-knowledge", "ai-models", "ai-agents"],
  settings: ["settings-general", "settings-team", "settings-profile"],
} as const;

/**
 * WHY:   The rebuilt admin now keeps page metadata in one registry so route chrome stays consistent everywhere.
 * WHAT:  Resolves a single admin page definition by its stable id.
 * HOW:   Looks up the record in `adminPageRegistry` and returns `null` when no match exists.
 */
export function getAdminPageDefinition(pageId: string) {
  return adminPageRegistry.find((page) => page.id === pageId) ?? null;
}

/**
 * WHY:   Domain-driven navigation and tabs both need the same ordered page collection.
 * WHAT:  Returns all page definitions belonging to one admin domain.
 * HOW:   Filters by `domainId` and sorts the result using the registry priority field.
 */
export function getAdminPagesForDomain(domainId: AdminDomainId) {
  return adminPageRegistry
    .filter((page) => page.domainId === domainId)
    .sort((left, right) => left.priority - right.priority);
}

/**
 * WHY:   Section tabs should be derived from the same registry that powers the sidebar and route ordering.
 * WHAT:  Builds top-level route tabs for a set of admin page ids.
 * HOW:   Resolves each page from the registry, then maps to the shared `RouteTab` shape.
 */
export function getAdminPageTabs(pageIds: readonly string[]) {
  return pageIds
    .map((pageId) => getAdminPageDefinition(pageId))
    .filter((page): page is AdminPageDefinition => Boolean(page))
    .map((page) => ({
      href: page.href,
      label: page.label,
      exact: true,
    }));
}

/**
 * WHY:   CRUD pages should never hardcode their sibling route paths when the registry already owns them.
 * WHAT:  Returns the concrete href for a page operation, optionally replacing entity id params.
 * HOW:   Uses the route pattern stored on the page definition and swaps any `[param]` token with the provided id.
 */
export function getAdminPageOperationHref(
  pageId: string,
  operation: AdminPageOperation,
  entityId?: string,
) {
  const page = getAdminPageDefinition(pageId);
  if (!page) {
    return null;
  }

  if (operation === "list") {
    return page.routes.list;
  }

  if (operation === "create") {
    return page.routes.createPath ?? null;
  }

  const pattern =
    operation === "detail"
      ? page.routes.detailPattern
      : operation === "edit"
        ? page.routes.editPattern
        : page.routes.deletePattern;

  if (!pattern || !entityId) {
    return null;
  }

  return pattern.replace(/\[[^\]]+\]/g, entityId);
}

/**
 * WHY:   Entity detail/edit/delete screens need a predictable secondary nav that reflects the lifecycle of the current record.
 * WHAT:  Builds a list/detail/edit/delete tab set for one registry-backed entity page.
 * HOW:   Includes only the operations available for that entity and marks all tabs as exact route matches.
 */
export function getAdminEntityRouteTabs(pageId: string, entityId?: string) {
  const page = getAdminPageDefinition(pageId);

  if (!page) {
    return [];
  }

  const tabs: Array<{ label: string; href: string | null }> = [
    { label: page.label, href: getAdminPageOperationHref(pageId, "list") },
    { label: "التفاصيل", href: entityId ? getAdminPageOperationHref(pageId, "detail", entityId) : null },
    { label: "تعديل", href: entityId ? getAdminPageOperationHref(pageId, "edit", entityId) : null },
    { label: "حذف", href: entityId ? getAdminPageOperationHref(pageId, "delete", entityId) : null },
  ];

  return tabs
    .filter((tab): tab is { label: string; href: string } => tab.href !== null)
    .map((tab) => ({
      href: tab.href,
      label: tab.label,
      exact: true,
    }));
}

/**
 * WHY:   Create flows should be discoverable from their list pages without inventing one-off tab arrays.
 * WHAT:  Builds a list/create tab set for one registry-backed entity page.
 * HOW:   Includes the create route only when the page definition exposes it.
 */
export function getAdminCreateRouteTabs(pageId: string) {
  const page = getAdminPageDefinition(pageId);

  if (!page) {
    return [];
  }

  const tabs = [
    { href: getAdminPageOperationHref(pageId, "list"), label: page.label },
    { href: getAdminPageOperationHref(pageId, "create"), label: "إضافة" },
  ];

  return tabs
    .filter((tab): tab is { href: string; label: string } => Boolean(tab.href))
    .map((tab) => ({
      href: tab.href,
      label: tab.label,
      exact: true,
    }));
}

/**
 * WHY:   The top navbar and sidebar must agree about which section owns the current route.
 * WHAT:  Resolves the active admin page from any admin pathname, including nested CRUD routes.
 * HOW:   Matches the pathname against each page's registered prefixes and falls back to overview.
 */
export function getActiveAdminPage(pathname: string) {
  return (
    adminPageRegistry.find((page) => page.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) ??
    adminPageRegistry[0]
  );
}
