"use client";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Section from "@/components/shared/Section";
import Button from "@/components/shared/Button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col" dir="rtl">
            <Navbar />

            <Section className="flex-1 flex items-center justify-center py-48">
                <div className="max-w-2xl w-full text-center space-y-12">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 bg-slate-50 border-2 border-slate-100 flex items-center justify-center">
                            <AlertCircle className="h-12 w-12 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-8xl font-black text-slate-900 uppercase tracking-tighter">٤٠٤</h1>
                        <h2 className="text-3xl font-black text-slate-900 uppercase">عذراً، الصفحة غير موجودة</h2>
                        <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-lg mx-auto">
                            يبدو أنك حاولت الوصول إلى مسار غير معرّف في بنية عنان التحتية الرقمية.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 justify-center pt-6">
                        <Button href="/" variant="primary">العودة للرئيسية</Button>
                        <Button href="/about" variant="outline">تواصل مع الدعم</Button>
                    </div>
                </div>
            </Section>

            <Footer />
        </main>
    );
}
