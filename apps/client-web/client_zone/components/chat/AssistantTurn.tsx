"use client";

import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { Badge } from "@/client_zone/components/ui/badge";
import type { AssistantMessage } from "@/client_zone/lib/types";
import { AnanBrandMark } from "./AnanBrandMark";
import { AssistantArticle } from "./AssistantArticle";
import { AgUiTurnRenderer } from "./ag-ui/AgUiTurnRenderer";

/**
 * WHY:   Assistant responses now combine narrative guidance and agentic UI blocks inside one coherent thread turn.
 * WHAT:  Renders the assistant identity row, article-style text, and optional AG UI cards.
 * HOW:   Keeps prose constrained for readability while allowing the card region to expand wider below it.
 */
export function AssistantTurn({ message }: { message: AssistantMessage }) {
  const { dictionary } = useLocaleDictionary();

  return (
    <section className="w-full">
      <div className="flex min-w-0 items-start gap-4 sm:gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm sm:h-12 sm:w-12">
          <AnanBrandMark className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {dictionary.app.assistantName}
            </div>
            <Badge>{dictionary.app.liveNow}</Badge>
          </div>
          <AssistantArticle content={message.text} />
          {message.uiTurn ? <AgUiTurnRenderer turn={message.uiTurn} /> : null}
        </div>
      </div>
    </section>
  );
}
