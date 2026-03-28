import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero, Section, SectionLabel } from "@/app/(public)/public";
import { submitContactInquiry } from "./actions";

export const metadata: Metadata = {
  title: "اتصل بنا | عنان",
  description: "تواصل مع فريق عنان لمعرفة المزيد عن الشركة ومساحة العمل المخصصة للمطورين والوسطاء.",
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
              تواصل مع عنان
            </SectionLabel>
          }
          title={<>تواصل مع <br /><span className="text-blue-600 text-3xl">فريق عنان</span></>}
          titleClassName="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100"
          description={
            <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              إذا كنت تريد فهم المنتج، استكشاف مساحة العمل، أو التحدث مع الفريق حول استخدام عنان داخل شركتك، فهذه هي نقطة التواصل المناسبة.
            </p>
          }
        />
      </Section>

      <Section className="py-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <h2 className="border-r-8 border-blue-600 pr-6 text-3xl font-black uppercase text-slate-900 dark:text-slate-100">
              معلومات الاتصال
            </h2>
            <div className="space-y-8 font-bold text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-6 border-b border-slate-100 pb-8 dark:border-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">المركز الرئيسي</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">نعمل مع فرقنا وشركائنا عبر مساحة العمل الرقمية وقنوات التواصل المباشر مع الفريق.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 border-b border-slate-100 pb-8 dark:border-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">البريد الإلكتروني</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">للاستفسارات العامة، التعريف بالمنتج، وطلبات التواصل</p>
                  <a href="mailto:info@anan.sa" className="mt-1 block text-blue-600 hover:underline">info@anan.sa</a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">الهاتف الموحد</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">للتواصل السريع وترتيب المحادثات التعريفية</p>
                  <a href="tel:920000000" className="mt-1 block text-blue-600 hover:underline" dir="ltr text-right">9200 00000</a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-100 bg-slate-50 p-12 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="mb-8 text-2xl font-black uppercase text-slate-900 dark:text-slate-100">أرسل استفسارك</h2>
            {submitted === "1" ? (
              <div className="mb-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                تم استلام طلبك بنجاح. سيتواصل الفريق معك قريباً.
              </div>
            ) : null}
            {error === "1" ? (
              <div className="mb-6 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                تعذر إرسال الطلب الآن. تحقق من البيانات وحاول مرة أخرى.
              </div>
            ) : null}

            <form className="space-y-6" action={submitContactInquiry}>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">الاسم والجهة المؤسسية</label>
                <input
                  type="text"
                  name="name"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
                  placeholder="اسمك أو اسم الجهة"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
                  placeholder="name@company.sa"
                  required
                />
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">الرسالة</label>
                <textarea
                  name="message"
                  className="min-h-[160px] w-full resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400"
                  placeholder="كيف يمكننا مساعدتك؟"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">إرسال الرسالة</span>
              </button>
            </form>
          </div>
        </div>
      </Section>
    </main>
  );
}
