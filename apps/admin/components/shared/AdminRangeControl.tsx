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
        "flex items-center gap-1 rounded-sm border border-[color:color-mix(in_srgb,var(--workspace-border)_90%,transparent)] bg-[var(--workspace-panel)] p-1",
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
            "rounded-sm border border-transparent px-3 py-1.5 text-sm font-black tracking-[0.1em] transition-colors",
            currentRange === item.value
              ? "border-[color:var(--workspace-highlight-border)] bg-[var(--workspace-highlight)] text-white"
              : "text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
