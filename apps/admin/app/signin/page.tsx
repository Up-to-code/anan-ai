import { ShieldCheck, ShieldX } from "lucide-react";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import LogoutButton from "@/components/auth/LogoutButton";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import { getAuthenticatedSession, sanitizeInternalReturnTo } from "@/lib/serverSession";

type SigninPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

/**
 * WHY:   The admin app needs a dedicated sign-in screen that prevents non-admin access without duplicating auth logic.
 * WHAT:  Renders the admin Google sign-in flow and shows an access-denied state for authenticated non-admin users.
 * HOW:   Resolves the current session on the server, redirects confirmed admins, and preserves safe return targets.
 */
export default async function SigninPage({ searchParams }: SigninPageProps) {
  const [{ returnTo }, session] = await Promise.all([
    searchParams,
    (async () => {
      try {
        return await getAuthenticatedSession();
      } catch (error) {
        if (
          error
          && typeof error === "object"
          && "code" in error
          && error.code === "AUTH_CONFIGURATION_ERROR"
        ) {
          return { token: null, user: null, role: null };
        }
        throw error;
      }
    })(),
  ]);
  const redirectTo = sanitizeInternalReturnTo(returnTo, "/dashboard");

  if (session.token && session.role === "admin") {
    redirect(redirectTo);
  }

  const accessDenied = Boolean(session.token && session.role !== "admin");

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col pt-20" dir="rtl">
      <Section className="flex flex-1 items-center justify-center pb-24">
        <div className="max-w-md w-full">
          <PageHero
            contentClassName="space-y-12 text-center"
            badge={
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-blue-600">
                  {accessDenied ? <ShieldX className="h-8 w-8 text-white" /> : <ShieldCheck className="h-8 w-8 text-white" />}
                </div>
              </div>
            }
            title={accessDenied ? "التحكم الإداري غير متاح لهذا الحساب" : "دخول الإدارة المؤسسية"}
            titleTag="h1"
            titleClassName="text-4xl font-black text-slate-900 uppercase tracking-tight"
            description={
              <p className="text-slate-500 font-bold">
                {accessDenied
                  ? "الحساب الحالي مسجل لكن لا يحمل دور المشرف. يمكنك تسجيل الخروج والدخول بحساب إداري معتمد."
                  : "وصول آمن إلى لوحة تشغيل المنصة لإدارة المستخدمين والمحتوى والعمليات."}
              </p>
            }
            actions={
              <div className="space-y-6">
                {accessDenied ? (
                  <LogoutButton className="w-full flex items-center justify-center gap-4" />
                ) : (
                  <GoogleSignInButton
                    redirectTo={redirectTo}
                    className="w-full flex items-center justify-center gap-4"
                  >
                    الدخول عبر Google
                  </GoogleSignInButton>
                )}

                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  الوصول إلى الإدارة محصور بالمشرفين المعتمدين داخل منصة عنان.
                </p>
              </div>
            }
          />
        </div>
      </Section>
    </main>
  );
}
