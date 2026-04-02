import { useAction, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/convexApi";
import { buildBuyerThreadTitle } from "@/lib/buyerAssistantShared";
import {
  buildFallbackAssistantMessage,
  buildSuggestedPrompts,
} from "@/lib/mobileData";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import {
  clearGuestThreadSnapshot,
  loadGuestThreadSnapshot,
  saveGuestThreadSnapshot,
} from "@/lib/mobilePersistence";
import type {
  MobileConversationMessage,
  MobileProperty,
  MobileThreadSummary,
} from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);
const LOCAL_THREAD_ID = "guest-current";

type ClientAssistantResponse = {
  message: string;
  properties: MobileProperty[];
  cards: Array<any>;
  suggestedPrompts: string[];
  activePropertyId?: string;
  requiresAuthForHandoff: boolean;
  threadId?: string;
};

type PublicAssistantSession = {
  guestId: string;
  channelSessionToken: string;
  expiresAt: number;
};

type AskClientAssistantPayload = {
  message: string;
  threadId?: string;
  selectedPropertyId?: string;
  inputMode?: "text" | "voice";
  locale: "ar";
};

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "unknown_failure";
}

function buildAuthRequiredMessage() {
  return {
    id: `assistant-auth-required-${Date.now()}`,
    role: "assistant" as const,
    text: "يمكنك طلب مستشار من هنا مباشرة، بينما يبقى السجل محفوظاً على هذا الجهاز حالياً.",
    suggestedPrompts: buildSuggestedPrompts(null),
  };
}

function buildLocalHistoryMessage() {
  return {
    id: `assistant-local-history-${Date.now()}`,
    role: "assistant" as const,
    text: "السجل محفوظ على هذا الجهاز حالياً. أكمّل هنا أو اطلب مستشاراً مباشرة من نفس المحادثة.",
    suggestedPrompts: buildSuggestedPrompts(null),
  };
}

function buildAdvisorSuccessMessage(propertyTitle: string) {
  return {
    id: `assistant-handoff-success-${Date.now()}`,
    role: "assistant" as const,
    text: `تم رفع طلب المستشار الخاص بـ ${propertyTitle}. سيكمل الفريق المتابعة من نفس سياق المحادثة الحالية.`,
    suggestedPrompts: buildSuggestedPrompts(null),
  };
}

function buildAdvisorFailureMessage(propertyTitle: string) {
  return {
    id: `assistant-handoff-failure-${Date.now()}`,
    role: "assistant" as const,
    text: `تعذر رفع طلب المستشار لـ ${propertyTitle} حالياً. حاول مرة أخرى بعد قليل وسأحتفظ بالسياق هنا.`,
    suggestedPrompts: buildSuggestedPrompts(null),
  };
}

function readLatestProperty(messages: MobileConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const property = messages[index]?.properties?.[0];
    if (property) return property;
  }
  return null;
}

function buildLocalThreadSummary(args: {
  messages: MobileConversationMessage[];
  activeThreadId: string | null;
  updatedAt: number;
}): MobileThreadSummary | null {
  if (args.messages.length === 0) return null;
  const firstTimestamp = args.messages.find((message) => typeof message.createdAt === "number")?.createdAt ?? args.updatedAt;
  const preview =
    args.messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant" || message.role === "user")?.text
      ?.slice(0, 120) ?? undefined;

  return {
    id: args.activeThreadId ?? LOCAL_THREAD_ID,
    title: buildBuyerThreadTitle(args.messages),
    createdAt: firstTimestamp,
    updatedAt: args.updatedAt,
    preview,
  };
}

/**
 * WHY:   The buyer home screen needs one async source of truth for the same chat-first product model across mobile and public assistant surfaces.
 * WHAT:  Manages the active conversation, guest persistence, local history summary, and in-app advisor escalation.
 * HOW:   Reuses the shared public assistant backend in live mode and falls back to the deterministic local assistant when Convex is unavailable.
 */
