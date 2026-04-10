import { useAction, useMutation, useQuery } from "convex/react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { api } from "@/lib/convexApi";
import { formatMobileCopy, getMobileDictionary } from "@/lib/i18n";
import type { MobileAssistantSession } from "@/lib/mobileAssistantSession";
import {
  clearGuestAssistantSession,
  loadGuestAssistantSession,
  saveGuestAssistantSession,
} from "@/lib/mobileAssistantSession";
import type { MobileLocale } from "@/lib/locale";
import {
  buildStoredThreadRecord,
  createLocalThreadId,
  emptyThreadStore,
  listThreadSummaries,
  readStoredThread,
  upsertStoredThread,
} from "@/lib/mobileThreadStore";
import { buildSuggestedPrompts } from "@/lib/mobileData";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";
import {
  buildAssistantSelectionPayload,
  dedupeSelectedProperties,
  readSelectedPropertiesFromMessages,
  resolveSelectedPropertiesFromAssistantResponse,
} from "@/hooks/usePropertyAssistantHelpers";
import {
  clearGuestThreadStore,
  loadGuestThreadStore,
  saveGuestThreadStore,
} from "@/lib/mobilePersistence";
import type {
  MobileConversationMessage,
  MobileGuestThreadStore,
  MobileProperty,
  MobileStoredThread,
  MobileThreadSummary,
} from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

type ClientAssistantResponse = {
  message: string;
  properties: MobileProperty[];
  cards: Array<any>;
  suggestedPrompts: string[];
  activePropertyId?: string;
  requiresAuthForHandoff: boolean;
  threadId?: string;
  comparisonArtifactId?: string;
  comparisonPropertyIds?: string[];
  selectionSource?: "ui_selected" | "history_resolved" | "text_resolved";
};

type AskClientAssistantPayload = {
  message: string;
  threadId?: string;
  startFresh?: boolean;
  selectedPropertyId?: string;
  selectedPropertyIds?: string[];
  inputMode?: "text" | "voice";
  locale: MobileLocale;
};

type AuthenticatedThreadSelection =
  | { mode: "latest" }
  | { mode: "specific"; threadId: string }
  | { mode: "new" };

type PersistedAssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
  properties?: MobileProperty[];
  cards?: Array<any>;
  activePropertyId?: string;
  requiresAuthForHandoff?: boolean;
  suggestedPrompts?: string[];
  comparisonArtifactId?: string;
  comparisonPropertyIds?: string[];
  selectionSource?: "ui_selected" | "history_resolved" | "text_resolved";
};

type AuthenticatedAssistantState = {
  activeThreadId: string | null;
  activeMessages: MobileConversationMessage[];
};

type ControllerArgs = {
  locale: MobileLocale;
  isAuthenticated: boolean;
  authenticatedRecentThreads: MobileThreadSummary[];
  authenticatedState: AuthenticatedAssistantState | undefined;
  authenticatedThreadSelection: AuthenticatedThreadSelection;
  setAuthenticatedThreadSelection: (selection: AuthenticatedThreadSelection) => void;
  sendGuestAssistantMessage:
    | ((payload: AskClientAssistantPayload & MobileAssistantSession) => Promise<ClientAssistantResponse>)
    | null;
  sendAuthenticatedAssistantMessage:
    | ((payload: AskClientAssistantPayload) => Promise<ClientAssistantResponse>)
    | null;
  bootstrapPublicSession:
    | ((payload: { guestId?: string }) => Promise<MobileAssistantSession & { threadId?: string }>)
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
};

function describeFailure(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "unknown_failure";
}

function buildAdvisorSuccessMessage(propertyTitle: string, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  return {
    id: `assistant-handoff-success-${Date.now()}`,
    role: "assistant" as const,
    text: formatMobileCopy(dictionary.assistant.advisorSuccess, { title: propertyTitle }),
    suggestedPrompts: buildSuggestedPrompts(null, locale),
  };
}

function buildAdvisorFailureMessage(propertyTitle: string, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  return {
    id: `assistant-handoff-failure-${Date.now()}`,
    role: "assistant" as const,
    text: formatMobileCopy(dictionary.assistant.advisorFailure, { title: propertyTitle }),
    suggestedPrompts: buildSuggestedPrompts(null, locale),
  };
}

function buildServiceUnavailableMessage(locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  return {
    id: `assistant-service-unavailable-${Date.now()}`,
    role: "assistant" as const,
    text: dictionary.assistant.serviceUnavailable,
    suggestedPrompts: buildSuggestedPrompts(null, locale),
  };
}

