"use client";

import { AgUiTurnRenderer as PackageAgUiTurnRenderer } from "@anan/ag-ui/react";
import type { AnanProUiTurn } from "@/server/contracts/ananPro";
import { cn } from "@/lib/utils";

/**
 * WHY:   The workspace chat surface still needs a local renderer entrypoint even after the AG UI package extraction.
 * WHAT:  Adapts the shared package renderer to the workspace's `AnanProUiTurn` contract.
 * HOW:   Delegates rendering directly to `@anan/ag-ui/react` so the package stays the source of truth.
 */
export default function AgUiTurnRenderer({ turn }: { turn: AnanProUiTurn }) {
  return (
    <div
      className={cn(
        "ag-ui-thread w-full space-y-3",
        "[&_[data-slot='ag-ui-turn']]:space-y-3",
        "[&_section]:max-w-full",
        "[&_section]:text-right",
        "[&_section]:rounded-[26px]",
        "[&_button]:transition-colors",
      )}
      dir="rtl"
    >
      <PackageAgUiTurnRenderer turn={turn} />
    </div>
  );
}
