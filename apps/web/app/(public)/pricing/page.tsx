import { PageHero, Section } from "@/app/(public)/public";

export default function PricingPage() {
    return (
        <main className="overflow-x-hidden min-h-[70vh] flex flex-col justify-center">
            <Section bg="slate" className="py-32">
                <PageHero
                    title={<>الباقات <br /><span className="text-blue-600">قريباً</span></>}
                    titleClassName="text-6xl md:text-8xl font-black text-slate-900 dark:text-slate-100 leading-[1.1]"
                    description={<p>سنعرض هنا باقات الاستخدام الخاصة بالمنصة ومساحات العمل عندما تصبح جاهزة للنشر بشكل رسمي.</p>}
                    descriptionClassName="text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-bold max-w-2xl mx-auto leading-relaxed"
                />
            </Section>
        </main>
    );
}
