import type { OrganizationSummary } from "@/server/contracts/organizations";
import type { ComplianceRuleset } from "@/server/contracts/compliance";

export type ComplianceBanner = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * WHY:   Workspace UI needs a single place to decide whether to show compliance banners.
 * WHAT:  Builds the banner payload from the ruleset and org verification state.
 * HOW:   Returns null when verification is complete or banners are disabled, otherwise uses ruleset defaults.
 */
export function buildComplianceBanner(
  primaryOrganization: OrganizationSummary | undefined,
  ruleset: ComplianceRuleset | null,
): ComplianceBanner | null {
  if (!primaryOrganization || !ruleset) return null;
  if (!ruleset.enforcement.showBanner || !ruleset.enforcement.requireOrgVerification) return null;
  if (primaryOrganization.isVerified) return null;

  const verificationSummary = primaryOrganization.verificationSummary;
  const statusBody =
    verificationSummary?.currentRequestStatus === "in_review"
      ? "تم إرسال مستندات المنظمة وهي الآن قيد مراجعة الأدمن. سيبقى النشر محدوداً حتى الاعتماد."
      : verificationSummary?.currentRequestStatus === "rejected"
        ? verificationSummary.reviewerNotes ?? "تم رفض آخر طلب توثيق. راجع الملاحظات وأعد إرسال المستندات المطلوبة."
        : verificationSummary?.currentRequestStatus === "closed"
          ? "تم إغلاق توثيق المنظمة من لوحة الأدمن. أعد إرسال المستندات إذا كنت تريد إعادة التفعيل."
          : ruleset.enforcement.bannerBody ?? "يرجى إكمال مستندات التحقق لإظهار العقارات ونشرها.";

  return {
    title: ruleset.enforcement.bannerTitle ?? "التوثيق مطلوب قبل النشر",
    body: statusBody,
    ctaLabel: ruleset.enforcement.bannerCtaLabel ?? "إكمال التوثيق",
    ctaHref: ruleset.enforcement.bannerCtaHref ?? "/ws/settings?tab=verification",
  };
}
