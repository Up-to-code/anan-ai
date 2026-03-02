export type Locale = "ar" | "en" | "fr";

export const SUPPORTED_LOCALES: Locale[] = ["ar", "en", "fr"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isSupportedLocale(value: string | undefined): value is Locale {
  return !!value && SUPPORTED_LOCALES.includes(value as Locale);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (isSupportedLocale(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname;
}

export function addLocalePrefix(pathname: string, locale: Locale): string {
  const stripped = stripLocalePrefix(pathname);
  if (locale === DEFAULT_LOCALE) return stripped;
  return stripped === "/" ? `/${locale}` : `/${locale}${stripped}`;
}
