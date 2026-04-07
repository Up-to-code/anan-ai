"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminRangeControlProps = {
  className?: string;
};

/**
 * WHY:   The rebuilt admin surface needs one consistent time-window switch across dashboard and analytics routes.
 * WHAT:  Renders route-preserving links for the 30-day and 90-day management windows.
 * HOW:   Reuses the current pathname and search params while replacing only the `range` parameter.
 */
export default function AdminRangeControl({ className }: AdminRangeControlProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") === "90d" ? "90d" : "30d";

  const buildHref = (range: "30d" | "90d") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-1 rounded-[18px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] p-1 shadow-sm",
        className,
      )}
      aria-label="time range"
    >
      {[
        { value: "30d" as const, label: "30 يوم" },
        { value: "90d" as const, label: "90 يوم" },
      ].map((item) => (
        <Link
          key={item.value}
          href={buildHref(item.value)}
          className={cn(
            "rounded-[14px] px-3 py-1.5 text-sm font-black tracking-[0.08em] transition-colors",
            currentRange === item.value
              ? "bg-[var(--workspace-highlight)] text-white"
              : "text-[var(--workspace-muted)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
