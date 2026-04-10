"use client";

import { useEffect, useState } from "react";
import { LaptopMinimal, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeOption = "light" | "system" | "dark";

const themeOptions: Array<{
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "system", label: "النظام", icon: LaptopMinimal },
  { value: "dark", label: "داكن", icon: Moon },
];

/**
 * WHY:   Operators need a reliable appearance control because the admin workspace is used across bright offices and low-light monitoring sessions.
 * WHAT:  Renders a compact segmented theme switcher for light, system, and dark modes.
 * HOW:   Waits for mount to avoid hydration mismatch, then reads and updates the persisted theme via `next-themes`.
 */
export default function ThemeToggle({
  className,
}: {
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted && (theme === "light" || theme === "dark" || theme === "system") ? theme : "system";

  return (
    <div
      data-slot="theme-toggle"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-[color:color-mix(in_srgb,var(--workspace-border)_92%,transparent)] bg-[var(--workspace-panel)] p-1",
        className,
      )}
      aria-label="مبدل المظهر"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const active = activeTheme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={`تفعيل وضع ${option.label}`}
            title={`تفعيل وضع ${option.label}`}
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-sm border border-transparent px-3 text-[11px] font-black tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--workspace-highlight-border)]",
              active
                ? "border-[color:var(--workspace-highlight-border)] bg-[var(--workspace-highlight)] text-white"
                : "text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
