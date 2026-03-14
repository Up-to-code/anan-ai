"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t-2 border-slate-800 pt-32 pb-16 px-6" dir="rtl">
            <div className="max-w-[1400px] mx-auto space-y-32">

                {/* Top Section: Brand (Left) | Links (Right) */}
                <div className="flex flex-col lg:flex-row justify-between gap-24">
                    {/* Brand & Tagline */}
                    <div className="space-y-8 max-w-sm">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="inline-flex items-center justify-center rounded-none border border-slate-700 bg-slate-950 p-3">
                                <Image
                                    src="/brand-mark.svg"
                                    alt="عنان"
                                    width={56}
                                    height={56}
                                    className="h-14 w-14"
                                />
                            </Link>
                            <div className="space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">ANAN</div>
                                <div className="text-sm font-black text-white">البنية العقارية الذكية</div>
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed uppercase tracking-widest">
                            البنية التحتية الذكية للعقار السيادي السعودي. <br />
                            الدقة المهنية في خدمة رؤية ٢٠٣٠.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-24 text-right">
                        <div className="space-y-8">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">المنصة</h4>
                            <ul className="space-y-4">
                                <li><Link href="/developer" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">المطورون</Link></li>
                                <li><Link href="/broker" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">الوسطاء</Link></li>
                                <li><Link href="/about" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">عن عنان</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">المجتمع</h4>
                            <ul className="space-y-4">
                                <li><Link href="/team" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">الفريق</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">تويتر</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">لينكدإن</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.4em]">القانون</h4>
                            <ul className="space-y-4">
                                <li><Link href="/policy" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">الخصوصية</Link></li>
                                <li><Link href="/terms" className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">الشروط</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tagline (Left) | Copyright (Right) */}
                <div className="pt-16 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                        الدقة هي ثمن الريادة في السوق العقاري السعودي.
                    </p>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] transition-opacity hover:opacity-100 opacity-60">
                        © ٢٠٢٥ شركة عنان للحلول الرقمية. جميع الحقوق محفوظة.
                    </p>
                </div>
            </div>
        </footer>
    );
}
