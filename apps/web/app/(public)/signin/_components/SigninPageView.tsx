import { Gavel, LogIn, ShieldCheck } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import { PageHero, Section } from "@/app/(public)/public";

const TRUST_SIGNALS = [
  { icon: ShieldCheck, label: "تشفير مؤسسي" },
  { icon: Gavel, label: "شروط واضحة" },
];

type SigninPageViewProps = {
  redirectTo: string;
};

export default function SigninPageView({ redirectTo }: SigninPageViewProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background pt-20 font-sans text-foreground selection:bg-blue-600 selection:text-white transition-colors" dir="rtl">
      <Section className="flex flex-1 items-center justify-center pb-24">
        <div className="w-full max-w-md">
          <PageHero
            contentClassName="space-y-12 text-center"
            badge={(
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_12px_40px_rgba(37,99,235,0.25)]">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            title="دخول مساحة العمل"
            titleTag="h1"
            titleClassName="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100"
            description={(
              <p className="font-bold text-slate-500 dark:text-slate-300">
                وصول آمن إلى مساحة عنان للمطورين والوسطاء.
              </p>
            )}
            descriptionClassName=""
            actions={(
              <>
                <div className="space-y-6">
                  <GoogleSignInButton
                    redirectTo={redirectTo}
                    className="flex w-full items-center justify-center gap-4"
                  />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-slate-400">
                    بالدخول للنظام، أنت توافق على
                    {" "}
                    <a href="/terms" className="text-blue-600 hover:underline focus-visible:underline">اتفاقية الاستخدام</a>
                    {" "}و{" "}
                    <a href="/policy" className="text-blue-600 hover:underline focus-visible:underline">سياسة الخصوصية</a>
                    {" "}الخاصة بالمنصة.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-12 dark:border-slate-800">
                  {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-3">
                      <Icon className="h-5 w-5 text-slate-300 dark:text-slate-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          />
        </div>
      </Section>
    </main>
  );
}
