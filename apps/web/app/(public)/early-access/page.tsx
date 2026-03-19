"use client";

import { useState } from "react";
import { User, Building2, Phone, Mail, ChevronDown, CheckCircle2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

/**
 * WHY:   Allow users to express interest before full launch.
 * WHAT:  A landing page to collect early access requests linked to a generic forms database.
 * HOW:   Uses `submitForm` Convex endpoint to push data while showing optimistic UI states.
 */
export default function EarlyAccessPage() {
    const submitForm = useMutation(api.public_zone.forms.submitForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            type: formData.get("type"),
            phone: formData.get("phone"),
            email: formData.get("email"),
        };

        try {
            await submitForm({
                formName: "early-access",
                data,
            });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main>
            <Section bg="slate" className="pt-40">
                <PageHero
                    contentClassName="max-w-4xl mx-auto space-y-12 text-right"
                    badge={
                        <SectionLabel
                            icon={Building2}
                            className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-600"
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
                        >
                            انضم الآن
                        </SectionLabel>
                    }
                    title={<>الوصول <br /><span className="text-blue-600">المبكر</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase leading-[1.1]"
                    description={<p>كن من أوائل المستفيدين من عنان، المنصة العقارية الأحدث التي تغير طريقة التعامل في السوق السعودي.</p>}
                    descriptionClassName="text-xl text-slate-500 font-bold leading-relaxed max-w-2xl"
                />
            </Section>

            <Section className="py-24">
                <div className="max-w-2xl mx-auto">
                    {isSuccess ? (
                        <div className="bg-white border-2 border-green-500 p-12 text-center space-y-6 shadow-sm">
                            <div className="mx-auto w-16 h-16 bg-green-100 flex items-center justify-center rounded-full">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-[1.1]">تم تسجيل طلبك بنجاح!</h2>
                            <p className="text-slate-500 font-bold text-lg">
                                سنتواصل معك قريباً لتزويدك بتفاصيل الوصول المبكر. شكراً لاهتمامك.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white border-2 border-slate-100 p-8 sm:p-12 space-y-8 shadow-sm">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900 leading-[1.1]">سجل اهتمامك</h2>
                                <p className="text-slate-500 font-bold text-sm leading-relaxed">التسجيل المسبق يتيح لك تجربة المنصة قبل الإطلاق الرسمي.</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* الاسم */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-black text-slate-900 uppercase tracking-widest">
                                        الاسم
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-none border-2 border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-slate-900 font-bold placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                                            placeholder="الاسم الكامل"
                                            dir="rtl"
                                        />
                                    </div>
                                </div>

                                {/* الصفة أو التعريف */}
                                <div className="space-y-2">
                                    <label htmlFor="type" className="block text-sm font-black text-slate-900 uppercase tracking-widest">
                                        الصفة أو التعريف
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <Building2 className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <select
                                            id="type"
                                            name="type"
                                            required
                                            defaultValue=""
                                            disabled={isSubmitting}
                                            className="block w-full appearance-none rounded-none border-2 border-slate-200 bg-slate-50 py-3 pr-12 pl-10 text-slate-900 font-bold focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                                            dir="rtl"
                                        >
                                            <option value="" disabled>اختر صفتك...</option>
                                            <option value="investor">مستثمر</option>
                                            <option value="broker">وسيط عقاري</option>
                                            <option value="financial_broker">وسيط تمويلي</option>
                                            <option value="developer">مطور عقاري</option>
                                        </select>
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* رقم الجوال */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-black text-slate-900 uppercase tracking-widest">
                                        رقم الجوال
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            disabled={isSubmitting}
                                            className="block w-full rounded-none border-2 border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-slate-900 font-bold placeholder:text-slate-400 text-left focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                                            placeholder="+966 5X XXX XXXX"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                {/* البريد الإلكتروني (اختياري) */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-black text-slate-900 uppercase tracking-widest flex justify-between">
                                        <span>البريد الإلكتروني</span>
                                        <span className="text-xs text-slate-400 font-bold normal-case">(اختياري)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            disabled={isSubmitting}
                                            className="block w-full rounded-none border-2 border-slate-200 bg-slate-50 py-3 pr-12 pl-4 text-slate-900 font-bold placeholder:text-slate-400 text-left focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                                            placeholder="user@example.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black uppercase text-sm py-4 px-6 tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "جاري الإرسال..." : "طلب انضمام"}
                                    {!isSubmitting && <ChevronDown className="h-4 w-4 rotate-90" />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Section>
        </main>
    );
}
