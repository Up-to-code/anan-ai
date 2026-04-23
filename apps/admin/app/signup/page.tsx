import { ShieldCheck } from "lucide-react";
import AdminSignupForm from "@/components/auth/AdminSignupForm";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";

/**
 * WHY:   First-time and invited platform operators need a controlled password account creation surface.
 * WHAT:  Renders the invite/secret-gated admin signup page.
 * HOW:   Keeps the page shell server-rendered and delegates the form submission to the admin signup bridge.
 */
export default function AdminSignupPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col pt-20" dir="rtl">
      <Section className="flex flex-1 items-center justify-center pb-24">
        <div className="max-w-xl w-full">
          <PageHero
            contentClassName="space-y-12 text-center"
            badge={
              <div className="mx-auto flex h-16 w-16 items-center justify-center bg-blue-600">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
            }
            title="إنشاء حساب إدارة"
            titleTag="h1"
            titleClassName="text-4xl font-black text-slate-900 uppercase tracking-tight"
            description={
              <p className="text-slate-500 font-bold">
                التسجيل متاح فقط عبر دعوة إدارة صالحة أو رمز تهيئة موثوق.
              </p>
            }
            actions={<AdminSignupForm />}
          />
        </div>
      </Section>
    </main>
  );
}
