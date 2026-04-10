import { getAdminPageOperationHref } from "@/lib/adminPages";
import type { RouteTab } from "@/lib/adminNavigation";

export const overviewTabs: RouteTab[] = [];

export const verificationTabs: RouteTab[] = [];

export const verificationDetailTabs = (requestId: string): RouteTab[] => [
  {
    href: getAdminPageOperationHref("verifications", "detail", requestId) ?? `/verifications/${requestId}`,
    label: "تفاصيل الطلب",
    exact: true,
  },
];
