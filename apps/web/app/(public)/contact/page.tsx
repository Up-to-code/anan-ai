import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";
import { submitContactInquiry } from "./actions";

export const metadata: Metadata = {
  title: "اتصل بنا | عنان",
  description: "تواصل مع فريق عنان للحلول العقارية الذكية. مقرنا الرياض، المملكة العربية السعودية.",
};

type ContactPageProps = {
  searchParams: Promise<{
    submitted?: string;
    error?: string;
  }>;
};

/**
 * WHY:   Partners need a clear, fast way to reach the Anan team from public routes.
 * WHAT:  Renders contact details plus a server-submitted inquiry form.
 * HOW:   Uses a server action for validation/persistence and shows a minimal success/error banner via query params.
 */
export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { submitted, error } = await searchParams;

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="max-w-4xl mx-auto space-y-8"
          badge={
            <SectionLabel
              className="inline-flex"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-600"
            >
              خدمة العملاء المؤسسية
            </SectionLabel>
          }
          title={<>تواصل مع <br /><span className="text-blue-600 text-3xl">فريق عنان</span></>}
          titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
          description={
            <p className="text-xl font-bold leading-relaxed text-slate-500">
              نحن هنا لدعم شركائنا من المطورين والوسطاء لتسريع وتيرة التحول الرقمي العقاري في المملكة العربية السعودية.
            </p>
          }
        />
      </Section>

      <Section className="py-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase border-r-8 border-blue-600 pr-6">
              معلومات الاتصال
            </h2>
            <div className="space-y-8 text-slate-700 font-bold">
              <div className="flex items-start gap-6 border-b border-slate-100 pb-8">
                <div className="h-12 w-12 bg-blue-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">المركز الرئيسي</h3>
                  <p className="mt-2 text-slate-500">طريق الملك فهد، حي الملقا،<br />الرياض، المملكة العربية السعودية</p>
                </div>
              </div>

              <div className="flex items-start gap-6 border-b border-slate-100 pb-8">
                <div className="h-12 w-12 bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">البريد الإلكتروني</h3>
                  <p className="mt-2 text-slate-500">للاستفسارات العامة والمؤسسية</p>
                  <a href="mailto:info@anan.sa" className="mt-1 block text-blue-600 hover:underline">info@anan.sa</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="h-12 w-12 bg-blue-50 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase">الهاتف الموحد</h3>
                  <p className="mt-2 text-slate-500">من الأحد للخميس (٨ ص - ٥ م)</p>
                  <a href="tel:920000000" className="mt-1 block text-blue-600 hover:underline" dir="ltr text-right">9200 00000</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-12 border-2 border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 uppercase mb-8">أرسل استفسارك</h2>
            {submitted === "1" ? (
              <div className="mb-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                تم استلام طلبك بنجاح. سيتواصل الفريق معك قريباً.
              </div>
            ) : null}
            {error === "1" ? (
              <div className="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                تعذر إرسال الطلب الآن. تحقق من البيانات وحاول مرة أخرى.
              </div>
            ) : null}

            <form className="space-y-6" action={submitContactInquiry}>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">الاسم والجهة المؤسسية</label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-white border-2 border-slate-200 px-4 py-3 text-slate-900 font-bold focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="شركة التطوير العقاري المحدودة"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-white border-2 border-slate-200 px-4 py-3 text-slate-900 font-bold focus:border-blue-600 focus:outline-none transition-colors"
                  placeholder="name@company.sa"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500">الرسالة</label>
                <textarea
                  name="message"
                  className="w-full bg-white border-2 border-slate-200 px-4 py-3 text-slate-900 font-bold focus:border-blue-600 focus:outline-none transition-colors min-h-[160px] resize-none"
                  placeholder="تفاصيل الشراكة أو الاستفسار..."
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center bg-blue-600 text-white hover:bg-blue-700 py-4 text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] rounded-none"
              >
                <span className="flex items-center gap-3">إرسال الطلب المستعجل</span>
              </button>
            </form>
          </div>
        </div>
      </Section>
    </main>
  );
}
