"use client";

import { AnanThemeProvider } from "@anan/web-foundation/theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <AnanThemeProvider storageKey="anan-admin-theme">{children}</AnanThemeProvider>;
}
