import { User, Code2, Briefcase, Globe } from "lucide-react";
import ButtonLink from "@/components/shared/ButtonLink";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

/**
 * WHY:   Trust-building pages should communicate who builds and operates the platform.
 * WHAT:  Renders the Team page with role cards and operating principles.
 * HOW:   Fully server-rendered for speed and SEO.
 */
export default function TeamPage() {
    return (
        <main>
            <Section bg="slate" className="pt-40">
                <PageHero
                    contentClassName="max-w-4xl mx-auto space-y-12 text-right"
                    badge={
                        <SectionLabel
                            icon={Briefcase}
                            className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-600"
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
                        >
                            فريق عنان المؤسسي
                        </SectionLabel>
                    }
                    title={<>الخبرة خلف <br /><span className="text-blue-600">البنية التحتية</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase"
                    description={<p>نجتمع في عنان كمجموعة من المهندسين وخبراء العقار السعوديين لبناء حلول تقنية تغير وجه القطاع في المملكة.</p>}
                    descriptionClassName="text-xl text-slate-500 font-bold leading-relaxed max-w-2xl"
                />
            </Section>

            <Section className="py-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
                    <div className="p-12 border-2 border-slate-100 space-y-8 bg-white hover:border-blue-600 transition-all group">
                        <div className="h-20 w-20 bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <User className="h-10 w-10 text-slate-300 group-hover:text-white" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">الرئيس التنفيذي</h3>
                            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">المدير التنفيذي (CEO)</span>
                            <p className="text-slate-500 font-bold leading-relaxed">قيادة الرؤية الاستراتيجية وتوجيه فريق العمل نحو بناء مستقبل العقار في المملكة.</p>
                        </div>
                    </div>

                    <div className="p-12 border-2 border-slate-100 space-y-8 bg-white hover:border-blue-600 transition-all group">
                        <div className="h-20 w-20 bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Code2 className="h-10 w-10 text-slate-300 group-hover:text-white" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">أحمد منصور</h3>
                            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">المدير التقني (CTO)</span>
                            <p className="text-slate-500 font-bold leading-relaxed">خبرة تزيد عن ١٠ سنوات في بناء الأنظمة الموزعة والذكاء الاصطناعي المؤسسي.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section className="py-24 border-t border-slate-100 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    <h2 className="text-4xl font-black text-slate-900 uppercase">انضم إلى القادة</h2>
                    <p className="font-bold text-slate-500 text-xl leading-relaxed">نبني الجيل القادم من البنية العقارية، ونبحث دائمًا عن العقول الطموحة لمشاركتنا هذه الرحلة.</p>
                    <div className="pt-6">
                        <ButtonLink href="/contact" variant="primary" className="px-10 py-5">
                            ابحث عن وظيفة
                        </ButtonLink>
                    </div>
                </div>
            </Section>
        </main>
    );
}
