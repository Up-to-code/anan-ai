"use client";

import { AG_UI_COMPONENT_REGISTRY } from "@/components/shared/ag-aui/sdk/registry";
import type { AnanProUiTurn } from "@/server/contracts/ananPro";

/**
 * WHY:   The dashboard assistant should render server-produced AG UI cards without rebuilding orchestration in the client.
 * WHAT:  Maps structured assistant turn metadata onto the shared AG UI component registry.
 * HOW:   Iterates returned cards and renders each registered component with the server-provided props.
 */
export default function AgUiTurnRenderer({
  turn,
}: {
  turn: AnanProUiTurn;
}) {
  return (
    <div className="w-full space-y-4">
      {turn.cards.map((card) => {
        const Component = AG_UI_COMPONENT_REGISTRY[card.componentId];
        if (!Component) {
          return null;
        }

        return <Component key={card.id} {...card.props} />;
      })}
    </div>
  );
}
