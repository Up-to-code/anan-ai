import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { DEFAULT_LOCALE, addLocalePrefix, getDirection, isSupportedLocale, type Locale } from "./config";

export function useLocale(): {
  locale: Locale;
  direction: "rtl" | "ltr";
  localizePath: (path: string) => string;
} {
  const params = useParams<{ lang?: string }>();
  const location = useLocation();

  const locale = isSupportedLocale(params.lang) ? params.lang : DEFAULT_LOCALE;

  return useMemo(
    () => ({
      locale,
      direction: getDirection(locale),
      localizePath: (path: string) => {
        const target = path.startsWith("/") ? path : `/${path}`;
        return addLocalePrefix(target, locale);
      },
    }),
    [locale, location.pathname],
  );
}
