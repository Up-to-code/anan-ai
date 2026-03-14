"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-slate-100">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center justify-center rounded-none border-2 border-slate-100 bg-white p-2 transition hover:border-blue-600">
                        <Image
                            src="/brand-mark.svg"
                            alt="عنان"
                            width={40}
                            height={40}
                            className="h-10 w-10"
                            priority
                        />
                    </Link>

                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">الرئيسية</Link>
                        <Link href="/developer" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">المطورون</Link>
                        <Link href="/broker" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">الوسطاء</Link>
                        <Link href="/about" className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">عن عنان</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                    <Link href="/signin" className="hidden sm:block text-xs font-bold text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors">دخول</Link>
                    <Link
                        href="/signin"
                        className="px-6 sm:px-10 py-3 bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-none hover:bg-blue-700 active:scale-95 transition-all border-none"
                    >
                        ابدأ الآن
                    </Link>
                </div>
            </div>
        </nav>
    );
}
