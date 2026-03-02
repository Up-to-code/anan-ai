import { Link } from "react-router-dom";
import { Button } from "@/public_zone/ui/button";
import { useLocale } from "@/shared_logic/i18n/useLocale";
import { t } from "@/shared_logic/i18n/dictionary";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const { locale, localizePath } = useLocale();

  const nav = {
    brokers: locale === "ar" ? "للوسطاء" : locale === "fr" ? "Courtiers" : "For Brokers",
    developers: locale === "ar" ? "للمطورين" : locale === "fr" ? "Promoteurs" : "For Developers",
    contact: locale === "ar" ? "اتصل بنا" : locale === "fr" ? "Contact" : "Contact",
    signIn: locale === "ar" ? "تسجيل الدخول" : locale === "fr" ? "Connexion" : "Sign in",
    rights:
      locale === "ar"
        ? "© ٢٠٢٦ عنان. جميع الحقوق محفوظة."
        : locale === "fr"
          ? "© 2026 Anan. Tous droits réservés."
          : "© 2026 Anan. All rights reserved.",
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-border/5 shadow-sm">
        <nav className="mx-auto flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl">
          <Link
            to={localizePath("/")}
            className="font-bold tracking-tighter text-2xl bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent"
          >
            {t(locale, "brand.name", "عنان")}
          </Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link
                to={localizePath("/brokers")}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {nav.brokers}
              </Link>
              <Link
                to={localizePath("/developers")}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {nav.developers}
              </Link>
              <Link
                to={localizePath("/contact")}
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                {nav.contact}
              </Link>
            </div>
            <Button asChild variant="ghost" className="rounded-full hover:bg-muted font-semibold text-sm">
              <Link to={localizePath("/signin")}>{nav.signIn}</Link>
            </Button>
          </div>
        </nav>
      </header>
      <main className="flex flex-col items-center">{children}</main>
      <footer className="w-full bg-muted/10 py-12 mt-12 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-sm">{nav.rights}</p>
          <div className="flex gap-8 text-sm text-muted-foreground text-right flex-row-reverse">
            <Link to={localizePath("/contact")} className="hover:text-foreground transition-colors">
              {nav.contact}
            </Link>
            <Link to={localizePath("/developers")} className="hover:text-foreground transition-colors">
              {nav.developers}
            </Link>
            <Link to={localizePath("/brokers")} className="hover:text-foreground transition-colors">
              {nav.brokers}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
