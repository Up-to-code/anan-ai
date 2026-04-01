"use client";

import { createContext, useContext } from "react";
import { type AppLocale, getLocaleDirection, isRtlLocale } from "@/lib/locale";
import { type Dictionary, getDictionary } from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: AppLocale;
  dictionary: Dictionary;
  direction: "rtl" | "ltr";
  isRtl: boolean;
} | null>(null);

export function LocaleProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: AppLocale;
  dictionary: Dictionary;
}) {
  const direction = getLocaleDirection(locale);
  const isRtl = isRtlLocale(locale);

  return (
    <LocaleContext.Provider value={{ locale, dictionary, direction, isRtl }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    const locale: AppLocale = "ar";
    return {
      locale,
      dictionary: getDictionary(locale),
      direction: getLocaleDirection(locale),
      isRtl: isRtlLocale(locale),
    };
  }
  return context;
}
