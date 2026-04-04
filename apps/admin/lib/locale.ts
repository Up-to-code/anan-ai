export type AdminLocale = "ar" | "en" | "fr";

export const ADMIN_LOCALE_COOKIE = "anan_admin_locale";
export const ADMIN_DATE_TIME_ZONE = "Africa/Cairo";

export function resolveLocale(input?: string | null): AdminLocale {
  return input === "en" || input === "fr" ? input : "ar";
}

export function isRtlLocale(locale: AdminLocale) {
  return locale === "ar";
}

export function getNumberLocale(locale: AdminLocale) {
  return locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-SA";
}

export function getDateLocale(locale: AdminLocale) {
  return locale === "ar" ? "ar-SA-u-ca-gregory-nu-arab" : locale === "fr" ? "fr-FR" : "en-US";
}