function readLatestProperty(messages: MobileConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const property = messages[index]?.properties?.[0];
    if (property) return property;
  }
  return null;
}

function readSelectedProperties(thread: MobileStoredThread | null) {
  if (!thread) return [] as MobileProperty[];
  const storedSelection = dedupeSelectedProperties(thread.selectedProperties ?? []);
  if (storedSelection.length === 1) return storedSelection;
  if (storedSelection.length >= 2) return [] as MobileProperty[];
  const messageSelection = readSelectedPropertiesFromMessages(thread.messages);
  if (messageSelection.length > 0) return messageSelection;
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

function mergeSuggestedPrompts(prompts: string[] | undefined, property: MobileProperty | null, locale: MobileLocale) {
  const dictionary = getMobileDictionary(locale);
  const nextPrompts = [...(prompts ?? buildSuggestedPrompts(property, locale))];
  if (property && !nextPrompts.includes(dictionary.assistant.showMoreResults)) {
    nextPrompts.push(dictionary.assistant.showMoreResults);
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
      assistantThreadId: null as string | null,
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
    assistantThreadId: thread.assistantThreadId ?? null,
    activeThreadKind: thread.activeThreadKind,
    updatedAt: thread.updatedAt,
  };
}

function mapPersistedAssistantMessage(message: PersistedAssistantMessage): MobileConversationMessage {
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    createdAt: message.createdAt,
    properties: message.properties,
    cards: message.cards,
    suggestedPrompts: message.suggestedPrompts,
    activePropertyId: message.activePropertyId,
    requiresAuthForHandoff: message.requiresAuthForHandoff,
    comparisonArtifactId: message.comparisonArtifactId,
    comparisonPropertyIds: message.comparisonPropertyIds,
    selectionSource: message.selectionSource,
    uiTurn:
      message.role === "assistant" && ((message.properties?.length ?? 0) > 0 || (message.cards?.length ?? 0) > 0)
        ? buildMobileAgUiTurn({
            assistantText: message.text,
            properties: message.properties ?? [],
            cards: message.cards ?? [],
          })
        : undefined,
  };
}

/**
 * WHY:   The buyer home screen needs one async source of truth for the same chat-first product model across mobile and public assistant surfaces.
 * WHAT:  Manages the active conversation, guest/local thread history, authenticated saved-thread hydration, and in-app advisor escalation.
 * HOW:   Uses the shared public assistant backend for signed-in buyers, keeps guest continuity local, and persists guest session tokens for post-auth promotion.
 */
