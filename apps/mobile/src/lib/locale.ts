export type MobileLocale = "ar" | "en";

export function resolveLocale(input?: string | null): MobileLocale {
  return input === "en" ? "en" : "ar";
}

export function isRtlLocale(locale: MobileLocale) {
  return locale === "ar";
}

export function getDirection(locale: MobileLocale): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}

export function getTextAlign(locale: MobileLocale): "right" | "left" {
  return isRtlLocale(locale) ? "right" : "left";
}

export function getNumberLocale(locale: MobileLocale) {
  return locale === "ar" ? "ar-SA" : "en-US";
}

export function getDateLocale(locale: MobileLocale) {
  return locale === "ar" ? "ar-SA" : "en-US";
}
