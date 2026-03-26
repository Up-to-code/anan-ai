import { Minus, MessageCircle, BarChart3, Users2, ChevronRight, Sparkles, Target } from "lucide-react";
import {
  ActionRow,
  ButtonLink,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/(public)/public";
import FadeIn from "./FadeIn";
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vectors/landing/hero_grid.svg" className="h-full w-full object-cover" alt="" />
        </div>

        <FadeIn className="relative z-10 mx-auto max-w-5xl space-y-12">
          <PageHero
            contentClassName="space-y-12"
            badge={
              <div className="flex items-center justify-center gap-4">
                <Minus className="h-6 w-6 text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                  مساحة العمل المشتركة
                </span>
                <Minus className="h-6 w-6 text-blue-600" />
              </div>
            }
            title={<>عنان: مساحة عمل <br /><span className="text-blue-600">للمطورين والوسطاء</span></>}
            titleClassName="text-[clamp(2.5rem,8vw,6.5rem)] font-black uppercase leading-[1.1] tracking-tighter text-slate-900 dark:text-slate-100"
            description={
              <p>
                منصة عامة تعرف بالشركة وتفتح الطريق إلى مساحة العمل. من هنا يفهم المطورون والوسطاء كيف يتعاونون، يتابعون العمليات، ويصلون إلى الأدوات التي يحتاجونها يومياً.
              </p>
            }
            descriptionClassName="mx-auto max-w-2xl border-r-4 border-blue-600 pr-6 text-right text-xl font-bold leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl"
            actions={
              <ActionRow className="flex flex-col items-center justify-center gap-8 pt-6 sm:flex-row">
                <ButtonLink href="/signin" variant="primary" className="px-12 py-5">دخول مساحة العمل</ButtonLink>
                <ButtonLink href="/about" variant="outline" className="border-slate-200 px-12 py-5 dark:border-slate-700">تعرف علينا</ButtonLink>
              </ActionRow>
            }
            visual={<HeroBrandNetworkVisual />}
          />
        </FadeIn>
      </Section>

      <Section id="buyers" border>
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <div className="space-y-12">
            <SectionLabel
              icon={MessageCircle}
              className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              كيف تبدأ
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">رحلة واضحة.. <br /><span className="text-blue-600">من التعريف إلى العمل</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              الصفحة العامة تشرح المنتج، ومساحة العمل تجمع الأدوات الفعلية. يستطيع الزائر فهم ما الذي تقدمه عنان قبل تسجيل الدخول، ثم الانتقال مباشرة إلى بيئة العمل المناسبة له.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
              items={[
                { title: "تعريف سريع", description: "شرح مختصر لدور عنان ومساحة العمل من أول زيارة." },
                { title: "انتقال مباشر", description: "روابط واضحة للمطورين والوسطاء للوصول إلى المساحة المناسبة." },
              ]}
            />
            <ButtonLink href="/signin" variant="dark">
              افتح المساحة <ChevronRight className="h-4 w-4" />
            </ButtonLink>
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
              للمطورين
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-white">مساحة تبقي <br /><span className="text-blue-500">المشروع واضحاً</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-400">
              يحصل فريق التطوير على مكان واحد لمتابعة المشاريع، تنظيم البيانات، التنسيق مع الوسطاء، وفهم ما يحدث داخل سير العمل دون تشتيت بين أدوات كثيرة.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-6 pt-4"
              items={[
                {
                  variant: "dark",
                  title: "رؤية تشغيلية واضحة",
                  description: "عرض منظم للمشاريع، الحالات، والتواصل الداخلي داخل مساحة واحدة.",
                },
              ]}
            />
            <ButtonLink href="/developer" variant="primary">
              اكتشف مساحة المطورين <ChevronRight className="h-4 w-4" />
            </ButtonLink>
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
              textClassName="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100"
            >
              للوسطاء
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">مساحة تساعد <br /><span className="text-blue-600">الوسيط على المتابعة</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              واجهة عمل تدعم الوسيط في تنظيم المتابعة اليومية، مراجعة التفاصيل المهمة، والتواصل مع المطورين من خلال سياق واضح ومركزي.
            </p>
            <FeatureCardGrid
              className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
              items={[
                { title: "متابعة منظمة", description: "العمل اليومي يظهر في مكان واحد بدلاً من المراسلات المتفرقة." },
                { title: "تعاون أوضح", description: "سياق مشترك مع المطورين يساعد على سرعة الفهم واتخاذ الخطوة التالية." },
              ]}
            />
            <ButtonLink href="/broker" variant="dark">
              اكتشف مساحة الوسطاء <ChevronRight className="h-4 w-4" />
            </ButtonLink>
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
              textClassName="text-xs font-black uppercase tracking-widest text-white dark:text-slate-100"
            >
              كيف نعمل
            </SectionLabel>
            <h2 className="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100">فكرة واحدة.. <br /><span className="text-blue-600">تجمع الفريق</span></h2>
            <p className="mx-auto max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              عنان مساحة عمل عامة وواضحة تساعد المطورين والوسطاء على مشاركة السياق نفسه، فهم ما يجري، والانتقال من التعريف بالشركة إلى الاستخدام الفعلي للمنصة.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <ConvergenceFieldVisual />
          </div>

          <div className="grid grid-cols-2 gap-12 pt-20 lg:grid-cols-4">
            {[
              { label: "المطورون", desc: "متابعة المشاريع والفرق" },
              { label: "الوسطاء", desc: "تنظيم العمل اليومي" },
              { label: "العمليات", desc: "وضوح في الخطوات والمسؤوليات" },
              { label: "التوثيق", desc: "فهم أسرع للمنصة" },
            ].map((item, i) => (
              <div key={i} className="group space-y-4 border-2 border-slate-100 p-8 transition-colors hover:border-blue-600 dark:border-slate-800">
                <span className="block text-xl font-black text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-300">{item.label}</span>
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section bg="slate" className="border-t-2 border-slate-100 py-32 dark:border-slate-800">
        <div className="mx-auto max-w-[1400px] space-y-24 text-center">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">بوابة الربط المعتمدة</span>
            <h2 className="text-4xl font-black uppercase text-slate-900 dark:text-slate-100">أساسيات المساحة</h2>
          </div>
          <div className="grid grid-cols-2 items-center gap-12 opacity-40 grayscale transition-all hover:grayscale-0 md:grid-cols-4">
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">WORKSPACE</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">COLLABORATION</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">VISIBILITY</div>
            <div className="flex h-12 items-center justify-center font-black tracking-tighter md:text-xl">DOCS</div>
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
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              لماذا عنان
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">واجهة واضحة <br /><span className="text-blue-600">تفهم العمل اليومي</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              الهدف ليس فقط عرض البيانات، بل ترتيبها بطريقة تجعل المحادثة، المتابعة، والقرارات اليومية أسهل على الفرق التي تستخدم المنصة.
            </p>
            <ButtonLink href="/signin" variant="dark">
              ادخل إلى المساحة <ChevronRight className="h-4 w-4" />
            </ButtonLink>
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
              textClassName="text-xs font-black uppercase tracking-widest text-slate-950 dark:text-slate-100"
            >
              الواجهة العامة
            </SectionLabel>
            <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">موقع يشرح <br /><span className="text-blue-600">ومساحة تنفذ</span></h2>
            <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
              الصفحات العامة تقدم الشركة، والمساحة الداخلية تدعم العمل الفعلي. بهذه الطريقة يبقى التعريف الخارجي بسيطاً بينما يبقى التنفيذ الداخلي مركزاً ومنظماً.
            </p>
            <ButtonLink href="/signin" variant="dark">
              ابدأ الاستخدام <ChevronRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <EcosystemConnectionVisual />
        </div>
      </Section>

      <Section bg="primary" className="relative overflow-hidden border-none py-48 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vectors/landing/anan_landing_cta_texture_v3.svg" className="h-full w-full object-cover" alt="" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl space-y-12">
          <h2 className="text-6xl font-black uppercase leading-tight">جاهز للدخول إلى <br /> مساحة العمل؟</h2>
          <p className="mx-auto max-w-xl text-xl font-bold leading-relaxed opacity-80">
            ابدأ من الصفحة العامة، تعرف على عنان، ثم انتقل إلى المساحة المناسبة لفريقك من المطورين أو الوسطاء.
          </p>
          <ActionRow className="flex flex-col justify-center gap-8 pt-8 sm:flex-row">
            <a
              href="/signin"
              className="inline-flex min-w-[180px] items-center justify-center border border-white bg-white px-10 py-5 text-base font-black tracking-wide text-blue-700 shadow-none transition-colors hover:bg-slate-50 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
            >
              دخول المساحة
            </a>
            <a
              href="/about"
              className="inline-flex min-w-[180px] items-center justify-center border border-white/40 bg-white/8 px-10 py-5 text-base font-black tracking-wide text-white transition-colors hover:bg-white/12"
            >
              اعرف المزيد
            </a>
          </ActionRow>
        </div>
      </Section>
    </main>
  );
}
