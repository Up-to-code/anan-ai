import { PageHero, Section } from "@/app/(public)/public";

export default function InvestorPage() {
    return (
        <main className="overflow-x-hidden min-h-[70vh] flex flex-col justify-center">
            <Section bg="slate" className="py-32">
                <PageHero
                    title={<>صفحة إضافية <br /><span className="text-blue-600">قريباً</span></>}
                    titleClassName="text-6xl md:text-8xl font-black text-slate-900 dark:text-slate-100 leading-[1.1]"
                    description={<p>هذه المساحة ستستخدم لاحقاً لشرح مسارات إضافية داخل عنان. حالياً يتركز التعريف العام على الشركة ومساحات المطورين والوسطاء.</p>}
                    descriptionClassName="text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-bold max-w-2xl mx-auto leading-relaxed"
                />
            </Section>
        </main>
    );
}
