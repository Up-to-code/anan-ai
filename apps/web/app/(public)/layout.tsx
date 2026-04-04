import { Footer, Navbar } from "@/app/(public)/public";
import PublicConvexProvider from "@/app/(public)/PublicConvexProvider";
import { cookies } from "next/headers";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
    return (
        <PublicConvexProvider>
            <div
                className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white transition-colors"
                dir={isRtlLocale(locale) ? "rtl" : "ltr"}
            >
                <Navbar locale={locale} />
                {children}
                <Footer locale={locale} />
            </div>
        </PublicConvexProvider>
    );
}
