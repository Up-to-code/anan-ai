"use client";

import { AgUiTurnRenderer as PackageAgUiTurnRenderer } from "@anan/ag-ui/react";
import type { AnanProUiTurn } from "@/server/contracts/ananPro";

/**
 * WHY:   The workspace chat surface still needs a local renderer entrypoint even after the AG UI package extraction.
 * WHAT:  Adapts the shared package renderer to the workspace's `AnanProUiTurn` contract.
 * HOW:   Delegates rendering directly to `@anan/ag-ui/react` so the package stays the source of truth.
 */
export default function AgUiTurnRenderer({ turn }: { turn: AnanProUiTurn }) {
  return <PackageAgUiTurnRenderer turn={turn} />;
}
