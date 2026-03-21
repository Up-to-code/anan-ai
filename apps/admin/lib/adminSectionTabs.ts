import type { RouteTab } from "@/lib/adminNavigation";

export const dashboardTabs: RouteTab[] = [];

export const docsTabs: RouteTab[] = [];

export const analyticsTabs: RouteTab[] = [
  { href: "/analytics/executive", label: "تنفيذي" },
  { href: "/analytics/engagement", label: "التفاعل" },
  { href: "/analytics/commercial", label: "التجاري" },
  { href: "/analytics/partners", label: "الشركاء" },
  { href: "/analytics/inventory", label: "المخزون" },
  { href: "/analytics/collaboration", label: "التعاون" },
];

export const usersTabs: RouteTab[] = [
  { href: "/users", label: "كل المستخدمين", exact: true },
  { href: "/users/profiles", label: "الملفات الشخصية" },
  { href: "/users/memberships", label: "العضويات والمنظمات" },
  { href: "/users/verification", label: "حالة التحقق" },
];

export const userDetailTabs = (userId: string): RouteTab[] => [
  { href: `/users/${userId}`, label: "الملف", exact: true },
  { href: `/users/${userId}/organization`, label: "المنظمة" },
  { href: `/users/${userId}/offers`, label: "العروض" },
  { href: `/users/${userId}/messages`, label: "الرسائل" },
  { href: `/users/${userId}/activity`, label: "النشاط" },
  { href: `/users/${userId}/access`, label: "الوصول" },
  { href: `/users/${userId}/verification`, label: "التحقق" },
];

export const organizationsTabs: RouteTab[] = [
  { href: "/organizations", label: "الوسطاء", exact: true },
  { href: "/organizations/developers", label: "المطورون" },
  { href: "/organizations/memberships", label: "العضويات" },
  { href: "/organizations/invites", label: "الدعوات" },
];

export const organizationDetailTabs = (organizationId: string): RouteTab[] => [
  { href: `/organizations/${organizationId}`, label: "الملخص", exact: true },
  { href: `/organizations/${organizationId}/members`, label: "الأعضاء" },
  { href: `/organizations/${organizationId}/properties`, label: "العقارات" },
  { href: `/organizations/${organizationId}/offers`, label: "العروض" },
  { href: `/organizations/${organizationId}/messages`, label: "الرسائل" },
  { href: `/organizations/${organizationId}/access`, label: "الوصول" },
  { href: `/organizations/${organizationId}/verification`, label: "التحقق" },
];

export const verificationTabs: RouteTab[] = [
  { href: "/verifications", label: "جديد", exact: true },
  { href: "/verifications/in-review", label: "قيد المراجعة" },
  { href: "/verifications/approved", label: "معتمد" },
  { href: "/verifications/rejected", label: "مرفوض" },
];

export const verificationDetailTabs = (requestId: string): RouteTab[] => [
  { href: `/verifications/${requestId}`, label: "البيانات", exact: true },
  { href: `/verifications/${requestId}/documents`, label: "المستندات" },
  { href: `/verifications/${requestId}/review`, label: "قرار المراجعة" },
];

export const propertiesTabs: RouteTab[] = [
  { href: "/properties", label: "الكل", exact: true },
  { href: "/properties/brokers", label: "عقارات الوسطاء" },
  { href: "/properties/developers", label: "عقارات المطورين" },
  { href: "/properties/status", label: "حسب الحالة" },
];

export const activityTabs: RouteTab[] = [
  { href: "/activity", label: "كل النشاط", exact: true },
  { href: "/activity/notifications", label: "الإشعارات" },
  { href: "/activity/messages", label: "المراسلات" },
  { href: "/activity/admin-log", label: "سجل الإدارة" },
];
