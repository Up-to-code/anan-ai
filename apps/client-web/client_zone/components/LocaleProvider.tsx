"use client";

import { createContext, useContext } from "react";
import type { Locale, LocaleDictionary } from "../lib/types";

type LocaleContextValue = {
  locale: Locale;
  dictionary: LocaleDictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * WHY:   Client components need locale and copy access without repeated prop-drilling across the client surface.
 * WHAT:  Provides the active locale and translated dictionary to descendant components.
 * HOW:   Stores the server-resolved locale state in a React context.
 */
export function LocaleProvider({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: Locale;
  dictionary: LocaleDictionary;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dictionary }}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * WHY:   Client-zone components need one guarded way to access the current locale dictionary.
 * WHAT:  Returns the locale context consumed across the app shell and assistant UI.
 * HOW:   Throws if used outside the provider so integration mistakes fail fast.
 */
export function useLocaleDictionary() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleDictionary must be used within LocaleProvider");
  }
  return context;
}
