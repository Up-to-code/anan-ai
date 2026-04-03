import type { AppLocale } from "./locale";
import { WEB_SUPPORTED_LOCALES } from "./locale";

export const indexableStaticPaths = [
  "/",
  "/assistant",
  "/developer",
  "/broker",
  "/about",
  "/pricing",
  "/investor",
  "/team",
  "/careers",
  "/faq",
  "/policy",
  "/terms",
  "/contact",
  "/blog",
  "/docs",
  "/docs/getting-started",
  "/docs/oauth/overview",
  "/docs/oauth/authorization-code-pkce",
  "/docs/oauth/get-credentials",
  "/docs/api/properties",
  "/docs/api/clients",
  "/docs/api-keys",
  "/docs/scopes-and-org-permissions",
  "/docs/errors-and-security",
] as const;

function ensureLeadingSlash(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function withLocale(locale: AppLocale, path = "/") {
  const normalized = ensureLeadingSlash(path);
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function stripLocalePrefix(pathname: string) {
  const normalized = ensureLeadingSlash(pathname);
  const segments = normalized.split("/").filter(Boolean);
  const [first, ...rest] = segments;

  if (first && WEB_SUPPORTED_LOCALES.includes(first as AppLocale)) {
    return rest.length ? `/${rest.join("/")}` : "/";
  }

  return normalized;
}

export function swapLocaleInPathname(pathname: string, locale: AppLocale) {
  return withLocale(locale, stripLocalePrefix(pathname));
}

export function buildLocaleAlternates(path: string) {
  return Object.fromEntries(WEB_SUPPORTED_LOCALES.map((locale) => [locale, withLocale(locale, path)])) as Record<
    AppLocale,
    string
  >;
}
