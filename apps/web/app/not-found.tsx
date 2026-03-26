import { AlertCircle } from "lucide-react";
import { ButtonLink, Footer, Navbar, Section } from "@/app/(public)/public";

/**
 * WHY:   Missing routes must render quickly and consistently without requiring client hydration.
 * WHAT:  Renders the 404 page with primary navigation and simple recovery CTAs.
 * HOW:   Uses server-rendered Navbar/Footer and `ButtonLink` for navigation.
 */
export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col bg-white font-sans text-slate-900 selection:bg-blue-600 selection:text-white dark:bg-slate-950 dark:text-slate-100" dir="rtl">
            <Navbar />

            <Section className="flex-1 flex items-center justify-center py-48">
                <div className="w-full max-w-2xl space-y-12 text-center">
                    <div className="flex justify-center">
                        <div className="flex h-24 w-24 items-center justify-center border-2 border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                            <AlertCircle className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-8xl font-black uppercase tracking-tighter text-slate-900 dark:text-slate-100">٤٠٤</h1>
                        <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-slate-100">عذراً، الصفحة غير موجودة</h2>
                        <p className="mx-auto max-w-lg text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                            يبدو أنك حاولت الوصول إلى مسار غير معرّف في بنية عنان التحتية الرقمية.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 justify-center pt-6">
                        <ButtonLink href="/" variant="primary">العودة للرئيسية</ButtonLink>
                        <ButtonLink href="/about" variant="outline">تواصل مع الدعم</ButtonLink>
                    </div>
                </div>
            </Section>

            <Footer />
        </main>
    );
}
