import { Gavel, LogIn, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import { getAuthenticatedSession, sanitizeInternalReturnTo } from "@/lib/serverSession";

type SigninPageProps = {
  searchParams: Promise<{
    returnTo?: string;
  }>;
};

/**
 * WHY:   The public sign-in route should never render for already-authenticated users.
 * WHAT:  Renders the Google sign-in surface and redirects active sessions to a safe internal destination.
 * HOW:   Resolves auth on the server, sanitizes `returnTo`, and leaves the OAuth button itself as the only client control.
 */
export default async function SigninPage({ searchParams }: SigninPageProps) {
  const [{ returnTo }, session] = await Promise.all([
    searchParams,
    getAuthenticatedSession(),
  ]);
  const redirectTo = sanitizeInternalReturnTo(returnTo, "/ws");

  if (session.token) {
    redirect(redirectTo);
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col pt-20" dir="rtl">
      <Section className="flex flex-1 items-center justify-center pb-24">
        <div className="max-w-md w-full">
          <PageHero
            contentClassName="space-y-12 text-center"
            badge={
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-blue-600">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
              </div>
            }
            title="دخول النظام المؤسسي"
            titleTag="h1"
            titleClassName="text-4xl font-black text-slate-900 uppercase tracking-tight"
            description={
              <p className="text-slate-500 font-bold">
                وصول آمن للمطورين والوسطاء المعتمدين في المملكة العربية السعودية.
              </p>
            }
            descriptionClassName=""
            actions={
              <>
                <div className="space-y-6">
                  <GoogleSignInButton
                    redirectTo={redirectTo}
                    className="w-full flex items-center justify-center gap-4"
                  />

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    بالدخول للنظام، أنت توافق على
                    {" "}
                    <a href="/terms" className="text-blue-600 hover:underline focus-visible:underline">اتفاقية الاستخدام</a>
                    {" "}و{" "}
                    <a href="/policy" className="text-blue-600 hover:underline focus-visible:underline">سياسة الخصوصية</a>
                    {" "}السعودية.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-12 border-t border-slate-100">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تشفير مؤسسي</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Gavel className="h-5 w-5 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">امتثال قانوني</span>
                  </div>
                </div>
              </>
            }
          />
        </div>
      </Section>
    </main>
  );
}
