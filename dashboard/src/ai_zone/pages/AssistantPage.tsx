/**
 * AssistantPage.tsx — AI Zone Entry Page
 *
 * Orchestrates the premium Shadcn-style chatbot UI.
 * All data comes from useAssistantChat hook (Zone Architecture).
 * This page is a thin container — no inline API calls.
 */
import { useState } from "react";
import { Sparkles, Wand2, Shield, Zap } from "lucide-react";
import { ChatMessageList } from "../components/ChatMessageList";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { useAssistantChat } from "../hooks/useAssistantChat";

export default function AssistantPage() {
  const { messages, isLoading, isSending, submitMessage, mode, entitlement } =
    useAssistantChat();
  const [inputValue, setInputValue] = useState("");

  const suggestions = [
    "ما أبرز العروض المتاحة الآن؟",
    "ما حالة صفقاتي لهذا الأسبوع؟",
    "قارن لي بين مشروعين في الرياض",
    "ما العروض التي يمكن نشرها بعد التوثيق؟",
  ];

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSending) return;
    const msg = inputValue;
    setInputValue("");
    await submitMessage(msg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
      {/* Header */}
      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Anan-AI Assistant
              </h1>
              <p className="text-[11px] font-medium text-slate-500">
                مساعدك الذكي لإدارة العمل العقاري
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${mode === "action"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-amber-50 text-amber-600 border-amber-200"
                }`}
            >
              {mode === "action" ? (
                <Zap className="h-3 w-3" />
              ) : (
                <Shield className="h-3 w-3" />
              )}
              {mode === "action" ? "Action Mode" : "Q&A Only"}
            </div>
          </div>
        </div>
        {mode === "qa" && (
          <p className="mt-2 text-[11px] font-medium text-slate-400 pr-13">
            يلزم التوثيق + اشتراك نشط لتفعيل وضع الإجراءات.
          </p>
        )}
      </div>

      {/* Conversation Area */}
      <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-slate-50/30 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-400 tracking-tight">
                جاري تحميل المحادثة...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md space-y-6">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  مرحباً بك في Anan-AI
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  اسألني عن العقارات، العروض، أداء محفظتك، أو أي
                  استفسار يتعلق بإدارة الأعمال العقارية.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInputValue(s);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-sm"
                  >
                    <Wand2 className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <ChatMessageList>
            {messages.map((msg) => (
              <ChatBubble key={msg._id} message={msg} />
            ))}
            {isSending && (
              <div className="flex gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white border border-blue-500/20 shadow-sm">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tr-md bg-white border border-slate-200 px-4 py-3 text-sm text-slate-400 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </ChatMessageList>
        )}

        {/* Suggestion pills (visible when there are messages) */}
        {messages.length > 0 && (
          <div className="shrink-0 px-4 py-2 border-t border-slate-100 bg-white/60 backdrop-blur-sm">
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInputValue(s)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Wand2 className="h-2.5 w-2.5" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 p-3 bg-white border-t border-slate-100">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            disabled={isSending || entitlement === undefined}
            placeholder="اسأل Anan-AI عن أي شيء..."
          />
        </div>
      </div>
    </div>
  );
}
