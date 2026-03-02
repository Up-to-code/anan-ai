import type { Locale } from "./config";

export const i18nDictionary: Record<Locale, Record<string, string>> = {
  ar: {
    "brand.name": "عنان",
    "nav.overview": "نظرة عامة",
    "nav.projects": "العروض والمشاريع",
    "nav.crm": "إدارة العلاقات (CRM)",
    "nav.organization": "فريق العمل",
    "nav.settings": "الإعدادات",
    "nav.assistant_mode": "وضع Anan-AI",
    "landing.title": "منصة عنان العقارية",
    "landing.subtitle": "بنية تحتية موحدة للمستخدمين والوسطاء والمطورين",
  },
  en: {
    "brand.name": "Anan",
    "nav.overview": "Overview",
    "nav.projects": "Projects & Offers",
    "nav.crm": "CRM",
    "nav.organization": "Organization",
    "nav.settings": "Settings",
    "nav.assistant_mode": "Anan-AI Mode",
    "landing.title": "Anan Real Estate Platform",
    "landing.subtitle": "Unified infrastructure for users, brokers, and developers",
  },
  fr: {
    "brand.name": "Anan",
    "nav.overview": "Vue d'ensemble",
    "nav.projects": "Projets et offres",
    "nav.crm": "CRM",
    "nav.organization": "Organisation",
    "nav.settings": "Paramètres",
    "nav.assistant_mode": "Mode Anan-AI",
    "landing.title": "Plateforme immobilière Anan",
    "landing.subtitle": "Infrastructure unifiée pour utilisateurs, courtiers et promoteurs",
  },
};

export function t(locale: Locale, key: string, fallback: string): string {
  return i18nDictionary[locale][key] ?? fallback;
}
