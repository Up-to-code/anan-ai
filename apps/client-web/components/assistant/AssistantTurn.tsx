import { type BuyerAgUiTurn } from "@anan/client-assistant";
import { PropertyShortlist } from "./cards/PropertyShortlist";
import { ComparisonTable } from "./cards/ComparisonTable";
import { MarkdownContent } from "@/components/ui/markdown-content";

interface AssistantTurnProps {
  turn: BuyerAgUiTurn;
}

export function AssistantTurn({ turn }: AssistantTurnProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 animate-zone-page-enter">
      {turn.assistantText && (
        <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-none text-sm max-w-[90%]">
          <MarkdownContent content={turn.assistantText} />
        </div>
      )}
      <div className="flex flex-col gap-3">
        {turn.cards.map((card) => {
          switch (card.componentId) {
            case "property_shortlist":
              return <PropertyShortlist key={card.id} properties={card.props.properties as any} />;
            case "comparison_table":
              return <ComparisonTable key={card.id} {...(card.props as any)} />;
            default:
              return (
                <div key={card.id} className="p-4 bg-muted/50 rounded-xl border border-dashed border-primary/20 text-[10px] text-muted-foreground uppercase font-black text-center">
                  Component {card.componentId} not implemented yet
                </div>
              );
          }
        })}
      </div>
    </div>
  );
}
