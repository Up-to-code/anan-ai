"use client";

import { ThemeToggle as SharedThemeToggle } from "@anan/ui/admin";
import { useTheme } from "next-themes";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return <SharedThemeToggle theme={theme} setTheme={setTheme} className={className} />;
}
