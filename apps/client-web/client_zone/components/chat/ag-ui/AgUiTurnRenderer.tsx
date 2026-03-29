import type { ClientAgUiTurn } from "@/client_zone/lib/types";
import type { ComponentType } from "react";
import { CLIENT_AG_UI_REGISTRY } from "./registry";

/**
 * WHY:   The upgraded client assistant should render agentic cards from a structured turn payload instead of hardcoded one-off conditionals.
 * WHAT:  Renders the cards for a single assistant AG UI turn.
 * HOW:   Looks up each `componentId` in the local registry and skips unknown cards safely.
 */
export function AgUiTurnRenderer({ turn }: { turn: ClientAgUiTurn }) {
  return (
    <div
      className="ag-ui-thread flex w-full flex-col gap-4 [&_section]:max-w-full [&_section]:text-start"
      dir="auto"
    >
      {turn.cards.map((card) => {
        const Component = CLIENT_AG_UI_REGISTRY[card.componentId] as ComponentType<Record<string, unknown>> | undefined;
        if (!Component) {
          return null;
        }

        return (
          <div key={card.id} data-testid={`client-ag-ui-card-${card.componentId}`}>
            <Component {...card.props} />
          </div>
        );
      })}
    </div>
  );
}
