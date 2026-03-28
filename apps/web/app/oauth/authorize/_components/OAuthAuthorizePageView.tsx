import { KeyRound, PlugZap, ShieldCheck } from "lucide-react";
import ConsentAutoSubmit from "./ConsentAutoSubmit";
import { PageHero, Section } from "@/app/(public)/public";
import type { OAuthScopeDetail } from "@/server/contracts/oauth";
import type { OAuthAuthorizationPreview } from "../loaders";

type OAuthAuthorizePageViewProps = {
  preview: OAuthAuthorizationPreview;
  onApprove: (formData: FormData) => void | Promise<void>;
  onDeny: (formData: FormData) => void | Promise<void>;
};

export default function OAuthAuthorizePageView({
  preview,
  onApprove,
  onDeny,
}: OAuthAuthorizePageViewProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#eef2ff_100%)] pt-20 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] dark:text-slate-100">
      <Section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border-2 border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
            <PageHero
              badge={(
                <div className="inline-flex items-center gap-3 border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                  <PlugZap className="h-4 w-4" />
                  Login with Anan
                </div>
              )}
              title={`السماح لتطبيق ${preview.client.name}`}
              description={(
                <div className="space-y-4 text-sm font-bold leading-7 text-slate-500 dark:text-slate-300">
                  <p>الناشر: {preview.client.publisherName}</p>
                  <p>سيتم ربط هذا التطبيق بحسابك في عنان باستخدام صلاحيات محددة فقط.</p>
                </div>
              )}
              contentClassName="space-y-8"
              titleClassName="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-100"
              descriptionClassName="space-y-3"
            />

            <div className="mt-10 space-y-4">
              {preview.requestedScopes.map((scope: OAuthScopeDetail) => (
                <div
                  key={scope.id}
                  className={`flex items-start gap-4 border px-5 py-4 ${
                    scope.newlyRequested ? "border-blue-200 bg-blue-50/60 dark:border-blue-500/30 dark:bg-blue-500/10" : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/70"
                  }`}
                >
                  <KeyRound className={`mt-0.5 h-4 w-4 ${scope.newlyRequested ? "text-blue-700 dark:text-blue-300" : "text-slate-400 dark:text-slate-500"}`} />
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100">{scope.label}</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{scope.id}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <ConsentAutoSubmit
                action={onApprove}
                requiresConsent={preview.requiresConsent}
                approveLabel={preview.requiresConsent ? "السماح للتطبيق" : "الاستمرار إلى التطبيق"}
              >
                <input type="hidden" name="flowId" value={preview.flowId} />
              </ConsentAutoSubmit>
              <form action={onDeny}>
                <input type="hidden" name="flowId" value={preview.flowId} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center border border-slate-300 px-6 py-5 text-sm font-black uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  رفض الطلب
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-4 border-2 border-slate-200 bg-slate-950 p-8 text-white">
            <div className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.35em] text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Security Review
            </div>
            <h2 className="text-3xl font-black tracking-tight">ما الذي يراه التطبيق؟</h2>
            <div className="space-y-3 text-sm font-bold leading-7 text-slate-300">
              <p>عنان يرسل فقط الصلاحيات التي توافق عليها في هذه الشاشة.</p>
              <p>يمكنك لاحقاً مراجعة أو إلغاء ربط التطبيق من صفحة الأمان داخل حسابك.</p>
              <p>{preview.offlineAccess ? "هذا التطبيق طلب البقاء متصلاً حتى عند عدم فتحك لعنان." : "هذا التطبيق لن يحتفظ بصلاحية طويلة الأمد بدون طلب جديد."}</p>
            </div>
            {preview.existingAuthorization ? (
              <div className="border border-white/10 bg-white/5 p-5 text-sm font-bold leading-7 text-slate-300">
                <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">Authorization History</div>
                <p className="mt-3">تم منح التطبيق صلاحيات سابقة من هذا الحساب، وسيتم طلب موافقتك فقط عند زيادة النطاقات أو إعادة الربط.</p>
              </div>
            ) : null}
          </aside>
        </div>
      </Section>
    </main>
  );
}
