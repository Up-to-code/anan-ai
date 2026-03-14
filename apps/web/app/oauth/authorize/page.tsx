import { ShieldCheck, PlugZap, KeyRound } from "lucide-react";
import { redirect } from "next/navigation";
import ConsentAutoSubmit from "@/components/oauth/ConsentAutoSubmit";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import {
  approveAuthorizationForCurrentUser,
  getAuthorizationPromptForCurrentUser,
} from "@/server/domains/oauth/service";
import { getOptionalSessionContext } from "@/server/auth/session";
import type { OAuthScopeDetail } from "@/server/contracts/oauth";

type AuthorizePageProps = {
  searchParams: Promise<{
    flow?: string;
  }>;
};

/**
 * WHY:   Partner app authorization needs a first-party consent screen tied to the user's Anan session.
 * WHAT:  Renders the app permission prompt and completes or denies the authorization request.
 * HOW:   Uses the Convex Auth Next.js token to load the pending flow, then delegates approval to a server action.
 */
export default async function OAuthAuthorizePage({ searchParams }: AuthorizePageProps) {
  const { flow } = await searchParams;
  const session = await getOptionalSessionContext();

  if (!flow) {
    redirect("/signin");
  }
  if (!session) {
    redirect(`/signin?returnTo=${encodeURIComponent(`/oauth/authorize?flow=${flow}`)}`);
  }

  const preview = await getAuthorizationPromptForCurrentUser(flow);

  if (!preview.requiresConsent && preview.existingAuthorization) {
    const result = await approveAuthorizationForCurrentUser(flow);
    redirect(result.redirectUrl);
  }

  async function approveAuthorization(formData: FormData) {
    "use server";

    const flowId = String(formData.get("flowId") ?? "");
    const currentSession = await getOptionalSessionContext();
    if (!currentSession) {
      redirect(`/signin?returnTo=${encodeURIComponent(`/oauth/authorize?flow=${String(formData.get("flowId") ?? "")}`)}`);
    }

    const result = await approveAuthorizationForCurrentUser(flowId);
    redirect(result.redirectUrl);
  }

  async function denyAuthorization(formData: FormData) {
    "use server";

    const redirectUri = String(formData.get("redirectUri") ?? "");
    const state = String(formData.get("state") ?? "");
    const destination = new URL(redirectUri);
    destination.searchParams.set("error", "access_denied");
    destination.searchParams.set("state", state);
    redirect(destination.toString());
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#eef2ff_100%)] pt-20 text-slate-900">
      <Section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-slate-200 bg-white p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)]">
            <PageHero
              badge={
                <div className="inline-flex items-center gap-3 border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-blue-700">
                  <PlugZap className="h-4 w-4" />
                  Login with Anan
                </div>
              }
              title={`السماح لتطبيق ${preview.client.name}`}
              description={
                <div className="space-y-4 text-sm font-bold leading-7 text-slate-500">
                  <p>الناشر: {preview.client.publisherName}</p>
                  <p>سيتم ربط هذا التطبيق بحسابك في أنان باستخدام صلاحيات محددة فقط.</p>
                </div>
              }
              contentClassName="space-y-8"
              titleClassName="text-4xl font-black tracking-tight text-slate-950"
              descriptionClassName="space-y-3"
            />

            <div className="mt-10 space-y-4">
              {preview.requestedScopes.map((scope: OAuthScopeDetail) => (
                <div
                  key={scope.id}
                  className={`flex items-start gap-4 border px-5 py-4 ${
                    scope.newlyRequested ? "border-blue-200 bg-blue-50/60" : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <KeyRound className={`mt-0.5 h-4 w-4 ${scope.newlyRequested ? "text-blue-700" : "text-slate-400"}`} />
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900">{scope.label}</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">{scope.id}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <ConsentAutoSubmit
                action={approveAuthorization}
                requiresConsent={preview.requiresConsent}
                approveLabel={preview.requiresConsent ? "السماح للتطبيق" : "الاستمرار إلى التطبيق"}
              >
                <input type="hidden" name="flowId" value={preview.flowId} />
              </ConsentAutoSubmit>
              <form action={denyAuthorization}>
                <input type="hidden" name="redirectUri" value={preview.redirectUri} />
                <input type="hidden" name="state" value={preview.state} />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center border border-slate-300 px-6 py-5 text-sm font-black uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50"
                >
                  رفض الطلب
                </button>
              </form>
            </div>
          </div>

          <aside className="space-y-4 border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.55)]">
            <div className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.35em] text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Security Review
            </div>
            <h2 className="text-3xl font-black tracking-tight">ما الذي يراه التطبيق؟</h2>
            <div className="space-y-3 text-sm font-bold leading-7 text-slate-300">
              <p>أنان يرسل فقط الصلاحيات التي توافق عليها في هذه الشاشة.</p>
              <p>يمكنك لاحقاً مراجعة أو إلغاء ربط التطبيق من صفحة الأمان داخل حسابك.</p>
              <p>{preview.offlineAccess ? "هذا التطبيق طلب البقاء متصلاً حتى عند عدم فتحك لأنان." : "هذا التطبيق لن يحتفظ بصلاحية طويلة الأمد بدون طلب جديد."}</p>
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
