"use client";

import { AgUiTurnRenderer } from "@anan/ag-ui/react";
import { resolveAgUiTurn } from "@anan/ag-ui";

/**
 * WHY:   Package consumers need a concrete host example that shows the minimum setup for rendering AG UI turns.
 * WHAT:  Demonstrates a Next.js client component rendering a sample turn with host-owned action callbacks.
 * HOW:   Builds a demo turn with `resolveAgUiTurn` and wires `approve`/`edit` handlers into the renderer.
 */
export default function ExampleAgUiHost() {
  const turn = resolveAgUiTurn("إنشاء مشروع في الرياض");

  return (
    <AgUiTurnRenderer
      turn={turn}
      actionHandlers={{
        byName: {
          approve: ({ actionId }) => {
            console.log("approve", actionId);
          },
          edit: ({ actionId }) => {
            console.log("edit", actionId);
          },
        },
      }}
    />
  );
}
