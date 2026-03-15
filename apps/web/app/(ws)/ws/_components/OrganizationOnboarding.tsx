import { ArrowRight, Building, Building2 } from "lucide-react";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/serverSession";
import PageHeader from "@/components/shared/PageHeader";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { normalizeDomainError } from "@/server/contracts/errors";
import { createOrganizationForCurrentUser } from "@/server/domains/organizations/service";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import OrganizationInvitesClient from "./OrganizationInvitesClient";

type OrganizationOnboardingProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites?: IncomingOrganizationInvite[];
  errorMessage?: string;
};

/**
 * WHY:   New workspace users need a single onboarding surface for invites and org creation.
 * WHAT:  Renders incoming invites (if any) plus a broker/developer organization setup form.
 * HOW:   Delegates invite actions to a client subcomponent and submits create-org via server action.
 */
export default function OrganizationOnboarding({
  user,
  suggestedOrganizationType,
  audience,
  incomingInvites = [],
  errorMessage,
}: OrganizationOnboardingProps) {
  async function createOrganization(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const rawType = String(formData.get("type") ?? suggestedOrganizationType);
    const type = rawType === "broker" || rawType === "red" ? rawType : suggestedOrganizationType;

    try {
      await createOrganizationForCurrentUser({ name, type });
      redirect("/ws");
    } catch (error) {
      const domainError = normalizeDomainError(error);
      const message = domainError.message.slice(0, 120) || "تعذر إنشاء الجهة حالياً";
      redirect(`/ws?orgError=${encodeURIComponent(message)}`);
    }
  }

  const suggestedTypeLabel = suggestedOrganizationType === "red" ? "مطور عقاري" : "وسيط عقاري";
  const inferredLabel = "مساحة العمل المختارة";
  const inferredDescription =
    audience === "developer"
      ? "اختر جهة مطور لتفعيل إدارة المشاريع والعروض والتعاون."
      : audience === "broker"
        ? "اختر جهة وسيط لتفعيل إدارة العملاء والعروض والتعاون."
        : "اختر نوع الجهة لتفعيل الأدوات المناسبة داخل مساحة العمل.";
  const inviteStrings = {
    eyebrow: "Incoming Invites",
    title: "دعوات الانضمام",
    description: "لديك دعوات جاهزة. اختر الانضمام لجهة حالية أو تجاهلها لإنشاء جهة جديدة.",
    acceptLabel: "قبول الدعوة",
    declineLabel: "رفض الدعوة",
    brokerTypeLabel: "وسيط عقاري",
    developerTypeLabel: "مطور عقاري",
    inviterPrefix: "دعوة من",
    acceptError: "تعذر قبول الدعوة حالياً.",
    declineError: "تعذر رفض الدعوة حالياً.",
  };

  return (
    <div className="flex flex-col">
      <div className="border-b-2 border-slate-100 px-6 pt-6 lg:px-10 lg:pt-10">
        <PageHeader
          eyebrow="Workspace Setup"
          title="أنشئ جهتك الأولى"
          description={
            <>
              {user.name ? `${user.name}،` : "مرحباً،"} اربط حسابك بجهة واحدة على الأقل لتبدأ العمل.
            </>
          }
        />
      </div>

      <div className="space-y-8 p-6 lg:p-10">
        <div className="mx-auto grid max-w-7xl gap-12 items-start lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            {incomingInvites.length > 0 ? (
              <OrganizationInvitesClient invites={incomingInvites} strings={inviteStrings} />
            ) : null}
            <WorkspacePanel className="border-slate-200">
              <form action={createOrganization} className="space-y-8">
                <div className="flex flex-row flex-wrap items-center gap-4">
                  <label htmlFor="organization-name" className="shrink-0 text-xs font-black uppercase tracking-widest text-slate-500">
                    اسم الجهة
                  </label>
                  <input
                    id="organization-name"
                    name="name"
                    type="text"
                    required
                    placeholder="مثال: مؤسسة أنان العقارية"
                    className="min-w-0 flex-1 max-w-[420px] border-2 border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">نوع الجهة</div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 border-2 border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-800 transition hover:border-blue-400">
                      <input
                        type="radio"
                        name="type"
                        value="broker"
                        defaultChecked={suggestedOrganizationType === "broker"}
                        className="mt-1 accent-blue-600"
                      />
                      <span className="space-y-1">
                        <span className="block text-sm font-black text-slate-900">وسيط عقاري</span>
                        <span className="block text-xs text-slate-500">
                          إدارة العملاء والعروض والتعاون مع المطورين.
                        </span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 border-2 border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-800 transition hover:border-blue-400">
                      <input
                        type="radio"
                        name="type"
                        value="red"
                        defaultChecked={suggestedOrganizationType === "red"}
                        className="mt-1 accent-blue-600"
                      />
                      <span className="space-y-1">
                        <span className="block text-sm font-black text-slate-900">مطور عقاري</span>
                        <span className="block text-xs text-slate-500">
                          إدارة المشاريع والعروض وربط الوسطاء.
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="text-xs font-bold text-slate-400">
                    الاقتراح: {suggestedTypeLabel}
                  </div>
                </div>

                <div className="border-2 border-slate-100 bg-slate-50 p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-4 text-right">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Workspace Mode</div>
                      <h2 className="text-2xl font-black text-slate-950">{inferredLabel}</h2>
                      <p className="max-w-2xl text-sm font-bold leading-relaxed text-slate-500">{inferredDescription}</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center bg-blue-50">
                      {suggestedOrganizationType === "red" ? (
                        <Building className="h-8 w-8 text-blue-600" />
                      ) : (
                        <Building2 className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-8 inline-flex items-center gap-2 border-2 border-blue-700 bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:border-blue-800 hover:bg-blue-700"
                  >
                    إنشاء الجهة الآن
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {errorMessage ? (
                  <div className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                    {errorMessage}
                  </div>
                ) : null}
              </form>
            </WorkspacePanel>
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <div className="rounded-none border-2 border-slate-800 bg-[#0a0f1d] p-6" style={{ backgroundColor: "#0a0f1d" }}>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-400">
                <span className="flex h-2 w-2 rounded-none bg-blue-500" />
                Feature Preview
              </div>
              <h2 className="mt-5 text-2xl font-black text-white">ما الذي سيتفعّل؟</h2>
              <div className="mt-6 space-y-5">
                {[
                  "لوحة العمل الموحدة على مسار /ws",
                  "أدوات إدارة الفريق والصلاحيات",
                  "قسم حسابي والأمان المتقدم",
                  `تفعيل ${inferredLabel} بشكل تلقائي`,
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-none bg-slate-700" />
                    <span className="text-sm font-bold text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 px-2">
              <p className="text-xs font-bold leading-relaxed text-slate-400">
                أعمالك العقارية تبدأ من هنا. اختر نوع الجهة المناسب لاتاحة الأدوات المخصصة لنشاطك.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
