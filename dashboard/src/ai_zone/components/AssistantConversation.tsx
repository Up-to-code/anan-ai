import type { AssistantMessage } from "../types";
import { cn } from "@/_core/lib/utils";
import { Loader2 } from "lucide-react";

export function AssistantConversation({ messages }: { messages: AssistantMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-center text-sm font-medium text-slate-500">
        ابدأ المحادثة مع Anan-AI Mode لاقتراحات أسرع ومعلومات أدق.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message._id}
          className={cn(
            "rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            message.role === "assistant"
              ? "bg-white border border-slate-200 text-slate-700"
              : "bg-blue-600 text-white mr-auto max-w-[90%]",
          )}
        >
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
            {message.role === "assistant" ? "anan-ai" : "you"}
            {message.streamState === "streaming" && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <div className="whitespace-pre-wrap">{message.content}</div>
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-semibold text-blue-600">
              {message.sources.map((s) => (
                <span key={s.href} className="rounded-full bg-blue-50 px-2 py-1 border border-blue-100">
                  {s.title}
                </span>
              ))}
            </div>
          )}
          {message.reasoning && (
            <div className="mt-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 px-3 py-2 border border-slate-100">
              {message.reasoning}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
