import { Gavel, LogIn, ShieldCheck } from "lucide-react";
import GoogleSignInButton from "./GoogleSignInButton";
import { PageHero, Section } from "@/app/(public)/public";
import type { AppLocale } from "@/lib/locale";
import { getWebDictionary } from "@/lib/i18n";

type SigninPageViewProps = {
  redirectTo: string;
  locale?: AppLocale;
};

export default function SigninPageView({ redirectTo, locale = "ar" }: SigninPageViewProps) {
  const dictionary = getWebDictionary(locale);
  const trustSignals = [
    { icon: ShieldCheck, label: dictionary.signin.encrypted },
    { icon: Gavel, label: dictionary.signin.clearTerms },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background pt-20 font-sans text-foreground selection:bg-blue-600 selection:text-white transition-colors">
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
            title={dictionary.signin.title}
            titleTag="h1"
            titleClassName="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100"
            description={(
              <p className="font-bold text-slate-500 dark:text-slate-300">
                {dictionary.signin.description}
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
                    {dictionary.signin.agreementPrefix}
                    {" "}
                    <a href="/terms" className="text-blue-600 hover:underline focus-visible:underline">{dictionary.signin.agreementTerms}</a>
                    {" "}{dictionary.signin.agreementAnd}{" "}
                    <a href="/policy" className="text-blue-600 hover:underline focus-visible:underline">{dictionary.signin.agreementPrivacy}</a>
                    {" "}{dictionary.signin.agreementSuffix}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-12 dark:border-slate-800">
                  {trustSignals.map(({ icon: Icon, label }) => (
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
