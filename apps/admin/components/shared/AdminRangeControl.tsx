"use client";

import { SegmentedControl } from "@anan/ui/forms";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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
    <SegmentedControl
      className={className}
      aria-label="time range"
      activeValue={currentRange}
      items={[
        { value: "30d" as const, label: "30 يوم" },
        { value: "90d" as const, label: "90 يوم" },
      ].map((item) => ({ ...item, href: buildHref(item.value) }))}
      renderLink={(item, itemClassName) => (
        <Link
          key={item.value}
          href={item.href ?? buildHref(item.value)}
          className={itemClassName}
        >
          {item.label}
        </Link>
      )}
    />
  );
}
