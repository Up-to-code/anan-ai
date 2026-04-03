import { Footer, Navbar } from "@/app/[locale]/(public)/public";
import { getLocaleDirection, type AppLocale } from "@/lib/locale";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;

  return (
    <div
      className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white transition-colors"
      dir={getLocaleDirection(locale)}
    >
      <Navbar />
      {children}
      <Footer locale={locale} />
    </div>
  );
}
