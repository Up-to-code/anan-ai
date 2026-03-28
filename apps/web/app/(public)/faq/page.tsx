import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { PageHero, Section, SectionLabel } from "@/app/(public)/public";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | عنان",
  description: "إجابات على الأسئلة الشائعة حول عنان، الصفحات العامة، ومساحات العمل المخصصة للمطورين والوسطاء.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "عن عنان",
      items: [
        { q: "ما هي عنان باختصار؟", a: "عنان هي شركة تقدم موقعاً عاماً للتعريف بالمنتج، ومساحة عمل مخصصة للمطورين والوسطاء لمتابعة العمل والتعاون داخل تجربة أوضح." },
        { q: "هل الصفحة العامة هي نفسها مساحة العمل؟", a: "لا. الصفحات العامة تشرح الشركة والمنتج، بينما مساحة العمل هي المكان الذي يدخل إليه المستخدمون لإدارة العمل اليومي داخل المنصة." },
      ]
    },
    {
      category: "للمطورين",
      items: [
        { q: "ماذا يستفيد المطور من عنان؟", a: "توفر له عنان مساحة عمل أوضح لمراجعة المشاريع، تنظيم المعلومات، والتعاون مع الوسطاء من خلال سياق موحد." },
        { q: "هل صفحة المطورين مخصصة للبيع العام؟", a: "لا، هي صفحة تعريفية تشرح قيمة مساحة المطورين وكيف تساعد الفريق على العمل، ثم توجهه إلى تسجيل الدخول." },
      ]
    },
    {
      category: "للوسطاء",
      items: [
        { q: "ماذا تشرح صفحة الوسطاء؟", a: "تشرح كيف تساعد مساحة الوسطاء على تنظيم المتابعة اليومية، فهم السياق، والعمل مع المطورين من خلال واجهة أوضح." },
        { q: "كيف أبدأ؟", a: "يمكنك التعرف على عنان من الصفحة العامة، ثم الانتقال إلى صفحة الوسطاء أو المطورين، وبعد ذلك تسجيل الدخول إلى مساحة العمل." },
      ]
    }
  ];

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="max-w-4xl mx-auto space-y-8 text-center"
          badge={
            <SectionLabel
              icon={HelpCircle}
              className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600 mx-auto"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              دليل الاستخدام السريع
            </SectionLabel>
          }
          title={<>الأسئلة <br /><span className="text-blue-600 text-3xl">الـشائعة والمتكررة</span></>}
          titleClassName="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100"
          description={
            <p className="mx-auto max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              إجابات مختصرة تساعدك على فهم الشركة، الفرق بين الصفحات العامة ومساحة العمل، وكيف تبدأ مع عنان.
            </p>
          }
        />
      </Section>

      <Section className="py-24">
        <div className="max-w-4xl mx-auto space-y-24">
          {faqs.map((group, i) => (
            <div key={i} className="space-y-12">
              <h2 className="border-r-8 border-slate-200 pr-6 text-3xl font-black uppercase text-slate-900 dark:border-slate-700 dark:text-slate-100">
                {group.category}
              </h2>
              <div className="space-y-8">
                {group.items.map((item, j) => (
                  <div key={j} className="border-2 border-slate-100 bg-slate-50 p-8 transition-colors hover:border-blue-600 dark:border-slate-800 dark:bg-slate-900/70">
                    <h3 className="mb-4 text-xl font-black text-slate-900 dark:text-slate-100">{item.q}</h3>
                    <p className="font-bold leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

    </main>
  );
}
