import { PageHero, Section } from "@/app/(public)/public";

export default function CareersPage() {
    return (
        <main className="overflow-x-hidden min-h-[70vh] flex flex-col justify-center">
            <Section bg="slate" className="py-32">
                <PageHero
                    title={<>التوظيف في عنان<br /><span className="text-blue-600">قريباً</span></>}
                    titleClassName="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1]"
                    description={<p>نحن نبحث عن الكفاءات الاستثنائية لِناء مستقبل العقار. ستتوفر الشواغر قريباً.</p>}
                    descriptionClassName="text-xl md:text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed"
                />
            </Section>
        </main>
    );
}
