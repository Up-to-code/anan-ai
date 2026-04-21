import { Building2, FileCheck2, LayoutDashboard } from "lucide-react";

export type AdminPageRouteDefinition = {
  list: string;
  detailPattern?: string;
};

export type AdminPageOperation = "list" | "detail";

export type AdminPageDefinition = {
  id: "overview" | "verifications" | "projects";
  label: string;
  eyebrow: string;
  title: string;
  sectionKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  matchPrefixes: string[];
  priority: number;
  routes: AdminPageRouteDefinition;
};

export const adminPageRegistry: AdminPageDefinition[] = [
  {
    id: "overview",
    label: "لوحة التحكم",
    eyebrow: "العمليات",
    title: "لوحة التحكم",
    sectionKey: "overview",
    href: "/overview",
    icon: LayoutDashboard,
    matchPrefixes: ["/overview"],
    priority: 10,
    routes: { list: "/overview" },
  },
  {
    id: "verifications",
    label: "طلبات التوثيق",
    eyebrow: "العمليات",
    title: "طلبات التوثيق",
    sectionKey: "verifications",
    href: "/verifications",
    icon: Building2,
    matchPrefixes: ["/verifications"],
    priority: 20,
    routes: {
      list: "/verifications",
      detailPattern: "/verifications/[requestId]",
    },
  },
  {
    id: "projects",
    label: "جاهزية المشاريع",
    eyebrow: "الامتثال",
    title: "جاهزية المشاريع",
    sectionKey: "projects",
    href: "/projects",
    icon: FileCheck2,
    matchPrefixes: ["/projects"],
    priority: 30,
    routes: {
      list: "/projects",
      detailPattern: "/projects/[dossierId]",
    },
  },
];

/**
 * WHY:   The MVP admin keeps one small route registry so shell chrome and page tabs stay aligned.
 * WHAT:  Resolves a single admin page definition by its stable id.
 * HOW:   Looks up the record in `adminPageRegistry` and returns `null` when no match exists.
 */
export function getAdminPageDefinition(pageId: string) {
  return adminPageRegistry.find((page) => page.id === pageId) ?? null;
}

/**
 * WHY:   Section tabs should be derived from the same registry that powers the sidebar and header labels.
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
 * WHY:   Detail screens should keep route construction centralized in the page registry.
 * WHAT:  Returns the concrete href for one supported page operation.
 * HOW:   Uses the stored route pattern and swaps any `[param]` token with the provided entity id.
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

  if (!page.routes.detailPattern || !entityId) {
    return null;
  }

  return page.routes.detailPattern.replace(/\[[^\]]+\]/g, entityId);
}

/**
 * WHY:   The top navbar and sidebar must agree about which section owns the current route.
 * WHAT:  Resolves the active admin page from any admin pathname, including the verification detail route.
 * HOW:   Matches the pathname against each page's registered prefixes and falls back to overview.
 */
export function getActiveAdminPage(pathname: string) {
  return (
    adminPageRegistry.find((page) =>
      page.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)),
    ) ?? adminPageRegistry[0]
  );
}
