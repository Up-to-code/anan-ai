import {
  adminDomainTabs,
  getAdminCreateRouteTabs,
  getAdminEntityRouteTabs,
  getAdminPageOperationHref,
  getAdminPageTabs,
} from "@/lib/adminPages";
import type { RouteTab } from "@/lib/adminNavigation";

export const overviewTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.commandCenter);

export const docsTabs: RouteTab[] = [];
export const analyticsTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.commandCenter);
export const propertiesTabs: RouteTab[] = [];
export const activityTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.commandCenter);
export const diagnosticsTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.commandCenter);
export const verificationTabs: RouteTab[] = [
  ...getAdminPageTabs(adminDomainTabs.partnerOps),
];
export const verificationDetailTabs = (requestId: string): RouteTab[] => [
  { href: getAdminPageOperationHref("verifications", "detail", requestId) ?? `/verifications/${requestId}`, label: "تفاصيل الطلب", exact: true },
];

export const salesTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.catalogFinance);

export const usersTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.partnerOps);

export const newUserTabs: RouteTab[] = getAdminCreateRouteTabs("users");

export const userDetailTabs = (userId: string): RouteTab[] => getAdminEntityRouteTabs("users", userId);

export const organizationsTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.partnerOps);

export const newOrganizationTabs: RouteTab[] = getAdminCreateRouteTabs("organizations");

export const organizationDetailTabs = (organizationId: string): RouteTab[] =>
  getAdminEntityRouteTabs("organizations", organizationId);

export const offersTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.partnerOps);

export const newOfferTabs: RouteTab[] = getAdminCreateRouteTabs("offers");

export const offerDetailTabs = (offerId: string): RouteTab[] => getAdminEntityRouteTabs("offers", offerId);

export const aiSettingsTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.aiOps);

export const settingsTabs: RouteTab[] = getAdminPageTabs(adminDomainTabs.settings);