function usePropertyAssistantController(args: {
  askClientAssistant: ((payload: AskClientAssistantPayload) => Promise<ClientAssistantResponse>) | null;
  bootstrapPublicSession:
    | ((payload: { guestId?: string }) => Promise<PublicAssistantSession & { threadId?: string }>)
    | null;
  generateVoiceUploadUrl:
    | ((payload: { guestId: string; channelSessionToken: string }) => Promise<string>)
    | null;
  transcribeVoiceFromStorage:
    | ((payload: {
        guestId: string;
        channelSessionToken: string;
        storageId: string;
      }) => Promise<{ text: string; languageCode?: string }>)
    | null;
  createQualifiedHandoff:
    | ((payload: {
        propertyId: string;
        message: string;
        externalUserId?: string;
        threadId?: string;
        sourceChannel: "app";
      }) => Promise<{ orderId: string }>)
    | null;
}) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MobileConversationMessage[]>([]);
  const [activeProperty, setActiveProperty] = useState<MobileProperty | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadKind, setActiveThreadKind] = useState<"welcome" | "live">("welcome");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const lastUpdatedAt = useRef(Date.now());
  const publicSessionRef = useRef<PublicAssistantSession | null>(null);

  useEffect(() => {
    void loadGuestThreadSnapshot().then((snapshot) => {
      if (!snapshot) {
        setIsHydrated(true);
        return;
      }

      setDraft(snapshot.draft);
      setActiveThreadId(snapshot.activeThreadId);
      setActiveThreadKind(snapshot.activeThreadKind);
      setActiveProperty(snapshot.activeProperty);
      setMessages(snapshot.messages);
      lastUpdatedAt.current = snapshot.updatedAt;
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (messages.length === 0 && activeThreadKind === "welcome" && !activeProperty && !draft.trim()) {
      void clearGuestThreadSnapshot();
      return;
    }

    void saveGuestThreadSnapshot({
      draft,
      activeThreadId,
      activeThreadKind,
      activeProperty,
      messages,
      updatedAt: lastUpdatedAt.current,
    });
  }, [activeProperty, activeThreadId, activeThreadKind, draft, isHydrated, messages]);

  const localThread = buildLocalThreadSummary({
    messages,
    activeThreadId,
    updatedAt: lastUpdatedAt.current,
  });

  const recentThreads = localThread ? [localThread] : [];

  function syncTranscriptToAccount() {
    setShowAuthCallout(false);
    setMessages((current) => {
      if (current.at(-1)?.id.startsWith("assistant-local-history")) return current;
      const localHistoryMessage = {
        ...buildLocalHistoryMessage(),
        createdAt: Date.now(),
      } satisfies MobileConversationMessage;
      lastUpdatedAt.current = localHistoryMessage.createdAt ?? Date.now();
      return [...current, localHistoryMessage];
    });
  }

  async function submit(prompt = draft, inputMode: "text" | "voice" = "text") {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage: MobileConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
      activePropertyId: activeProperty?.id,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setIsSubmitting(true);
    setActiveThreadKind("live");
    lastUpdatedAt.current = userMessage.createdAt ?? Date.now();

    try {
      let assistantMessage: MobileConversationMessage;

      if (args.askClientAssistant) {
        const response = await args.askClientAssistant({
          message: trimmed,
          threadId: activeThreadId ?? undefined,
          selectedPropertyId: activeProperty?.id,
          inputMode,
          locale: "ar",
        });
        const nextActiveProperty =
          response.properties.find((property) => property.id === String(response.activePropertyId ?? "")) ??
          response.properties[0] ??
          activeProperty;

        assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: response.message,
          createdAt: Date.now(),
          properties: response.properties,
          cards: response.cards,
          suggestedPrompts:
            response.suggestedPrompts.length > 0
              ? [...response.suggestedPrompts]
              : buildSuggestedPrompts(nextActiveProperty),
          activePropertyId: nextActiveProperty?.id,
          requiresAuthForHandoff: response.requiresAuthForHandoff,
          uiTurn: buildMobileAgUiTurn({
            assistantText: response.message,
            properties: response.properties,
            cards: response.cards,
          }),
        };
        setActiveProperty(nextActiveProperty ?? null);
        setActiveThreadId(response.threadId ?? activeThreadId);
        setShowAuthCallout(response.requiresAuthForHandoff);
      } else {
        assistantMessage = {
          ...buildFallbackAssistantMessage({
            message: trimmed,
            activeProperty,
          }),
          createdAt: Date.now(),
        };
        if (assistantMessage.properties?.[0]) {
          setActiveProperty(assistantMessage.properties[0]);
        }
      }

      lastUpdatedAt.current = assistantMessage.createdAt ?? Date.now();
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const failureCode = describeFailure(error);
      const fallbackMessage: MobileConversationMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text:
          failureCode === "NOT_FOUND"
            ? "لم أتمكن من متابعة هذا العقار الآن. اختر خياراً آخر وسأكمل معك."
            : "تعذر إكمال الطلب حالياً. حاول مرة أخرى بعد لحظات.",
        createdAt: Date.now(),
        properties: activeProperty ? [activeProperty] : undefined,
        suggestedPrompts: buildSuggestedPrompts(activeProperty),
        activePropertyId: activeProperty?.id,
        uiTurn:
          activeProperty
            ? buildMobileAgUiTurn({
                assistantText:
                  failureCode === "NOT_FOUND"
                    ? "لم أتمكن من متابعة هذا العقار الآن. اختر خياراً آخر وسأكمل معك."
                    : "تعذر إكمال الطلب حالياً. حاول مرة أخرى بعد لحظات.",
                properties: [activeProperty],
              })
            : undefined,
      };
      lastUpdatedAt.current = fallbackMessage.createdAt ?? Date.now();
      setMessages((current) => [...current, fallbackMessage]);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function askAboutProperty(property: MobileProperty) {
    setActiveProperty(property);
    const focusMessage = {
      ...buildAuthRequiredMessage(),
      id: `assistant-focus-${property.id}-${Date.now()}`,
      text: property.aiSummary ?? `أراجع الآن ${property.title}. سأجهز لك التمويل والعائد والتحقق والخطوات التالية.`,
      properties: [property],
      activePropertyId: property.id,
      uiTurn: buildMobileAgUiTurn({
        assistantText: property.aiSummary ?? `أراجع الآن ${property.title}.`,
        properties: [property],
      }),
      createdAt: Date.now(),
    } satisfies MobileConversationMessage;

    setMessages((current) => {
      if (current.at(-1)?.activePropertyId === property.id) {
        return current;
      }
      lastUpdatedAt.current = focusMessage.createdAt ?? Date.now();
      return [...current, focusMessage];
    });

    await submit(`أريد تفاصيل أكثر عن ${property.title}`);
  }

  async function ensurePublicSession() {
    const current = publicSessionRef.current;
    if (current?.guestId && current.channelSessionToken && current.expiresAt > Date.now()) {
      return current;
    }
    if (!args.bootstrapPublicSession) {
      throw new Error("التسجيل الصوتي غير متاح حالياً.");
    }

    const nextSession = await args.bootstrapPublicSession({
      guestId: current?.guestId,
    });
    const session = {
      guestId: nextSession.guestId,
      channelSessionToken: nextSession.channelSessionToken,
      expiresAt: nextSession.expiresAt,
    } satisfies PublicAssistantSession;
    publicSessionRef.current = session;
    return session;
  }

  async function submitVoiceRecording(fileUri: string) {
    if (!args.generateVoiceUploadUrl || !args.transcribeVoiceFromStorage) {
      throw new Error("التسجيل الصوتي يحتاج اتصالاً بالخدمة المباشرة.");
    }

    const session = await ensurePublicSession();
    const uploadUrl = await args.generateVoiceUploadUrl({
      guestId: session.guestId,
      channelSessionToken: session.channelSessionToken,
    });
    const fileResponse = await fetch(fileUri);
    const audioBlob = await fileResponse.blob();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": audioBlob.type || "audio/m4a",
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error("تعذر رفع التسجيل الصوتي.");
    }

    const uploadPayload = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null;
    const storageId = uploadPayload?.storageId?.trim();
    if (!storageId) {
      throw new Error("تعذر تجهيز الملف الصوتي للتفريغ.");
    }

    const transcript = await args.transcribeVoiceFromStorage({
      guestId: session.guestId,
      channelSessionToken: session.channelSessionToken,
      storageId,
    });
    const text = transcript.text.trim();
    if (!text) {
      throw new Error("وصل التسجيل بدون نص قابل للإرسال.");
    }

    await submit(text, "voice");
  }

  async function requestAdvisor() {
    if (!activeProperty) return;
    setShowAuthCallout(true);
    if (!args.createQualifiedHandoff) {
      setMessages((current) => [...current, { ...buildAdvisorFailureMessage(activeProperty.title), createdAt: Date.now() }]);
      return;
    }

    try {
      const session = args.bootstrapPublicSession ? await ensurePublicSession() : null;
      await args.createQualifiedHandoff({
        propertyId: activeProperty.id,
        message: messages.at(-1)?.text ?? activeProperty.title,
        externalUserId: session?.guestId,
        threadId: activeThreadId ?? undefined,
        sourceChannel: "app",
      });

      setShowAuthCallout(false);
      setMessages((current) => {
        const successMessage = {
          ...buildAdvisorSuccessMessage(activeProperty.title),
          createdAt: Date.now(),
          activePropertyId: activeProperty.id,
          properties: [activeProperty],
          uiTurn: buildMobileAgUiTurn({
            assistantText: `تم رفع طلب المستشار الخاص بـ ${activeProperty.title}.`,
            properties: [activeProperty],
          }),
        } satisfies MobileConversationMessage;
        lastUpdatedAt.current = successMessage.createdAt ?? Date.now();
        return [...current, successMessage];
      });
    } catch {
      setMessages((current) => {
        const failureMessage = {
          ...buildAdvisorFailureMessage(activeProperty.title),
          createdAt: Date.now(),
          activePropertyId: activeProperty.id,
          properties: [activeProperty],
          uiTurn: buildMobileAgUiTurn({
            assistantText: `تعذر رفع طلب المستشار لـ ${activeProperty.title} حالياً.`,
            properties: [activeProperty],
          }),
        } satisfies MobileConversationMessage;
        lastUpdatedAt.current = failureMessage.createdAt ?? Date.now();
        return [...current, failureMessage];
      });
    }
  }

  async function openHistoryThread(threadId: string) {
    if (threadId === localThread?.id) {
      return;
    }
  }

  function resetToWelcome() {
    setDraft("");
    setMessages([]);
    setActiveProperty(null);
    setActiveThreadId(null);
    setActiveThreadKind("welcome");
    setShowAuthCallout(false);
    lastUpdatedAt.current = Date.now();
    void clearGuestThreadSnapshot();
  }

  return {
    draft,
    messages,
    activeProperty,
    activeThreadId,
    activeThreadKind,
    recentThreads,
    isHydrated,
    isSubmitting,
    showAuthCallout,
    setDraft,
    setShowAuthCallout,
    submit,
    submitVoiceRecording,
    askAboutProperty,
    requestAdvisor,
    openHistoryThread,
    resetToWelcome,
    syncTranscriptToAccount,
  };
}

