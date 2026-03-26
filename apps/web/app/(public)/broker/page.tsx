import { Users2, Percent, Wallet, Zap } from "lucide-react";
import type { Metadata } from "next";
import {
  ActionRow,
  ButtonLink,
  Card,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/(public)/public";

export const metadata: Metadata = {
  title: "مساحة الوسطاء | عنان",
  description: "تعرف على مساحة الوسطاء في عنان: متابعة أوضح، تعاون أفضل مع المطورين، وتجربة عمل يومية منظمة.",
};

/**
 * WHY:   Brokers need a dedicated public entry page describing collaboration and offers.
 * WHAT:  Renders the broker-focused landing narrative and CTA links.
 * HOW:   SSR-only markup with `ButtonLink` so the page stays low-JS.
 */
export default function BrokerPage() {
    return (
        <main>
            <Section bg="slate">
                <PageHero
                    className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
                    contentClassName="space-y-12 text-right"
                    badge={
                        <SectionLabel
                            icon={Zap}
                            className="inline-flex items-center gap-3 bg-slate-900 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-500"
                            textClassName="text-xs font-black uppercase tracking-widest text-white"
                        >
                            مساحة الوسطاء
                        </SectionLabel>
                    }
                    title={<>مساحة تجعل <br /><span className="text-blue-600">عمل الوسيط أوضح</span></>}
                    titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
                    description={
                        <p>هذه الصفحة تشرح كيف تساعد عنان الوسطاء على متابعة العمل اليومي، الوصول إلى ما يحتاجونه بسرعة، والتنسيق مع المطورين داخل مساحة منظمة.</p>
                    }
                    descriptionClassName="max-w-xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
                    actions={
                        <ActionRow className="flex flex-col sm:flex-row gap-8 pt-6">
                            <ButtonLink href="/signin" variant="dark">دخول مساحة الوسطاء</ButtonLink>
                            <ButtonLink href="/about" variant="outline">اعرف كيف نعمل</ButtonLink>
                        </ActionRow>
                    }
                    visual={
                        <div className="relative border-2 border-slate-100 bg-white p-8 uppercase dark:border-slate-800 dark:bg-slate-950">
                            <div className="space-y-10 border-2 border-slate-100 bg-slate-50 p-10 dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="flex items-center justify-between border-b-2 border-blue-600 bg-white p-8 dark:bg-slate-950">
                                    <div className="flex items-center gap-6">
                                        <div className="flex h-12 w-12 items-center justify-center bg-slate-100 dark:bg-slate-900">
                                            <Users2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black leading-none text-slate-900 dark:text-slate-100">Broker Workspace</span>
                                            <span className="mt-2 block text-[10px] uppercase tracking-tight text-slate-400 dark:text-slate-500">Daily follow-up</span>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-600 flex items-center justify-center font-black text-white text-[10px]">
                                        WS
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex h-12 w-12 items-center justify-center bg-slate-100 dark:bg-slate-900">
                                            <Users2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black leading-none text-slate-900 dark:text-slate-100">Shared Context</span>
                                            <span className="mt-2 block text-[10px] uppercase tracking-tight text-slate-400 dark:text-slate-500">With developers</span>
                                        </div>
                                    </div>
                                </div>
                                <Card
                                    title="المساحة نشطة"
                                    description="واجهة واحدة للمتابعة، التواصل، وفهم ما يحتاجه الوسيط الآن."
                                    variant="accent"
                                />
                            </div>
                        </div>
                    }
                />
            </Section>

            <Section className="space-y-40">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-right">
                    <div className="space-y-10">
                        <div className="h-16 w-16 bg-blue-600/10 flex items-center justify-center mr-auto ml-0">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-5xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100">عمل يومي أقل تعقيداً</h2>
                        <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                            عنان لا تقدم للوسيط صفحة تسويقية فقط، بل تشرح له كيف تبدو المساحة التي تساعده على مراجعة التفاصيل، متابعة الحالات، ومعرفة الخطوة التالية بوضوح.
                        </p>
                        <ButtonLink href="/faq" variant="ghost">كيف تعمل المساحة؟</ButtonLink>
                    </div>
                    <FeatureCardGrid
                        className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                        items={[
                            {
                                icon: Percent,
                                title: "وضوح في المتابعة",
                                description: "المعلومة المهمة تظهر في الواجهة نفسها بدلاً من أن تضيع بين الرسائل والملاحظات.",
                            },
                            {
                                icon: Wallet,
                                title: "تعاون أقرب",
                                description: "الوصول إلى سياق المشروع أو الجهة المرتبطة به يصبح أسرع وأسهل داخل مساحة موحدة.",
                            },
                        ]}
                    />
                </div>
            </Section>

            <Section bg="slate" className="border-y border-slate-100 py-40 dark:border-slate-800">
                <div className="max-w-4xl mx-auto space-y-24 text-right">
                    <div className="space-y-6">
                        <SectionLabel
                            className="inline-flex"
                            textClassName="text-xs font-black text-blue-600 uppercase tracking-widest"
                        >
                            ما الذي تقدمه
                        </SectionLabel>
                        <h2 className="text-4xl font-black uppercase leading-snug text-slate-900 dark:text-slate-100">مساحة الوسطاء <br /> في نقاط بسيطة</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-right">
                        <div className="space-y-6 border-2 border-slate-100 bg-white p-10 dark:border-slate-800 dark:bg-slate-950">
                            <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center font-black text-xl">01</div>
                            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">رؤية أوضح للعمل</h3>
                            <p className="font-bold leading-relaxed text-slate-500 dark:text-slate-300">الواجهة تساعد الوسيط على قراءة الوضع الحالي بسرعة من دون تحميله طبقات زائدة من اللغة التسويقية.</p>
                        </div>
                        <div className="space-y-6 border-2 border-slate-100 bg-white p-10 dark:border-slate-800 dark:bg-slate-950">
                            <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center font-black text-xl">02</div>
                            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">تواصل أسهل مع المطورين</h3>
                            <p className="font-bold leading-relaxed text-slate-500 dark:text-slate-300">المساحة تشرح العلاقة بين الأطراف بشكل عملي يركز على التعاون والفهم المشترك.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section bg="primary" className="py-48 text-center overflow-hidden relative border-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                {/* Gateway SVG background */}
                <div className="absolute -right-20 bottom-0 opacity-10 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/vectors/landing/portal_gateway.svg" className="w-[400px] h-[400px]" alt="" />
                </div>

                <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-white">
                    <h2 className="text-6xl font-black uppercase leading-tight">ادخل إلى مساحة <br /> الوسطاء</h2>
                    <p className="text-xl font-bold opacity-80 max-w-xl mx-auto leading-relaxed">
                        إذا كنت تبحث عن تجربة أبسط وأوضح للعمل اليومي، فهذه الصفحة هي البداية قبل الدخول إلى المساحة.
                    </p>
                    <ActionRow className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                        <ButtonLink href="/signin" variant="white" className="border-none shadow-none px-12 py-5">دخول المساحة</ButtonLink>
                        <ButtonLink href="/terms" variant="outline" className="border-white text-white hover:bg-white/10 px-12 py-5">شروط الاستخدام</ButtonLink>
                    </ActionRow>
                </div>
            </Section>
        </main>
    );
}
