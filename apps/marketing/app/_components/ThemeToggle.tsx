"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useWebLocale } from "./WebLocaleProvider";

/**
 * WHY:   Users need a quick, visible control for switching between light and dark appearance anywhere in the web app.
 * WHAT:  Renders a compact toggle button that flips the persisted theme between light and dark.
 * HOW:   Reads the resolved theme from `next-themes`, avoids hydration mismatch by waiting for mount, and keeps one stable button markup.
 */
export default function ThemeToggle({
  className,
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const { dictionary } = useWebLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? resolvedTheme ?? "light" : "light";
  const isDark = activeTheme === "dark";

  return (
    <button
      type="button"
      data-slot="theme-toggle"
      aria-label={isDark ? dictionary.nav.activateLightMode : dictionary.nav.activateDarkMode}
      title={isDark ? dictionary.nav.activateLightMode : dictionary.nav.activateDarkMode}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-background text-foreground shadow-sm transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={cn(
            "absolute h-5 w-5 transition-all duration-200",
            isDark ? "scale-0 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute h-5 w-5 transition-all duration-200",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-45 opacity-0",
          )}
        />
      </span>
    </button>
  );
}
