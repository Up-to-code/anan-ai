"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * WHY:   The web app needs one shared theme controller so public, docs, and workspace shells stay in sync.
 * WHAT:  Wraps `next-themes` with the app's chosen class-based dark-mode configuration.
 * HOW:   Persists the user preference in browser storage, falls back to the system theme, and toggles the `class` attribute.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
