import {
  SUPPORTED_LOCALES,
  formatLocaleDateTime,
  formatLocaleNumber,
  getLocaleDateFormat,
  getLocaleDirection,
  getLocaleLabel,
  getLocaleNumberFormat,
  getNextLocale,
  isRtlLocale,
  resolveLocale,
  type AppLocale,
} from "@anan/platform-core/locale";

export type { AppLocale };

export const WEB_LOCALE_COOKIE = "anan_web_locale";
export const WORKSPACE_LOCALE_COOKIE = "anan_workspace_locale";
export const WEB_SUPPORTED_LOCALES = SUPPORTED_LOCALES;

export {
  formatLocaleDateTime,
  formatLocaleNumber,
  getLocaleDateFormat,
  getLocaleDirection,
  getLocaleLabel,
  getLocaleNumberFormat,
  getNextLocale,
  isRtlLocale,
  resolveLocale,
};
