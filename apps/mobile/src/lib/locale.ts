import type { BuyerAssistantLocale } from "@/lib/buyerAssistantShared";

export type MobileLocale = BuyerAssistantLocale;

export function resolveLocale(input?: string | null): MobileLocale {
  return input === "en" || input === "fr" ? input : "ar";
}

export function isRtlLocale(locale: MobileLocale) {
  return locale === "ar";
}

export function getNumberLocale(locale: MobileLocale) {
  return locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-SA";
}
