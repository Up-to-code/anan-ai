"use client";

import { motion } from "framer-motion";
import { Minus, MessageCircle, BarChart3, Users2, ChevronRight, Sparkles, Target } from "lucide-react";
import ActionRow from "@/components/shared/ActionRow";
import Button from "@/components/shared/Button";
import FeatureCardGrid from "@/components/shared/FeatureCardGrid";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";
import {
  AiIntelligenceVisual,
  BrokerNetworkVisual,
  BuyerIntelligenceVisual,
  ConvergenceFieldVisual,
  DeveloperPulseVisual,
  EcosystemConnectionVisual,
  HeroBrandNetworkVisual,
} from "./LandingMotionVisuals";

/**
 * WHY:   The public homepage should explain the Anan platform through branded SVG-led storytelling instead of HTML mockup visuals.
 * WHAT:  Renders the full landing page with centered brand presence, section-specific motion visuals, and SVG-backed textures.
 * HOW:   Preserves the existing content structure while swapping visual columns to local React SVG components and local assets.
 */
export default function LandingPage() {
  return (
    <main>
      <Section bg="slate" className="relative overflow-hidden pt-40 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <img src="/vectors/landing/hero_grid.svg" className="h-full w-full object-cover" alt="" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-5xl space-y-12"
        >
          <PageHero
            contentClassName="space-y-12"
            badge={
              <div className="flex items-center justify-center gap-4">
                <Minus className="h-6 w-6 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  البنية التحتية العقارية في المملكة
                </span>
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
            }
            title={<>عنان: مستقبل <br /><span className="text-blue-600">العقار في السعودية</span></>}
            titleClassName="text-[clamp(2.5rem,8vw,6.5rem)] font-black leading-[1.1] tracking-tighter text-slate-900 uppercase"
            description={
              <p>
                استبدل التعقيد في السوق السعودي بدردشة ذكية موحدة. ابحث عن الفرص، موّل مشاريعك، وأغلق صفقاتك في الرياض وجدة وكافة مدن المملكة فوراً.
              </p>
            }
            descriptionClassName="mx-auto max-w-2xl border-r-4 border-blue-600 pr-6 text-right text-xl font-bold leading-relaxed text-slate-600 md:text-2xl"
            actions={
              <ActionRow className="flex flex-col items-center justify-center gap-8 pt-6 sm:flex-row">
                <Button href="/signin" variant="primary" className="px-12 py-5">ابدأ الوصول المجاني</Button>
                <Button href="/developer" variant="outline" className="border-slate-200 px-12 py-5">استكشف النظام</Button>
              </ActionRow>
            }
            visual={<HeroBrandNetworkVisual />}
          />
        </motion.div>
      </Section>

      <Section id="buyers" border>
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <div className="space-y-12">
            <SectionLabel
              icon={MessageCircle}
              className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
            >
              للمستثمرين في المملكة
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900">دردشة واحدة.. <br /><span className="text-blue-600">لإغلاق صفقة استثمارية</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500">
              سواء كنت تبحث في شمال الرياض أو مشاريع الواجهة البحرية في جدة، وكيلنا الذكي يحلل آلاف الوحدات والتمويلات البنكية المحلية ليعطيك القرار الأفضل.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
              items={[
                { title: "مقارنة فورية", description: "تحليل السوق السعودي والأسعار العادلة في ثوانٍ." },
                { title: "تمويل محلي", description: "ربط مباشر مع برامج التمويل العقاري والمدعوم." },
              ]}
            />
            <Button href="/signin" variant="dark">
              ابدأ البحث الآن <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <BuyerIntelligenceVisual />
        </div>
      </Section>

      <Section bg="dark" id="developers">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <DeveloperPulseVisual />
          <div className="order-1 space-y-12 text-right lg:order-2">
            <SectionLabel
              icon={BarChart3}
              className="inline-flex items-center gap-3 border-r-4 border-blue-500 bg-blue-600/10 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-500"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-400"
            >
              للمطورين العقاريين
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-white">استخبارات <br /><span className="text-blue-500">المشاريع الكبرى</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-400">
              ارفع مشاريعك في بنية عنان التحتية ليتم توزيعها عبر وكلاء الذكاء الاصطناعي للمشترين والمستثمرين في الرياض وجدة والدمام فوراً.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-6 pt-4"
              items={[
                {
                  variant: "dark",
                  title: "رؤية السوق الحية",
                  description: "تعرف على ما يبحث عنه المشترون في المملكة الآن وبدقة متناهية.",
                },
              ]}
            />
            <Button href="/developer" variant="primary">
              وزع مشاريعك الآن <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      <Section id="brokers">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <div className="space-y-12">
            <SectionLabel
              icon={Users2}
              className="inline-flex items-center gap-3 border-r-4 border-slate-900 bg-slate-100 px-4 py-2"
              iconClassName="h-5 w-5 text-slate-900"
              textClassName="text-xs font-black uppercase tracking-widest text-slate-900"
            >
              للوسطاء الموثقين
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900">شبكة الربط <br /><span className="text-blue-600">بين وسطاء المملكة</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500">
              منصة الربط الموحدة للوسطاء العقاريين المسجلين في الهيئة العامة للعقار. شارك العروض والطلبات وأغلق صفقاتك بضمان وحماية حقوقك.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
              items={[
                { title: "ضمان العمولة", description: "نظام تقني وقانوني يضمن حقوقك في الصفقات المشتركة." },
                { title: "ربط فوري", description: "مطابقة طلبات عملائك مع آلاف العروض الموثقة فوراً." },
              ]}
            />
            <Button href="/broker" variant="dark">
              انضم للشبكة <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <BrokerNetworkVisual />
        </div>
      </Section>

      <Section bg="white" id="convergence" className="py-40">
        <div className="mx-auto max-w-[1400px] space-y-24 text-center">
          <div className="space-y-6">
            <SectionLabel
              icon={Target}
              className="mx-auto inline-flex items-center gap-3 border-r-4 border-blue-600 bg-slate-900 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-500"
              textClassName="text-xs font-black uppercase tracking-widest text-white"
            >
              نقطة التقاء السوق السعودي
            </SectionLabel>
            <h2 className="text-6xl font-black uppercase leading-tight text-slate-900">فكرة واحدة.. <br /><span className="text-blue-600">تربط الجميع</span></h2>
            <p className="mx-auto max-w-2xl text-xl font-bold leading-relaxed text-slate-500">
              عنان هي المحور الذي يلتقي فيه المطور، الوسيط، والمستثمر. كل نقاط السوق السعودي تتصل هنا لتشكل حجر الزاوية في مستقبلك العقاري.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <ConvergenceFieldVisual />
          </div>

          <div className="grid grid-cols-2 gap-12 pt-20 lg:grid-cols-4">
            {[
              { label: "المطورون", desc: "توزيع المشاريع الكبرى" },
              { label: "الوسطاء", desc: "ربط الصفقات الموثقة" },
              { label: "المستثمرون", desc: "فرص عادلة وحية" },
              { label: "البنوك", desc: "تمويل سيادي فوري" },
            ].map((item, i) => (
              <div key={i} className="group space-y-4 border-2 border-slate-100 p-8 transition-colors hover:border-blue-600">
                <span className="block text-xl font-black text-slate-900 group-hover:text-blue-600">{item.label}</span>
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section bg="slate" className="border-t-2 border-slate-100 py-32">
        <div className="mx-auto max-w-[1400px] space-y-24 text-center">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">بوابة الربط المعتمدة</span>
            <h2 className="text-4xl font-black uppercase text-slate-900">شركاء البنية التحتية</h2>
          </div>
          <div className="grid grid-cols-2 items-center gap-12 opacity-40 grayscale transition-all hover:grayscale-0 md:grid-cols-4">
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">SAMA_COMPLIANT</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">GARE_REGESTERED</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">MUNICIPAL_TECH</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">ZATCA_BILLING</div>
          </div>
        </div>
      </Section>

      <Section bg="white" id="ai-intelligence" border>
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <AiIntelligenceVisual />
          <div className="space-y-12 text-right">
            <SectionLabel
              icon={Sparkles}
              className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
            >
              ذكاء عنان الخارق
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900">ذكاء اصطناعي <br /><span className="text-blue-600">يفهم لغة العقار</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500">
              نظامنا يعالج ملايين البيانات العقارية في المملكة لحظياً ليقدم لك أصدق التوقعات وأدق التحليلات لصفقاتك.
            </p>
            <Button href="/signin" variant="dark">
              جرب المحرك الآن <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      <Section bg="slate" id="ecosystem-connection">
        <div className="grid grid-cols-1 items-center gap-24 text-right lg:grid-cols-2">
          <div className="space-y-12">
            <SectionLabel
              icon={Users2}
              className="inline-flex items-center gap-3 border-r-4 border-slate-950 bg-slate-200 px-4 py-2"
              iconClassName="h-5 w-5 text-slate-950"
              textClassName="text-xs font-black uppercase tracking-widest text-slate-950"
            >
              شبكة الربط المؤسسي
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900">منصة الربط <br /><span className="text-blue-600">الأقوى في المملكة</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500">
              نربط المطورين بالوسطاء والممولين في بيئة تقنية مؤسسية تضمن الشفافية والسرعة في التنفيذ.
            </p>
            <Button href="/signin" variant="dark">
              انضم للمنظومة <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <EcosystemConnectionVisual />
        </div>
      </Section>

      <Section bg="primary" className="relative overflow-hidden border-none py-48 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <img src="/vectors/landing/anan_landing_cta_texture_v3.svg" className="h-full w-full object-cover" alt="" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl space-y-12">
          <h2 className="text-6xl font-black uppercase leading-tight">جاهز لإغلاق صفقتك <br /> القادمة في الرياض؟</h2>
          <p className="mx-auto max-w-xl text-xl font-bold leading-relaxed opacity-80">
            انضم إلى مئات المطورين والوسطاء الذين يستخدمون بنية عنان التحتية يومياً للوصول إلى السوق السعودي الحقيقي.
          </p>
          <ActionRow className="flex flex-col justify-center gap-8 pt-8 sm:flex-row">
            <a
              href="/signin"
              className="inline-flex min-w-[180px] items-center justify-center border border-white bg-white px-10 py-5 text-base font-black tracking-wide text-blue-700 shadow-none transition-colors hover:bg-slate-50"
            >
              ابدأ الآن مجاناً
            </a>
            <a
              href="/about"
              className="inline-flex min-w-[180px] items-center justify-center border border-white/40 bg-white/8 px-10 py-5 text-base font-black tracking-wide text-white transition-colors hover:bg-white/12"
            >
              تواصل مع الشركاء
            </a>
          </ActionRow>
        </div>
      </Section>
    </main>
  );
}
