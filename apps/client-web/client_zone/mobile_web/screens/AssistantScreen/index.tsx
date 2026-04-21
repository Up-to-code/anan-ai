"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Menu, Mic, ArrowUp, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import { useBuyerAssistant } from "@/client_zone/assistant/BuyerAssistantPage/useBuyerAssistant";
import { AnanMark, MessageThread, MobileIconButton, MobileButton, PropertyResultCard, cn } from "../../components/ui";
import { BuyerRailCard, ResponsiveBuyerShell, ResponsiveHistoryPanel } from "../../components/layout";
import {
  formatCurrency,
  getDefaultSuggestions,
  getPropertyHeroImage,
  getPropertyLocationLabel,
  normalizeAssistantMessage,
  normalizeBuyerProperty,
} from "../../lib/mobileWebData";

/**
 * WHY:   The main buyer journey on client web should follow the mobile product while scaling cleanly into desktop.
 * WHAT:  Renders the responsive assistant shell with mobile behavior below `lg` and a contextual desktop rail above it.
 * HOW:   Reuses the existing assistant hook, normalizes messages into the mobile-web renderer, and exposes recent threads and property context in the rail.
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
  const latestPromptSet = useMemo(
    () => messages.at(-1)?.suggestedPrompts?.filter((prompt) => prompt.trim().length > 0) ?? getDefaultSuggestions().map((item) => item.prompt),
    [messages],
  );
  const activeProperty = assistant.activeProperty ? normalizeBuyerProperty(assistant.activeProperty) : null;

  async function askAboutProperty(property: ReturnType<typeof normalizeBuyerProperty>) {
    await assistant.sendMessage(`أريد تفاصيل أكثر عن ${property.title}`, property);
  }

  async function submitPrompt(prompt?: string) {
    await assistant.sendMessage(prompt);
  }

  function resetConversation() {
    assistant.resetConversation();
    setIsHistoryOpen(false);
    router.push("/app");
  }

  function openThread(threadId: string) {
    setIsHistoryOpen(false);
    router.push(`/app?threadId=${threadId}`);
  }

  const header = (
    <div className="flex items-center justify-between px-5 pb-2 pt-4 md:px-6 md:pb-4 md:pt-5 lg:border-b lg:border-slate-100 lg:px-6 lg:py-5 dark:lg:border-slate-800">
      <div className="h-10 w-10">
        <MobileIconButton
          icon={Menu}
          label="سجل المحادثات"
          tone="ghost"
          size="sm"
          onClick={() => setIsHistoryOpen(true)}
          className="lg:hidden"
        />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 flex items-center justify-center lg:static lg:pointer-events-auto">
        <div className="flex flex-row-reverse items-center gap-2">
          <AnanMark size={18} />
          <span className="text-[18px] font-black tracking-tight text-slate-900 dark:text-slate-50">عنان</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/search"
          className="hidden lg:inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          البحث
        </Link>
        <MobileIconButton icon={User} label="الحساب" href="/account" tone="ghost" size="sm" />
      </div>
    </div>
  );

  const main = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div data-testid="client-assistant-thread" className="mx-auto w-full max-w-4xl">
          <MessageThread
            messages={messages}
            isSending={assistant.isSending}
            onSelectPrompt={(prompt) => void submitPrompt(prompt)}
            onAskAboutProperty={(property) => void askAboutProperty(normalizeBuyerProperty(property))}
            activeThreadId={assistant.threadId}
          />
        </div>
      </div>

      <div className="hidden shrink-0 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur lg:block dark:border-slate-800 dark:bg-slate-950/95">
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

        <AssistantComposer
          draft={assistant.draft}
          onDraftChange={assistant.setDraft}
          onSend={() => void submitPrompt()}
        />
      </div>
    </div>
  );

  const mobileBottomBar = (
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

      <AssistantComposer
        draft={assistant.draft}
        onDraftChange={assistant.setDraft}
        onSend={() => void submitPrompt()}
      />
    </div>
  );

  const desktopRail = (
    <>
      <ResponsiveHistoryPanel
        mode="inline"
        activeThreadId={assistant.threadId}
        threads={assistant.recentThreads}
        onReset={resetConversation}
        onSelect={openThread}
      />

      {activeProperty ? (
        <BuyerRailCard title="العقار النشط" eyebrow="السياق الحالي">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getPropertyHeroImage(activeProperty)} alt={activeProperty.title} className="h-[180px] w-full object-cover" />
            <div className="space-y-3 px-4 py-4">
              <div>
                <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">{activeProperty.title}</p>
                <p className="mt-1 text-[13px] font-medium text-slate-500 dark:text-slate-400">
                  {getPropertyLocationLabel(activeProperty)}
                </p>
              </div>
              <p className="text-[18px] font-black text-blue-600">{formatCurrency(activeProperty.price)}</p>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-black text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-white px-3 py-2 text-center dark:bg-slate-900">{activeProperty.beds} غرف</span>
                <span className="rounded-full bg-white px-3 py-2 text-center dark:bg-slate-900">{activeProperty.baths} حمامات</span>
              </div>
              <MobileButton label="عرض العقار" href={`/app/property/${activeProperty.id}`} className="w-full" variant="secondary" />
            </div>
          </div>
        </BuyerRailCard>
      ) : null}

      <BuyerRailCard title="اقتراحات سريعة" eyebrow="المحادثة">
        <div className="space-y-2">
          {latestPromptSet.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void submitPrompt(prompt)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-right text-[13px] font-black text-slate-900 transition active:scale-[0.98] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </BuyerRailCard>

      {assistant.showSignInPrompt ? (
        <BuyerRailCard title="تابع مع مستشار" eyebrow="الحساب">
          <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
            سجّل الدخول لحفظ السجل وطلب المستشار من نفس السياق.
          </p>
          <MobileButton label="سجّل الدخول" href="/signin?intent=advisor&returnTo=/app" className="w-full" />
        </BuyerRailCard>
      ) : null}
    </>
  );

  return (
    <>
      <ResponsiveBuyerShell header={header} main={main} desktopRail={desktopRail} mobileBottomBar={mobileBottomBar} />

      <ResponsiveHistoryPanel
        mode="sheet"
        open={isHistoryOpen}
        activeThreadId={assistant.threadId}
        threads={assistant.recentThreads}
        onClose={() => setIsHistoryOpen(false)}
        onReset={resetConversation}
        onSelect={openThread}
      />
    </>
  );
}

function AssistantComposer({
  draft,
  onDraftChange,
  onSend,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end gap-2 px-4 py-3">
        <textarea
          data-testid="client-chat-input"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="اسأل عن عقار أو اطلب مستشاراً"
          className="min-h-[44px] flex-1 resize-none bg-transparent text-right text-[15px] font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50"
          rows={1}
        />
        <button
          data-testid="client-chat-send"
          type="button"
          onClick={onSend}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95",
            draft.trim() ? "bg-[#E57B4B] text-white" : "bg-transparent text-slate-500 dark:text-slate-300",
          )}
          aria-label={draft.trim() ? "إرسال الرسالة" : "تسجيل رسالة صوتية"}
        >
          {draft.trim() ? <ArrowUp className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
