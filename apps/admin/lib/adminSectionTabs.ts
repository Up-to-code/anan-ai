import { getAdminPageOperationHref } from "@/lib/adminPages";
import type { RouteTab } from "@/lib/adminNavigation";

export const overviewTabs: RouteTab[] = [];

export const verificationTabs: RouteTab[] = [];
export const projectReadinessTabs: RouteTab[] = [
  { href: "/projects?filter=incomplete", label: "غير مكتمل" },
  { href: "/projects?filter=pending_review", label: "قيد المراجعة" },
  { href: "/projects?filter=approved", label: "معتمد" },
  { href: "/projects?filter=blocked", label: "محجوب" },
  { href: "/projects?filter=expired", label: "يحتاج تجديد" },
];

export const verificationDetailTabs = (requestId: string): RouteTab[] => [
  {
    href: getAdminPageOperationHref("verifications", "detail", requestId) ?? `/verifications/${requestId}`,
    label: "تفاصيل الطلب",
    exact: true,
  },
];

export const projectReadinessDetailTabs = (dossierId: string): RouteTab[] => [
  {
    href: getAdminPageOperationHref("projects", "detail", dossierId) ?? `/projects/${dossierId}`,
    label: "تفاصيل الجاهزية",
    exact: true,
  },
];
