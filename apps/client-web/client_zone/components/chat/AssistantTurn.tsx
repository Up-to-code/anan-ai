"use client";

import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
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
    <section className="space-y-4">
      <div className="mx-auto flex w-full max-w-[820px] items-center gap-3">
        <AnanBrandMark className="h-10 w-10" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{dictionary.app.assistantName}</div>
          <div className="text-xs text-slate-500">{dictionary.app.liveNow}</div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[820px]">
        <AssistantArticle content={message.text} />
      </div>
      {message.uiTurn ? <AgUiTurnRenderer turn={message.uiTurn} /> : null}
    </section>
  );
}
