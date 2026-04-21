import Link from "next/link";
import { Building2, KeyRound, ShieldCheck } from "lucide-react";
import { buildAuthorizeFlowPath } from "../authorize.shared";
import type { OAuthScopeDetail } from "@/server/contracts/oauth";
import type { OAuthAuthorizationPreview } from "../loaders";

function getOrganizationTypeLabel(type: OAuthAuthorizationPreview["organizations"][number]["organizationType"]) {
  return type === "broker" ? "Broker organization" : "Developer organization";
}

function getOrganizationRoleLabel(role: OAuthAuthorizationPreview["organizations"][number]["role"]) {
  if (role === "manager") return "Manager";
  if (role === "viewer") return "Viewer";
  return "Member";
}

export function buildApprovalStatus(preview: OAuthAuthorizationPreview) {
  if (preview.requiresOrganizationSelection) {
    return "اختر المنظمة التي تريد ربط التطبيق بها أولاً.";
  }
  if (preview.managerApprovalRequired) {
    return "يمكن فقط لمدير المنظمة الموافقة على ربط تطبيق جديد أو توسيع الصلاحيات.";
  }
  if (preview.existingAuthorization && !preview.requiresConsent) {
    return `هذا التطبيق مرتبط بالفعل بمنظمة ${preview.existingAuthorization.organizationName}. سنكمل المتابعة بدون طلب موافقة جديدة.`;
  }
  if (preview.selectedOrganization) {
    return `سيتم ربط التطبيق بمنظمة ${preview.selectedOrganization.organizationName} وليس بحساب شخصي.`;
  }
  return "سيتم ربط التطبيق بالمنظمة التي تختارها من هذه الشاشة.";
}

export function getSelectedOrganizationNotice(preview: OAuthAuthorizationPreview) {
  if (!preview.selectedOrganization) return null;

  return {
    title: `الربط الحالي: ${preview.selectedOrganization.organizationName}`,
    body: preview.canApproveSelectedOrganization
      ? "يمكنك الموافقة على الصلاحيات من هذه الشاشة."
      : "يمكنك المتابعة فقط إذا كانت هذه الصلاحيات معتمدة مسبقاً لهذه المنظمة.",
  };
}

export function getOAuthAuthorizeCopy(preview: OAuthAuthorizationPreview) {
  return {
    emptyOrganizationsLabel: "لا توجد منظمة متاحة لهذا الحساب لإكمال الربط.",
    organizationPickerLabel: "اختر المنظمة",
    publisherLabel: `الناشر: ${preview.client.publisherName}`,
    approveLabel: preview.requiresConsent ? "الموافقة وربط التطبيق" : "الاستمرار إلى التطبيق",
    denyLabel: "رفض الطلب",
    asideTitle: "كيف يعمل الربط الآن؟",
    asideEyebrow: "Organization Approval",
    asideBody: [
      "التطبيقات المرتبطة أصبحت تخص المنظمة نفسها، وليس الحساب الشخصي.",
      "أي مدير في المنظمة يستطيع الموافقة مرة واحدة، وبعدها يمكن لباقي الأعضاء متابعة نفس الربط بدون إعادة طلب الموافقة ما دامت الصلاحيات لم تتغير.",
      preview.offlineAccess
        ? "هذا التطبيق طلب بقاء الاتصال بالمنظمة حتى عند عدم فتح عنان."
        : "هذا التطبيق لن يحتفظ باتصال طويل الأمد بدون طلب صلاحية اتصال ممتدة.",
    ],
    existingAuthorizationEyebrow: "Existing organization approval",
    existingAuthorizationBody:
      "تمت الموافقة سابقاً لهذه المنظمة على هذا التطبيق. إذا كانت الصلاحيات نفسها ما زالت كافية، فسنكمل مباشرة إلى التطبيق.",
  };
}

export function OrganizationPicker({ preview }: { preview: OAuthAuthorizationPreview }) {
  const copy = getOAuthAuthorizeCopy(preview);
  if (preview.organizations.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-7 text-amber-900">
        {copy.emptyOrganizationsLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
        <Building2 className="h-4 w-4" />
        {copy.organizationPickerLabel}
      </div>
      <div className="grid gap-3">
        {preview.organizations.map((organization) => {
          const isSelected = organization.tenantOrgId === preview.selectedTenantOrgId;
          return (
            <Link
              key={organization.tenantOrgId}
              href={buildAuthorizeFlowPath(preview.flowId, organization.tenantOrgId)}
              className={`rounded-3xl border px-4 py-4 text-right transition ${
                isSelected
                  ? "border-blue-200 bg-blue-50 text-slate-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-slate-100"
                  : "border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-black">{organization.organizationName}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                    {getOrganizationTypeLabel(organization.organizationType)}
                  </div>
                </div>
                <div className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-200">
                  {getOrganizationRoleLabel(organization.role)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ScopeCard({ scope }: { scope: OAuthScopeDetail }) {
  return (
    <div
      className={`flex items-start gap-4 rounded-3xl border px-5 py-4 ${
        scope.newlyRequested
          ? "border-blue-200 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/10"
          : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70"
      }`}
    >
      <KeyRound
        className={`mt-0.5 h-4 w-4 ${
          scope.newlyRequested ? "text-blue-700 dark:text-blue-300" : "text-slate-400 dark:text-slate-500"
        }`}
      />
      <div className="space-y-1">
        <div className="text-sm font-black text-slate-900 dark:text-slate-100">{scope.label}</div>
        <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
          {scope.id}
        </div>
      </div>
    </div>
  );
}

export function OrganizationApprovalAside({ preview }: { preview: OAuthAuthorizationPreview }) {
  const copy = getOAuthAuthorizeCopy(preview);

  return (
    <aside className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950 p-8 text-white">
      <div className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.35em] text-blue-300">
        <ShieldCheck className="h-4 w-4" />
        {copy.asideEyebrow}
      </div>
      <h2 className="text-3xl font-black tracking-tight">{copy.asideTitle}</h2>
      <div className="space-y-3 text-sm font-bold leading-7 text-slate-300">
        {copy.asideBody.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {preview.existingAuthorization ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm font-bold leading-7 text-slate-300">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">
            {copy.existingAuthorizationEyebrow}
          </div>
          <p className="mt-3">{copy.existingAuthorizationBody}</p>
        </div>
      ) : null}
    </aside>
  );
}
