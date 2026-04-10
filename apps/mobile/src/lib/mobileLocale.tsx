"use client";

import React, { createContext, useContext, useMemo } from "react";
import { getMobileDictionary, type MobileDictionary } from "@/lib/i18n";
import { getDirection, getTextAlign, isRtlLocale, type MobileLocale } from "@/lib/locale";

const MobileLocaleContext = createContext<{
  locale: MobileLocale;
  dictionary: MobileDictionary;
  direction: "rtl" | "ltr";
  textAlign: "right" | "left";
  isRtl: boolean;
} | null>(null);

export function MobileLocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: MobileLocale;
}) {
  const value = useMemo(
    () => ({
      locale,
      dictionary: getMobileDictionary(locale),
      direction: getDirection(locale),
      textAlign: getTextAlign(locale),
      isRtl: isRtlLocale(locale),
    }),
    [locale],
  );

  return <MobileLocaleContext.Provider value={value}>{children}</MobileLocaleContext.Provider>;
}

export function useMobileLocale() {
  try {
    const context = useContext(MobileLocaleContext);
    if (context) return context;
  } catch {
    // Some unit tests materialize components as plain functions outside a React render tree.
    // Fall back to Arabic defaults instead of throwing on useContext there.
  }

  const locale: MobileLocale = "ar";
  return {
    locale,
    dictionary: getMobileDictionary(locale),
    direction: getDirection(locale),
    textAlign: getTextAlign(locale),
    isRtl: isRtlLocale(locale),
  };
}
