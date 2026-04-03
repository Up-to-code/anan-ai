import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/app/_components/ThemeToggle";
import WebLocaleSwitcher from "@/app/_components/WebLocaleSwitcher";
import { getWebDictionary } from "@/lib/i18n";
import type { AppLocale } from "@/lib/locale";

export default function Navbar({ locale = "ar" }: { locale?: AppLocale }) {
    const dictionary = getWebDictionary(locale);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-12">
                    <Link
                        href="/"
                        className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 transition hover:border-blue-600 dark:border-slate-800 dark:bg-slate-900"
                        data-analytics-event="web_nav_clicked"
                        data-analytics-location="navbar"
                        data-analytics-href="/"
                    >
                        <Image
                            src="/brand-logo.svg"
                            alt="Anan"
                            width={40}
                            height={40}
                            className="h-10 w-10"
                            priority
                        />
                    </Link>
                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/">{dictionary.nav.home}</Link>
                        <Link href="/developer" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/developer">{dictionary.nav.developer}</Link>
                        <Link href="/broker" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/broker">{dictionary.nav.broker}</Link>
                        <Link href="/about" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/about">{dictionary.nav.about}</Link>
                        <Link href="/contact" className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest dark:text-slate-400 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/contact">{dictionary.nav.contact}</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-8">
                    <WebLocaleSwitcher />
                    <ThemeToggle className="h-10 w-10 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" />
                    <Link href="/signin" className="hidden sm:block text-xs font-bold text-slate-900 uppercase tracking-widest hover:text-blue-600 transition-colors dark:text-slate-100 dark:hover:text-blue-400" data-analytics-event="web_nav_clicked" data-analytics-location="navbar" data-analytics-href="/signin">{dictionary.nav.workspaceSignIn}</Link>
                    <Link
                        href="/signin"
                        className="rounded-lg border-none bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-700 active:scale-95 sm:px-10 sm:text-xs"
                        data-analytics-event="web_primary_cta_clicked"
                        data-analytics-location="navbar"
                        data-analytics-href="/signin"
                    >
                        {dictionary.nav.getStarted}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
