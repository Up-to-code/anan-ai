import type { Locale } from "../lib/types";

export const CLIENT_LOCALE_COOKIE = "anan_client_locale";

/**
 * WHY:   The client web app needs one safe locale resolver for cookies, query entry, and server layout defaults.
 * WHAT:  Narrows arbitrary input into a supported locale.
 * HOW:   Falls back to Arabic unless the provided value is the explicit English locale.
 */
export function resolveLocale(input?: string | null): Locale {
  return input === "en" ? "en" : "ar";
}

/**
 * WHY:   Layout primitives need to flip writing direction without duplicating route trees.
 * WHAT:  Returns whether the given locale should render in RTL mode.
 * HOW:   Treats Arabic as RTL and English as LTR.
 */
export function isRtlLocale(locale: Locale) {
  return locale === "ar";
}
