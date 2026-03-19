import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";

export default function InvestorPage() {
    return (
        <main className="overflow-x-hidden min-h-[70vh] flex flex-col justify-center">
            <Section bg="slate" className="py-32">
                <PageHero
                    title={<>للمستثمرين <br /><span className="text-blue-600">قريباً</span></>}
                    titleClassName="text-6xl md:text-8xl font-black text-slate-900 leading-[1.1]"
                    description={<p>نحن نعمل على تجهيز منصة متكاملة للمستثمرين. شاركنا في قائمة الانتظار لتكون أول من يعلم.</p>}
                    descriptionClassName="text-xl md:text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed"
                />
            </Section>
        </main>
    );
}
