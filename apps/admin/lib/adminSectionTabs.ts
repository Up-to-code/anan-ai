import type { RouteTab } from "@/lib/adminNavigation";

export const overviewTabs: RouteTab[] = [];

export const docsTabs: RouteTab[] = [];
export const analyticsTabs: RouteTab[] = [];
export const propertiesTabs: RouteTab[] = [];
export const activityTabs: RouteTab[] = [];
export const verificationTabs: RouteTab[] = [
  { href: "/verifications", label: "كل الطلبات", exact: true },
];
export const verificationDetailTabs = (requestId: string): RouteTab[] => [
  { href: `/verifications/${requestId}`, label: "تفاصيل الطلب", exact: true },
];

export const salesTabs: RouteTab[] = [
  { href: "/sales/projects", label: "المشاريع", exact: false },
  { href: "/sales/properties", label: "العقارات", exact: false },
];

export const usersTabs: RouteTab[] = [
  { href: "/users", label: "كل المستخدمين", exact: true },
];

export const userDetailTabs = (userId: string): RouteTab[] => [
  { href: `/users/${userId}`, label: "الملف", exact: true },
];

export const organizationsTabs: RouteTab[] = [
  { href: "/organizations", label: "كل المنظمات", exact: true },
];

export const organizationDetailTabs = (organizationId: string): RouteTab[] => [
  { href: `/organizations/${organizationId}`, label: "الملخص", exact: true },
];

export const offersTabs: RouteTab[] = [
  { href: "/offers", label: "كل العروض", exact: true },
];

export const offerDetailTabs = (offerId: string): RouteTab[] => [
  { href: `/offers/${offerId}`, label: "تفاصيل العرض", exact: true },
];

export const aiSettingsTabs: RouteTab[] = [
  { href: "/ai-settings/knowledge", label: "قاعدة المعرفة" },
  { href: "/ai-settings/models", label: "النماذج" },
  { href: "/ai-settings/agents", label: "فرق الوكلاء" },
];

export const settingsTabs: RouteTab[] = [
  { href: "/settings/general", label: "عام" },
  { href: "/settings/team", label: "الفريق والصلاحيات" },
  { href: "/settings/profile", label: "الملف الشخصي" },
];