function usePropertyAssistantController(args: ControllerArgs) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<MobileConversationMessage[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<MobileProperty[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeAssistantThreadId, setActiveAssistantThreadId] = useState<string | null>(null);
  const [activeThreadKind, setActiveThreadKind] = useState<"welcome" | "live">("welcome");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthCallout, setShowAuthCallout] = useState(false);
  const [threadStore, setThreadStore] = useState<MobileGuestThreadStore>(emptyThreadStore());
  const lastUpdatedAt = useRef(Date.now());
  const publicSessionRef = useRef<MobileAssistantSession | null>(null);
  const draftRef = useRef(draft);
  const activeProperty = selectedProperties[0] ?? null;
  const deferredDraft = useDeferredValue(draft);

  draftRef.current = draft;

  useEffect(() => {
    let cancelled = false;

    void loadGuestAssistantSession().then((session) => {
      if (cancelled) return;
      if (session && session.expiresAt > Date.now()) {
        publicSessionRef.current = session;
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!args.isAuthenticated) return;

    if (args.authenticatedThreadSelection.mode === "new") {
      setDraft("");
      setMessages([]);
      setSelectedProperties([]);
      setActiveThreadId(null);
      setActiveAssistantThreadId(null);
      setActiveThreadKind("welcome");
      setShowAuthCallout(false);
      lastUpdatedAt.current = Date.now();
      setIsHydrated(true);
      return;
    }

    if (!args.authenticatedState) {
      setIsHydrated(false);
      return;
    }

    const nextMessages = args.authenticatedState.activeMessages;
    setDraft("");
    setMessages(nextMessages);
    setSelectedProperties(readSelectedPropertiesFromMessages(nextMessages));
    setActiveThreadId(args.authenticatedState.activeThreadId);
    setActiveAssistantThreadId(args.authenticatedState.activeThreadId);
    setActiveThreadKind(
      args.authenticatedState.activeThreadId || nextMessages.length > 0 ? "live" : "welcome",
    );
    setShowAuthCallout(false);
    lastUpdatedAt.current = nextMessages.at(-1)?.createdAt ?? Date.now();
    setIsHydrated(true);
  }, [
    args.authenticatedState,
    args.authenticatedThreadSelection.mode,
    args.isAuthenticated,
  ]);

  useEffect(() => {
    if (args.isAuthenticated) return;

    let cancelled = false;

    void loadGuestThreadStore().then((store) => {
      if (cancelled) return;
      const activeThread = readStoredThread(store, store.activeThreadId);
      const nextActiveState = toActiveThreadState(activeThread);
      setThreadStore(store);
      setDraft(nextActiveState.draft);
      setMessages(nextActiveState.messages);
      setSelectedProperties(nextActiveState.selectedProperties);
      setActiveThreadId(nextActiveState.activeThreadId);
      setActiveAssistantThreadId(nextActiveState.assistantThreadId);
      setActiveThreadKind(nextActiveState.activeThreadKind);
      lastUpdatedAt.current = nextActiveState.updatedAt;
      setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [args.isAuthenticated]);

  useEffect(() => {
    if (!isHydrated || args.isAuthenticated) return;

    setThreadStore((currentStore) => {
      const currentRecord = readStoredThread(currentStore, activeThreadId);
      const nextRecord = buildStoredThreadRecord({
        id: activeThreadId,
        assistantThreadId: activeAssistantThreadId,
        draft: deferredDraft,
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
  }, [
    activeProperty,
    activeAssistantThreadId,
    activeThreadId,
    activeThreadKind,
    args.isAuthenticated,
    deferredDraft,
    isHydrated,
    messages,
    selectedProperties,
  ]);

  const guestRecentThreads = useMemo(() => listThreadSummaries(threadStore), [threadStore]);
  const recentThreads = args.isAuthenticated ? args.authenticatedRecentThreads : guestRecentThreads;
  const latestUserMessage = useMemo(() => readLatestUserMessage(messages), [messages]);

  function ensureThreadIdentity() {
    if (args.isAuthenticated) return activeThreadId;
    if (activeThreadId) return activeThreadId;
    const nextThreadId = createLocalThreadId();
    setActiveThreadId(nextThreadId);
    return nextThreadId;
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

  async function ensurePublicSession() {
    const current = publicSessionRef.current;
    if (current?.guestId && current.channelSessionToken && current.expiresAt > Date.now()) {
      return current;
    }
    if (!args.bootstrapPublicSession) {
      throw new Error(args.locale === "en" ? "Voice recording is not available right now." : "التسجيل الصوتي غير متاح حالياً.");
    }

    const nextSession = await args.bootstrapPublicSession({
      guestId: current?.guestId,
    });
    const session = {
      guestId: nextSession.guestId,
      channelSessionToken: nextSession.channelSessionToken,
      expiresAt: nextSession.expiresAt,
    } satisfies MobileAssistantSession;
    publicSessionRef.current = session;
    await saveGuestAssistantSession(session);
    return session;
  }

  async function submit(prompt = draftRef.current, inputMode: "text" | "voice" = "text") {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const nextThreadId = args.isAuthenticated ? activeThreadId : ensureThreadIdentity();
    const nextAssistantThreadId = args.isAuthenticated ? activeThreadId : activeAssistantThreadId;
    const shouldStartFresh = args.isAuthenticated
      ? args.authenticatedThreadSelection.mode === "new"
      : !nextAssistantThreadId;
    const selectionPayload = buildAssistantSelectionPayload(selectedProperties);
    const hadComparisonSelection = selectedProperties.length >= 2;
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
      let response: ClientAssistantResponse;
      if (args.isAuthenticated && args.sendAuthenticatedAssistantMessage) {
        response = await args.sendAuthenticatedAssistantMessage({
          message: trimmed,
          threadId: nextAssistantThreadId ?? undefined,
          startFresh: shouldStartFresh,
          ...selectionPayload,
          inputMode,
          locale: args.locale,
        });
      } else if (args.sendGuestAssistantMessage) {
        const session = await ensurePublicSession();
        response = await args.sendGuestAssistantMessage({
          guestId: session.guestId,
          channelSessionToken: session.channelSessionToken,
          expiresAt: session.expiresAt,
          message: trimmed,
          threadId: nextAssistantThreadId ?? undefined,
          startFresh: shouldStartFresh,
          ...selectionPayload,
          inputMode,
          locale: args.locale,
        });
      } else {
        const assistantMessage: MobileConversationMessage = {
          ...buildServiceUnavailableMessage(args.locale),
          createdAt: Date.now(),
        };
        if (!args.isAuthenticated) {
          setActiveThreadId(nextThreadId);
        }
        lastUpdatedAt.current = assistantMessage.createdAt ?? Date.now();
        setMessages((current) => [...current, assistantMessage]);
        return;
      }

      const nextSelectedProperties = resolveSelectedPropertiesFromAssistantResponse({
        response,
        currentSelection: selectedProperties,
        activeProperty,
      });
      const nextActiveProperty =
        nextSelectedProperties.find((property) => property.id === String(response.activePropertyId ?? "")) ??
        nextSelectedProperties[0] ??
        response.properties[0] ??
        activeProperty;

      const assistantMessage: MobileConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response.message,
        createdAt: Date.now(),
        properties: response.properties,
        cards: response.cards,
        suggestedPrompts: mergeSuggestedPrompts(response.suggestedPrompts, nextActiveProperty ?? null, args.locale),
        activePropertyId: nextActiveProperty?.id,
        requiresAuthForHandoff: response.requiresAuthForHandoff,
        comparisonArtifactId: response.comparisonArtifactId,
        comparisonPropertyIds: response.comparisonPropertyIds,
        selectionSource: response.selectionSource,
        uiTurn: buildMobileAgUiTurn({
          assistantText: response.message,
          properties: response.properties,
          cards: response.cards,
        }),
      };

      setSelectedProperties(hadComparisonSelection ? [] : nextSelectedProperties);

      if (args.isAuthenticated) {
        const resolvedThreadId = response.threadId ?? nextAssistantThreadId ?? null;
        if (resolvedThreadId) {
          setAuthenticatedSelection(args.setAuthenticatedThreadSelection, resolvedThreadId);
        } else {
          args.setAuthenticatedThreadSelection({ mode: "new" });
        }
        setActiveThreadId(resolvedThreadId);
        setActiveAssistantThreadId(resolvedThreadId);
      } else {
        setActiveThreadId(nextThreadId);
        setActiveAssistantThreadId(response.threadId ?? nextAssistantThreadId ?? null);
      }
      setShowAuthCallout(response.requiresAuthForHandoff);
      lastUpdatedAt.current = assistantMessage.createdAt ?? Date.now();
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const failureCode = describeFailure(error);
      const failureText =
        failureCode === "NOT_FOUND"
          ? args.locale === "en"
            ? "I couldn't continue with this property right now. Choose another option and I'll keep going with you."
            : "لم أتمكن من متابعة هذا العقار الآن. اختر خياراً آخر وسأكمل معك."
          : args.locale === "en"
            ? "We could not complete the request right now. Please try again in a moment."
            : "تعذر إكمال الطلب حالياً. حاول مرة أخرى بعد لحظات.";
      const fallbackMessage: MobileConversationMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: failureText,
        createdAt: Date.now(),
        properties: activeProperty ? [activeProperty] : undefined,
        suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty, args.locale),
        activePropertyId: activeProperty?.id,
        uiTurn:
          activeProperty
            ? buildMobileAgUiTurn({
                assistantText: failureText,
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

  function setPropertyContext(property: MobileProperty) {
    ensureThreadIdentity();
    setActiveThreadKind("live");
    setSelectedProperties([property]);
    setShowAuthCallout(false);
  }

  async function submitVoiceRecording(fileUri: string) {
    if (!args.generateVoiceUploadUrl || !args.transcribeVoiceFromStorage) {
      throw new Error(args.locale === "en" ? "Voice recording requires a live service connection." : "التسجيل الصوتي يحتاج اتصالاً بالخدمة المباشرة.");
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
      throw new Error(args.locale === "en" ? "Could not upload the voice recording." : "تعذر رفع التسجيل الصوتي.");
    }

    const uploadPayload = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null;
    const storageId = uploadPayload?.storageId?.trim();
    if (!storageId) {
      throw new Error(args.locale === "en" ? "Could not prepare the audio file for transcription." : "تعذر تجهيز الملف الصوتي للتفريغ.");
    }

    const transcript = await args.transcribeVoiceFromStorage({
      guestId: session.guestId,
      channelSessionToken: session.channelSessionToken,
      storageId,
    });
    const text = transcript.text.trim();
    if (!text) {
      throw new Error(args.locale === "en" ? "The recording arrived without transcribable text." : "وصل التسجيل بدون نص قابل للإرسال.");
    }

    await submit(text, "voice");
  }

  async function requestAdvisor() {
    if (!activeProperty) return;
    const contextualMessage =
      selectedProperties.length > 1
        ? args.locale === "en"
          ? `Comparison between ${selectedProperties.map((property) => property.title).join(", ")}. ${latestUserMessage ?? messages.at(-1)?.text ?? activeProperty.title}`
          : `مقارنة بين ${selectedProperties.map((property) => property.title).join("، ")}. ${latestUserMessage ?? messages.at(-1)?.text ?? activeProperty.title}`
        : latestUserMessage ?? messages.at(-1)?.text ?? activeProperty.title;
    setShowAuthCallout(true);
    if (!args.createQualifiedHandoff) {
      setMessages((current) => [...current, { ...buildAdvisorFailureMessage(activeProperty.title, args.locale), createdAt: Date.now() }]);
      return;
    }

    try {
      const session = !args.isAuthenticated && args.bootstrapPublicSession ? await ensurePublicSession() : null;
      await args.createQualifiedHandoff({
        propertyId: activeProperty.id,
        message: contextualMessage,
        externalUserId: session?.guestId,
        threadId: activeAssistantThreadId ?? undefined,
        sourceChannel: "app",
      });

      setShowAuthCallout(false);
      setMessages((current) => {
        const successMessage = {
          ...buildAdvisorSuccessMessage(activeProperty.title, args.locale),
          createdAt: Date.now(),
          activePropertyId: activeProperty.id,
          properties: [activeProperty],
          suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty, args.locale),
          uiTurn: buildMobileAgUiTurn({
            assistantText:
              args.locale === "en"
                ? `The advisor request for ${activeProperty.title} has been submitted.`
                : `تم رفع طلب المستشار الخاص بـ ${activeProperty.title}.`,
            properties: [activeProperty],
          }),
        } satisfies MobileConversationMessage;
        lastUpdatedAt.current = successMessage.createdAt ?? Date.now();
        return [...current, successMessage];
      });
    } catch {
      setMessages((current) => {
        const failureMessage = {
          ...buildAdvisorFailureMessage(activeProperty.title, args.locale),
          createdAt: Date.now(),
          activePropertyId: activeProperty.id,
          properties: [activeProperty],
          suggestedPrompts: mergeSuggestedPrompts(undefined, activeProperty, args.locale),
          uiTurn: buildMobileAgUiTurn({
            assistantText:
              args.locale === "en"
                ? `We could not submit the advisor request for ${activeProperty.title} right now.`
                : `تعذر رفع طلب المستشار لـ ${activeProperty.title} حالياً.`,
            properties: [activeProperty],
          }),
        } satisfies MobileConversationMessage;
        lastUpdatedAt.current = failureMessage.createdAt ?? Date.now();
        return [...current, failureMessage];
      });
    }
  }

  async function openHistoryThread(threadId: string) {
    if (args.isAuthenticated) {
      setAuthenticatedSelection(args.setAuthenticatedThreadSelection, threadId);
      setActiveThreadId(threadId);
      setActiveAssistantThreadId(threadId);
      setShowAuthCallout(false);
      return;
    }

    const nextThread = readStoredThread(threadStore, threadId);
    if (!nextThread) return;

    setDraft(nextThread.draft);
    setMessages(nextThread.messages);
    setSelectedProperties(readSelectedProperties(nextThread));
    setActiveThreadId(nextThread.id);
    setActiveAssistantThreadId(nextThread.assistantThreadId ?? null);
    setActiveThreadKind(nextThread.activeThreadKind);
    setShowAuthCallout(false);
    lastUpdatedAt.current = nextThread.updatedAt;
  }

  function createNewThread() {
    setDraft("");
    setMessages([]);
    setSelectedProperties([]);
    setActiveThreadId(null);
    setActiveAssistantThreadId(null);
    setActiveThreadKind("welcome");
    setShowAuthCallout(false);
    lastUpdatedAt.current = Date.now();
    if (args.isAuthenticated) {
      args.setAuthenticatedThreadSelection({ mode: "new" });
    }
  }

  function resetToWelcome() {
    createNewThread();
    if (!args.isAuthenticated) {
      void clearGuestThreadStore();
      void clearGuestAssistantSession();
      setThreadStore(emptyThreadStore());
    }
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
    setPropertyContext,
    requestAdvisor,
    openHistoryThread,
    createNewThread,
    resetToWelcome,
  };
}

function setAuthenticatedSelection(
  setter: (selection: AuthenticatedThreadSelection) => void,
  threadId: string | null,
) {
  if (threadId) {
    setter({ mode: "specific", threadId });
    return;
  }
  setter({ mode: "latest" });
}

function useLivePropertyAssistant() {
  const account = useBuyerAccount();
  const sendGuestAssistantMessage = useAction(api.ai_zone.assistantPublic.sendMessage);
  const sendAuthenticatedAssistantMessage = useAction(api.ai_zone.assistantPublic.sendAuthenticatedMessage);
  const bootstrapPublicSession = useMutation(api.ai_zone.assistantPublic.bootstrapSession);
  const generateVoiceUploadUrl = useMutation(api.ai_zone.assistantPublic.generateVoiceUploadUrl);
  const transcribeVoiceFromStorage = useAction(api.ai_zone.assistantPublic.transcribeVoiceFromStorage);
  const createQualifiedHandoff = useMutation(api.user_zone.mobile.assistant.createQualifiedHandoff);
  const [authenticatedThreadSelection, setAuthenticatedThreadSelection] = useState<AuthenticatedThreadSelection>({
    mode: "latest",
  });

  useEffect(() => {
    if (!account.viewer.isAuthenticated) {
      setAuthenticatedThreadSelection({ mode: "latest" });
    }
  }, [account.viewer.isAuthenticated]);

  const authenticatedThreadState = useQuery(
    api.user_zone.mobile.account.getAssistantState,
    account.viewer.isAuthenticated && authenticatedThreadSelection.mode !== "new"
      ? ({
          ...(authenticatedThreadSelection.mode === "specific"
            ? { threadId: authenticatedThreadSelection.threadId as never }
            : {}),
        } as never)
      : "skip",
  ) as
    | {
        activeThreadId?: string;
        activeMessages: PersistedAssistantMessage[];
      }
    | undefined;

  const authenticatedState = useMemo<AuthenticatedAssistantState | undefined>(() => {
    if (!account.viewer.isAuthenticated) return undefined;
    if (authenticatedThreadSelection.mode === "new") {
      return {
        activeThreadId: null,
        activeMessages: [],
      };
    }
    if (!authenticatedThreadState) return undefined;
    return {
      activeThreadId: authenticatedThreadState.activeThreadId ?? null,
      activeMessages: authenticatedThreadState.activeMessages.map(mapPersistedAssistantMessage),
    };
  }, [account.viewer.isAuthenticated, authenticatedThreadSelection.mode, authenticatedThreadState]);

  return usePropertyAssistantController({
    locale: account.viewer.preferences.locale,
    isAuthenticated: account.viewer.isAuthenticated,
    authenticatedRecentThreads: account.recentThreads,
    authenticatedState,
    authenticatedThreadSelection,
    setAuthenticatedThreadSelection,
    sendGuestAssistantMessage: sendGuestAssistantMessage as never,
    sendAuthenticatedAssistantMessage: sendAuthenticatedAssistantMessage as never,
    bootstrapPublicSession: bootstrapPublicSession as never,
    generateVoiceUploadUrl: generateVoiceUploadUrl as never,
    transcribeVoiceFromStorage: transcribeVoiceFromStorage as never,
    createQualifiedHandoff: createQualifiedHandoff as never,
  });
}

function useUnavailablePropertyAssistant() {
  const account = useBuyerAccount();
  return usePropertyAssistantController({
    locale: account.viewer.preferences.locale,
    isAuthenticated: false,
    authenticatedRecentThreads: [],
    authenticatedState: undefined,
    authenticatedThreadSelection: { mode: "latest" },
    setAuthenticatedThreadSelection() {},
    sendGuestAssistantMessage: null,
    sendAuthenticatedAssistantMessage: null,
    bootstrapPublicSession: null,
    generateVoiceUploadUrl: null,
    transcribeVoiceFromStorage: null,
    createQualifiedHandoff: null,
  });
}

export function usePropertyAssistant() {
  return LIVE_BACKEND_ENABLED ? useLivePropertyAssistant() : useUnavailablePropertyAssistant();
}
