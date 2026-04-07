"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * WHY:   The admin workspace needs one shared theme controller so shell chrome, charts, and CRUD surfaces stay in sync.
 * WHAT:  Wraps `next-themes` with class-based light/dark/system support for the standalone admin app.
 * HOW:   Persists the chosen theme in browser storage, falls back to the system preference, and toggles the root `class`.
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
      storageKey="anan-admin-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
