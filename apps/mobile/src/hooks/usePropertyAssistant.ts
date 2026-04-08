import { useAction, useMutation } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/convexApi";
import {
  buildStoredThreadRecord,
  createLocalThreadId,
  emptyThreadStore,
  listThreadSummaries,
  readStoredThread,
  upsertStoredThread,
} from "@/lib/mobileThreadStore";
import {
  buildFallbackAssistantMessage,
  buildSuggestedPrompts,
} from "@/lib/mobileData";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import { applyPropertySelectionPromptToDraft } from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import {
  clearGuestThreadStore,
  loadGuestThreadStore,
  saveGuestThreadStore,
} from "@/lib/mobilePersistence";
import type {
  MobileConversationMessage,
  MobileGuestThreadStore,
  MobileProperty,
  MobileSearchContext,
  MobileStoredThread,
  MobileThreadSummary,
} from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);
const SEARCH_MORE_PROMPT = "اعرض نتائج مشابهة";

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

function dedupeSelectedProperties(properties: MobileProperty[]) {
  const seen = new Set<string>();
  return properties.filter((property) => {
    const propertyId = property?.id?.trim();
    if (!propertyId || seen.has(propertyId)) return false;
    seen.add(propertyId);
    return true;
  });
}

function readSelectedProperties(thread: MobileStoredThread | null) {
  if (!thread) return [] as MobileProperty[];
  const storedSelection = dedupeSelectedProperties(thread.selectedProperties ?? []);
  if (storedSelection.length > 0) return storedSelection;
  const fallbackProperty = thread.activeProperty ?? readLatestProperty(thread.messages);
  return fallbackProperty ? [fallbackProperty] : [];
}

function readLatestUserMessage(messages: MobileConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user" && message.text.trim()) return message.text.trim();
  }
  return null;
}

function mergeSuggestedPrompts(prompts: string[] | undefined, property: MobileProperty | null) {
  const nextPrompts = [...(prompts ?? buildSuggestedPrompts(property))];
  if (property && !nextPrompts.includes(SEARCH_MORE_PROMPT)) {
    nextPrompts.push(SEARCH_MORE_PROMPT);
  }
  return Array.from(new Set(nextPrompts));
}

function toActiveThreadState(thread: MobileStoredThread | null) {
  if (!thread) {
    return {
      draft: "",
      messages: [] as MobileConversationMessage[],
      selectedProperties: [] as MobileProperty[],
      activeThreadId: null as string | null,
      activeThreadKind: "welcome" as const,
      updatedAt: Date.now(),
    };
  }

  const selectedProperties = readSelectedProperties(thread);

  return {
    draft: thread.draft,
    messages: thread.messages,
    selectedProperties,
    activeThreadId: thread.id,
    activeThreadKind: thread.activeThreadKind,
    updatedAt: thread.updatedAt,
  };
}

