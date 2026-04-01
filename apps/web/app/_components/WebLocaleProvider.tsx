"use client";

import { createContext, useContext } from "react";
import { getWebDictionary } from "@/lib/i18n";
import { getLocaleDirection, isRtlLocale, type AppLocale } from "@/lib/locale";
import type { WebDictionary } from "@/lib/i18n";

const WebLocaleContext = createContext<{
  locale: AppLocale;
  dictionary: WebDictionary;
  direction: "rtl" | "ltr";
  isRtl: boolean;
} | null>(null);

export function WebLocaleProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: AppLocale;
  dictionary: WebDictionary;
}) {
  const direction = getLocaleDirection(locale);
  const isRtl = isRtlLocale(locale);

  return (
    <WebLocaleContext.Provider value={{ locale, dictionary, direction, isRtl }}>
      {children}
    </WebLocaleContext.Provider>
  );
}

export function useWebLocale() {
  const context = useContext(WebLocaleContext);
  if (!context) {
    const locale: AppLocale = "ar";
    return {
      locale,
      dictionary: getWebDictionary(locale),
      direction: getLocaleDirection(locale),
      isRtl: isRtlLocale(locale),
    };
  }
  return context;
}
