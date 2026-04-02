"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import { useBuyerAssistant } from "@/client_zone/assistant/BuyerAssistantPage/useBuyerAssistant";
import {
  AnanMark,
  HistorySheet,
  MessageThread,
  MobileIconButton,
  MobileViewport,
  cn,
} from "../../components/ui";
import { normalizeAssistantMessage, normalizeBuyerProperty, getDefaultSuggestions } from "../../lib/mobileWebData";
import { Menu, User, Mic, Search as SearchIcon, ArrowUp } from "lucide-react";

/**
 * WHY:   The main buyer journey on client web should now behave like the mobile chat-first home screen.
 * WHAT:  Renders the mobile-style assistant shell with centered branding, welcome state, history sheet, and bottom composer.
 * HOW:   Reuses the existing web assistant hook for live behavior while normalizing messages into the new mobile renderer.
 */
export default function AssistantScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const requestedThreadId = searchParams.get("threadId");
  const requestedPropertyId = searchParams.get("propertyId");
  const preselectedPropertyResult =
    useQuery(
      api.user_zone.web.properties.getPropertyDetail,
      requestedPropertyId ? { propertyId: requestedPropertyId as never } : "skip",
    ) ?? null;

  const assistant = useBuyerAssistant({
    locale: "ar",
    requestedThreadId,
    preselectedProperty: preselectedPropertyResult ? normalizeBuyerProperty(preselectedPropertyResult) : null,
  });

  const messages = useMemo(() => assistant.messages.map((message) => normalizeAssistantMessage(message)), [assistant.messages]);
  const showWelcome = messages.length === 1 && messages[0]?.id === "welcome";
  const defaultSuggestions = getDefaultSuggestions();

  async function askAboutProperty(property: ReturnType<typeof normalizeBuyerProperty>) {
    await assistant.sendMessage(`أريد تفاصيل أكثر عن ${property.title}`, property);
  }

  async function submitPrompt(prompt?: string) {
    await assistant.sendMessage(prompt);
  }

  return (
    <MobileViewport>
      <div className="flex items-center justify-between px-5 pb-2 pt-4">
        <div className="h-10 w-10">
          <MobileIconButton icon={Menu} label="سجل المحادثات" tone="ghost" size="sm" onClick={() => setIsHistoryOpen(true)} />
        </div>

        <div className="pointer-events-none absolute left-0 right-0 flex items-center justify-center">
          <div className="flex flex-row-reverse items-center gap-2">
            <AnanMark size={18} />
            <span className="text-[18px] font-black tracking-tight text-slate-900 dark:text-slate-50">عنان</span>
          </div>
        </div>

        <MobileIconButton icon={User} label="الحساب" href="/account" tone="ghost" size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <div className="flex min-h-full flex-col justify-center px-5 pb-6">
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <AnanMark />
              </div>

              <div className="space-y-3">
                <h1 className="text-[30px] leading-[42px] font-black text-slate-900 dark:text-slate-50">ابدأ من نفس شاشة الموبايل</h1>
                <p className="text-[15px] leading-8 font-medium text-slate-500 dark:text-slate-400">
                  احك لي عن المنطقة والميزانية ونوع العقار، أو افتح البحث إذا أردت تصفح الخيارات أولاً.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 text-right dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-row-reverse items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                    <SearchIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-black text-slate-900 dark:text-slate-50">رحلة واحدة بين البحث والمحادثة</h2>
                    <p className="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
                      اختر أي عقار ثم ارجع لنفس المساعد بنفس السياق، مثل التطبيق تماماً.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {defaultSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => void submitPrompt(suggestion.prompt)}
                    className="w-full rounded-full border border-slate-200 bg-white px-5 py-4 text-[14px] font-black text-slate-900 shadow-sm transition active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
                  >
                    {suggestion.prompt}
                  </button>
                ))}
              </div>

              <Link href="/search" className="inline-flex items-center justify-center gap-2 self-center text-[14px] font-black text-blue-600">
                <SearchIcon className="h-4 w-4" />
                افتح البحث المباشر
              </Link>
            </div>
          </div>
        ) : (
          <div data-testid="client-assistant-thread">
            <MessageThread
              messages={messages}
              isSending={assistant.isSending}
              onSelectPrompt={(prompt) => void submitPrompt(prompt)}
              onAskAboutProperty={(property) => void askAboutProperty(property)}
            />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-5 pb-5 pt-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        {assistant.showSignInPrompt ? (
          <div data-testid="client-auth-gate" className="mb-3 rounded-[24px] bg-emerald-50 px-4 py-4 text-right dark:bg-emerald-900/20">
            <p className="text-[15px] font-black text-emerald-800 dark:text-emerald-200">يمكنك طلب مستشار من هنا مباشرة</p>
            <p className="mt-2 text-[13px] leading-6 text-emerald-700 dark:text-emerald-300">
              بينما يبقى السجل محفوظاً على هذا السطح حالياً.
              <Link
                data-testid="client-auth-gate-signin-link"
                href="/signin?intent=advisor&returnTo=/app"
                className="ms-2 font-black text-emerald-900 underline underline-offset-4 dark:text-emerald-100"
              >
                سجّل الدخول
              </Link>
            </p>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-end gap-2 px-4 py-3">
            <textarea
              data-testid="client-chat-input"
              value={assistant.draft}
              onChange={(event) => assistant.setDraft(event.target.value)}
              placeholder="اسأل عن عقار أو اطلب مستشاراً"
              className="min-h-[44px] flex-1 resize-none bg-transparent text-right text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50"
              rows={1}
            />
            <button
              data-testid="client-chat-send"
              type="button"
              onClick={() => void submitPrompt()}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95",
                assistant.draft.trim() ? "bg-[#E57B4B] text-white" : "bg-transparent text-slate-500 dark:text-slate-300",
              )}
              aria-label={assistant.draft.trim() ? "إرسال الرسالة" : "تسجيل رسالة صوتية"}
            >
              {assistant.draft.trim() ? <ArrowUp className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <HistorySheet
        open={isHistoryOpen}
        activeThreadId={assistant.threadId}
        threads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
        onReset={() => {
          assistant.resetConversation();
          setIsHistoryOpen(false);
          router.push("/app");
        }}
        onSelect={(threadId) => {
          setIsHistoryOpen(false);
          router.push(`/app?threadId=${threadId}`);
        }}
      />
    </MobileViewport>
  );
}
