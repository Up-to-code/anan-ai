import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة | عنان",
  description: "إجابات على أكثر الأسئلة شيوعاً للمطورين، والوسطاء، والمستثمرين حول منصة عنان والبنية التحتية العقارية.",
};

export default function FAQPage() {
  const faqs = [
    {
      category: "للمطورين العقاريين",
      items: [
        { q: "كيف أستطيع إدراج مشروعي الجديد في البنية التحتية لتطبيق عنان؟", a: "يمكن للتطوير العقاري المؤسسي المسجل والموثق رفع مشاريعه بعد توقيع اتفاقية الانضمام لمنصة عنان. النظام يربط الوحدات تلقائياً بآلاف الوسطاء المعتمدين والمشترين المؤهلين فوراً." },
        { q: "ما هي معايير قبول المشاريع العقارية لدى عنان؟", a: "بحسب اشتراطات الهيئة العامة للعقار ولجنة البيع على الخارطة (وافي)، يجب أن تحمل جميع المشاريع رقماً مرجعياً للترخيص، وسجلات تجارية سارية مطابقة لمعايير الامتثال السعودي." },
      ]
    },
    {
      category: "للوسطاء المعتمدين",
      items: [
        { q: "هل التسجيل في شبكة عنان متاح للأفراد؟", a: "في المرحلة الحالية، شبكة الوسطاء مغلقة ومخصصة فقط للكيانات المؤسسية والوسطاء الحاملين لرخصة فال (فال العقارية) لضمان بيئة موثوقة تماماً." },
        { q: "كيف يتم ضمان استحقاق العمولة؟", a: "عبر نظام العقود والارتباط التقني داخل منصة عنان، جميع الصفقات المبرمة تسجل بآلية تضمن للمطابق وللمسوق حقوقهما كاملة، وتتوافق آلياتنا مع التنظيمات المحلية." },
      ]
    },
    {
      category: "للباحثين والمستثمرين",
      items: [
        { q: "هل تعتبر منصة عنان خدمة مجانية للمستثمر النهائي؟", a: "نعم. البنية التحتية لعنان تتيح للمستفيد النهائي البحث عن العقار وطلب التمويل وإجراء المحادثة مع الوكيل الذكي بشكل مجاني تماماً." },
        { q: "ما مدى أمان ودقة معلومات ومخططات الوحدات؟", a: "نطبق معيار \"صفر تضارب\". كافة بيانات العقارات تستمد حصراً من المطورين أو الملاك الرسميين وتم مراجعته رقمياً، لضمان صحة الأسعار وتطابق المساحات." },
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
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
            >
              دليل المعرفة المنظم
            </SectionLabel>
          }
          title={<>الأسئلة <br /><span className="text-blue-600 text-3xl">الـشائعة والمتكررة</span></>}
          titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
          description={
            <p className="max-w-2xl mx-auto text-xl font-bold leading-relaxed text-slate-500">
              دليلك الشامل لآليات عمل منظومة عنان. تصفح الأقسام حسب فئة المستخدم.
            </p>
          }
        />
      </Section>

      <Section className="py-24">
        <div className="max-w-4xl mx-auto space-y-24">
          {faqs.map((group, i) => (
            <div key={i} className="space-y-12">
              <h2 className="text-3xl font-black text-slate-900 uppercase border-r-8 border-slate-200 pr-6">
                {group.category}
              </h2>
              <div className="space-y-8">
                {group.items.map((item, j) => (
                  <div key={j} className="bg-slate-50 p-8 border-2 border-slate-100 hover:border-blue-600 transition-colors">
                    <h3 className="text-xl font-black text-slate-900 mb-4">{item.q}</h3>
                    <p className="text-slate-600 font-bold leading-relaxed">{item.a}</p>
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