/**
 * WHY:   The buyer home screen needs one async source of truth for the same chat-first product model across mobile and public assistant surfaces.
 * WHAT:  Manages the active conversation, local thread history, and in-app advisor escalation.
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
  const [selectedProperties, setSelectedProperties] = useState<MobileProperty[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadKind, setActiveThreadKind] = useState<"welcome" | "live">("welcome");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const [threadStore, setThreadStore] = useState<MobileGuestThreadStore>(emptyThreadStore());
  const lastUpdatedAt = useRef(Date.now());
  const publicSessionRef = useRef<PublicAssistantSession | null>(null);
  const activeProperty = selectedProperties[0] ?? null;

  useEffect(() => {
    void loadGuestThreadStore().then((store) => {
      const activeThread = readStoredThread(store, store.activeThreadId);
      const nextActiveState = toActiveThreadState(activeThread);
      setThreadStore(store);
      setDraft(nextActiveState.draft);
      setMessages(nextActiveState.messages);
      setSelectedProperties(nextActiveState.selectedProperties);
      setActiveThreadId(nextActiveState.activeThreadId);
      setActiveThreadKind(nextActiveState.activeThreadKind);
      lastUpdatedAt.current = nextActiveState.updatedAt;
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    setThreadStore((currentStore) => {
      const currentRecord = readStoredThread(currentStore, activeThreadId);
      const nextRecord = buildStoredThreadRecord({
        id: activeThreadId,
        draft,
        activeThreadKind,
        activeProperty,
        selectedProperties,
        messages,
        updatedAt: lastUpdatedAt.current,
        existing: currentRecord,
      });

      const preservedThreads = activeThreadId
        ? currentStore.threads.filter((thread) => thread.id !== activeThreadId)
        : currentStore.threads;
      const nextThreads = nextRecord ? upsertStoredThread(preservedThreads, nextRecord) : preservedThreads;
      const nextStore = {
        version: 3 as const,
        activeThreadId: nextRecord?.id ?? null,
        threads: nextThreads,
      };

      void saveGuestThreadStore(nextStore);
      return nextStore;
    });
  }, [activeProperty, activeThreadId, activeThreadKind, draft, isHydrated, messages, selectedProperties]);

  const recentThreads = useMemo(() => listThreadSummaries(threadStore), [threadStore]);
  const latestUserMessage = useMemo(() => readLatestUserMessage(messages), [messages]);

  function ensureThreadIdentity() {
    if (activeThreadId) return activeThreadId;
    const nextThreadId = createLocalThreadId();
    setActiveThreadId(nextThreadId);
    return nextThreadId;
  }

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

  function addPropertyToSelection(property: MobileProperty) {
    ensureThreadIdentity();
    setActiveThreadKind("live");
    setSelectedProperties((current) => {
      if (current.some((item) => item.id === property.id)) {
        return current;
      }
      return dedupeSelectedProperties([...current, property]);
    });
  }

  function removePropertyFromSelection(propertyId: string) {
    setSelectedProperties((current) => current.filter((property) => property.id !== propertyId));
  }

  async function submit(prompt = draft, inputMode: "text" | "voice" = "text") {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const outboundPrompt = applyPropertySelectionPromptToDraft(trimmed, selectedProperties);

    const nextThreadId = ensureThreadIdentity();
    const userMessage: MobileConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
      activePropertyId: activeProperty?.id,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSubmitting(true);
    setActiveThreadKind("live");
    lastUpdatedAt.current = userMessage.createdAt ?? Date.now();

    try {
      let assistantMessage: MobileConversationMessage;

      if (args.askClientAssistant) {
        const response = await args.askClientAssistant({
          message: outboundPrompt,
          threadId: nextThreadId ?? undefined,
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
          suggestedPrompts: mergeSuggestedPrompts(response.suggestedPrompts, nextActiveProperty ?? null),
          activePropertyId: nextActiveProperty?.id,
          requiresAuthForHandoff: response.requiresAuthForHandoff,
          uiTurn: buildMobileAgUiTurn({
            assistantText: response.message,
            properties: response.properties,
            cards: response.cards,
          }),
        };
        if (selectedProperties.length > 1) {
          setSelectedProperties(
            dedupeSelectedProperties(
              selectedProperties.map((property) => response.properties.find((candidate) => candidate.id === property.id) ?? property),
            ),
          );
        } else {
          setSelectedProperties(nextActiveProperty ? [nextActiveProperty] : []);
        }
        setActiveThreadId(response.threadId ?? nextThreadId);
        setShowAuthCallout(response.requiresAuthForHandoff);
      } else {
        assistantMessage = {
          ...buildFallbackAssistantMessage({
            message: outboundPrompt,
            activeProperty,
          }),
          createdAt: Date.now(),
        };
        if (assistantMessage.properties?.[0]) {
          setSelectedProperties([assistantMessage.properties[0]]);
        }
        setActiveThreadId(nextThreadId);
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
        suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty),
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
    ensureThreadIdentity();
    setActiveThreadKind("live");
    setSelectedProperties([property]);
    const focusMessage = {
      ...buildAuthRequiredMessage(),
      id: `assistant-focus-${property.id}-${Date.now()}`,
      text: property.aiSummary ?? `أراجع الآن ${property.title}. سأجهز لك التمويل والعائد والتحقق والخطوات التالية.`,
      properties: [property],
      activePropertyId: property.id,
      suggestedPrompts: mergeSuggestedPrompts(undefined, property),
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
    const contextualMessage =
      selectedProperties.length > 1
        ? `مقارنة بين ${selectedProperties.map((property) => property.title).join("، ")}. ${latestUserMessage ?? messages.at(-1)?.text ?? activeProperty.title}`
        : latestUserMessage ?? messages.at(-1)?.text ?? activeProperty.title;
    setShowAuthCallout(true);
    if (!args.createQualifiedHandoff) {
      setMessages((current) => [...current, { ...buildAdvisorFailureMessage(activeProperty.title), createdAt: Date.now() }]);
      return;
    }

    try {
      const session = args.bootstrapPublicSession ? await ensurePublicSession() : null;
      await args.createQualifiedHandoff({
        propertyId: activeProperty.id,
        message: contextualMessage,
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
          suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty),
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
          suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty),
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
    const nextThread = readStoredThread(threadStore, threadId);
    if (!nextThread) return;

    setDraft(nextThread.draft);
    setMessages(nextThread.messages);
    setSelectedProperties(readSelectedProperties(nextThread));
    setActiveThreadId(nextThread.id);
    setActiveThreadKind(nextThread.activeThreadKind);
    setShowAuthCallout(false);
    lastUpdatedAt.current = nextThread.updatedAt;
  }

  function showSearchResults(args: {
    searchContext: MobileSearchContext;
    results: MobileProperty[];
  }) {
    const message: MobileConversationMessage = {
      id: `assistant-search-${Date.now()}`,
      role: "assistant",
      text: args.searchContext.searchSummary,
      createdAt: Date.now(),
      searchContext: args.searchContext,
      searchResults: args.results,
      suggestedPrompts: [],
    };

    lastUpdatedAt.current = message.createdAt ?? Date.now();
    setMessages((current) => [...current, message]);
  }

  function createNewThread() {
    setDraft("");
    setMessages([]);
    setSelectedProperties([]);
    setActiveThreadId(null);
    setActiveThreadKind("welcome");
    setShowAuthCallout(false);
    lastUpdatedAt.current = Date.now();
  }

  function resetToWelcome() {
    createNewThread();
    void clearGuestThreadStore();
    setThreadStore(emptyThreadStore());
  }

  return {
    draft,
    messages,
    activeProperty,
    selectedProperties,
    activeThreadId,
    activeThreadKind,
    recentThreads,
    isHydrated,
    isSubmitting,
    showAuthCallout,
    latestUserMessage,
    setDraft,
    setShowAuthCallout,
    addPropertyToSelection,
    removePropertyFromSelection,
    submit,
    submitVoiceRecording,
    askAboutProperty,
    requestAdvisor,
    openHistoryThread,
    showSearchResults,
    createNewThread,
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