function useLivePropertyAssistant() {
  const sendPublicAssistantMessage = useAction(api.ai_zone.assistantPublic.sendMessage);
  const bootstrapPublicSession = useMutation(api.ai_zone.assistantPublic.bootstrapSession);
  const generateVoiceUploadUrl = useMutation(api.ai_zone.assistantPublic.generateVoiceUploadUrl);
  const transcribeVoiceFromStorage = useAction(api.ai_zone.assistantPublic.transcribeVoiceFromStorage);
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);
  const sessionRef = useRef<PublicAssistantSession | null>(null);

  async function ensurePublicSession() {
    const current = sessionRef.current;
    if (current?.guestId && current.channelSessionToken && current.expiresAt > Date.now()) {
      return current;
    }

    const nextSession = await bootstrapPublicSession({
      guestId: current?.guestId,
    }) as PublicAssistantSession & { threadId?: string };
    const session = {
      guestId: nextSession.guestId,
      channelSessionToken: nextSession.channelSessionToken,
      expiresAt: nextSession.expiresAt,
    } satisfies PublicAssistantSession;
    sessionRef.current = session;
    return session;
  }

  return usePropertyAssistantController({
    askClientAssistant: (async (payload: AskClientAssistantPayload) => {
      const session = await ensurePublicSession();
      return sendPublicAssistantMessage({
        guestId: session.guestId,
        channelSessionToken: session.channelSessionToken,
        message: payload.message,
        threadId: payload.threadId as never,
        selectedPropertyId: payload.selectedPropertyId as never,
        inputMode: payload.inputMode,
        locale: payload.locale,
      }) as Promise<ClientAssistantResponse>;
    }) as never,
    bootstrapPublicSession: bootstrapPublicSession as never,
    generateVoiceUploadUrl: generateVoiceUploadUrl as never,
    transcribeVoiceFromStorage: transcribeVoiceFromStorage as never,
    createQualifiedHandoff: createQualifiedHandoff as never,
  });
}

function useFallbackPropertyAssistant() {
  return usePropertyAssistantController({
    askClientAssistant: null,
    bootstrapPublicSession: null,
    generateVoiceUploadUrl: null,
    transcribeVoiceFromStorage: null,
    createQualifiedHandoff: null,
  });
}

export function usePropertyAssistant() {
  return LIVE_BACKEND_ENABLED ? useLivePropertyAssistant() : useFallbackPropertyAssistant();
}
