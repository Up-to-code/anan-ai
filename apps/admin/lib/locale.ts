import {
  getLocaleNumberFormat,
  isRtlLocale,
  resolveLocale,
  type AppLocale,
} from "@anan/platform-core/locale";

export type AdminLocale = AppLocale;

export const ADMIN_LOCALE_COOKIE = "anan_admin_locale";
export const ADMIN_DATE_TIME_ZONE = "Africa/Cairo";

export { isRtlLocale, resolveLocale };

export function getNumberLocale(locale: AdminLocale) {
  return getLocaleNumberFormat(locale);
}

export function getDateLocale(locale: AdminLocale) {
  return locale === "ar" ? "ar-SA-u-ca-gregory-nu-arab" : locale === "fr" ? "fr-FR" : "en-US";
}
