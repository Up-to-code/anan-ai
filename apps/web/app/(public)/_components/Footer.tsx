import Link from "next/link";
import Image from "next/image";

/**
 * WHY:   Public pages need a consistent footer that stays SSR-only for performance and stability.
 * WHAT:  Renders the brand block, link columns, and legal/copyright line.
 * HOW:   Static markup using Next.js `Link`/`Image` only.
 */
export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-24 pb-12 px-6" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-24">

                {/* Top Section: Brand (Left) | Links (Right) */}
                <div className="flex flex-col lg:flex-row justify-between gap-16">
                    {/* Brand & Tagline */}
                    <div className="space-y-6 max-w-sm">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="inline-block">
                                <Image
                                    src="/brand-logo.svg"
                                    alt="عنان"
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 brightness-0 invert"
                                />
                            </Link>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">ANAN</div>
                                <div className="text-sm font-black text-white leading-[1.1]">البنية العقارية الذكية</div>
                            </div>
                        </div>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed max-w-xs">
                            البنية التحتية الذكية للعقار السيادي السعودي. الدقة المهنية في خدمة التقنية.
                        </p>
                    </div>

                    {/* Link Columns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-right">
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">المنصة</h4>
                            <ul className="space-y-3">
                                <li><Link href="/developer" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">المطورون</Link></li>
                                <li><Link href="/broker" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الوسطاء</Link></li>
                                <li><Link href="/investor" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">المستثمرون</Link></li>
                                <li><Link href="/pricing" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الباقات</Link></li>
                                <li><Link href="/partnerships" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الشراكات</Link></li>
                                <li><Link href="/about" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">عن عنان</Link></li>
                                <li><Link href="/contact" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">اتصل بنا</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">المجتمع</h4>
                            <ul className="space-y-3">
                                <li><Link href="/team" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الفريق</Link></li>
                                <li><Link href="/careers" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">التوظيف</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">تويتر</Link></li>
                                <li><Link href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">لينكدإن</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest">القانون</h4>
                            <ul className="space-y-3">
                                <li><Link href="/policy" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الخصوصية</Link></li>
                                <li><Link href="/terms" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الشروط</Link></li>
                                <li><Link href="/faq" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
                                <li><Link href="/blog" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">المدونة</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Tagline (Left) | Copyright (Right) */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        الدقة هي ثمن الريادة في السوق العقاري السعودي.
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-60 transition-opacity hover:opacity-100 dark:text-slate-400">
                        © ٢٠٢٥ شركة عنان للحلول الرقمية. جميع الحقوق محفوظة.
                    </p>
                </div>
            </div>
        </footer>
    );
}
