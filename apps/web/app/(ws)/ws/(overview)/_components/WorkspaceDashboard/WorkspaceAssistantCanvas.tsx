"use client";

import { useEffect, useRef } from "react";
import InstitutionalChatInput from "@/components/shared/InstitutionalChatInput";
import MessageRow from "../../../_components/Chat/MessageRow";
import TypingIndicator from "../../../_components/Chat/TypingIndicator";
import AgUiTurnRenderer from "../../../_components/Chat/AgUiTurnRenderer";
import { AIMotionLogo } from "../../../_components/AIMotion";
import type { AnanProThread } from "@/server/contracts/ananPro";

type WorkspaceAssistantCanvasProps = {
  thread: AnanProThread | null;
  value: string;
  sendError: string | null;
  isLoadingThread: boolean;
  isSending: boolean;
  onChange: (value: string) => void;
  onSend: (message?: string) => void;
};

/**
 * WHY:   The workspace assistant needs one canvas that can gracefully switch between first-run prompting and normal thread playback.
 * WHAT:  Renders the landing view, active conversation stream, loading states, and the shared composer for Anan Pro.
 * HOW:   Scrolls the active thread to the latest message and keeps the thread/non-thread layouts visually consistent inside the workspace.
 */
export default function WorkspaceAssistantCanvas({
  thread,
  value,
  sendError,
  isLoadingThread,
  isSending,
  onChange,
  onSend,
}: WorkspaceAssistantCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMessages = Boolean(thread?.messages.length);

  useEffect(() => {
    if (!scrollRef.current || !hasMessages) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [hasMessages, isSending, thread?.id, thread?.messages.length]);

  if (isLoadingThread) {
    return (
      <section className="flex min-h-[40rem] flex-1 items-center justify-center px-6">
        <div className="text-sm font-medium text-slate-500">جاري تحميل المحادثة...</div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100svh-7rem)] min-w-0 flex-1 flex-col">
      {hasMessages ? (
        <>
          <div className="border-b border-stone-200 bg-stone-50 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-slate-950">
                  {thread?.title?.trim() || "محادثة Anan Pro"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">استكمل العمل من آخر نقطة وصلت إليها داخل هذه المحادثة.</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 pb-10">
              {thread?.messages.map((message) => (
                <MessageRow
                  key={message.id}
                  isUser={message.role === "user"}
                  content={message.content}
                  avatarState={message.role === "assistant" ? "tool" : undefined}
                >
                  {message.role === "assistant" && message.uiTurn ? <AgUiTurnRenderer turn={message.uiTurn} /> : null}
                </MessageRow>
              ))}
              {isSending ? <TypingIndicator state="thinking" text="anan pro يجهز الخطوة التالية..." /> : null}
            </div>
          </div>

          <div className="border-t border-stone-200 bg-stone-50 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
              {sendError ? <div className="mb-3 text-sm text-red-600">{sendError}</div> : null}
              <InstitutionalChatInput
                value={value}
                onChange={onChange}
                onSend={() => onSend()}
                isSending={isSending}
                layout="thread"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <AIMotionLogo state="idle" size="standard" className="mb-6" />
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                كيف يمكنني مساعدتك؟
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                ابدأ من هنا أو افتح أي محادثة سابقة من السجل الجانبي لمتابعة العمل داخل المساحة نفسها.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-2xl">
              {sendError ? <div className="mb-3 text-sm text-red-600">{sendError}</div> : null}
              <InstitutionalChatInput
                value={value}
                onChange={onChange}
                onSend={() => onSend()}
                isSending={isSending}
                layout="landing"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
