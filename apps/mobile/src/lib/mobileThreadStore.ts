import { buildBuyerThreadTitle } from "@/lib/buyerAssistantShared";
import type {
  MobileConversationMessage,
  MobileGuestSnapshot,
  MobileGuestThreadStore,
  MobileProperty,
  MobileStoredThread,
  MobileStoredThreadKind,
  MobileThreadSummary,
} from "@/types/mobile";

const EMPTY_THREAD_STORE: MobileGuestThreadStore = {
  version: 3,
  activeThreadId: null,
  threads: [],
};

function normalizeSelectedProperties(properties: MobileProperty[] | undefined, activeProperty: MobileProperty | null) {
  const seen = new Set<string>();
  const source = properties && properties.length > 0 ? properties : activeProperty ? [activeProperty] : [];
  return source.filter((property) => {
    const propertyId = property?.id?.trim();
    if (!propertyId || seen.has(propertyId)) return false;
    seen.add(propertyId);
    return true;
  });
}

function normalizeTextPreview(messages: MobileConversationMessage[]) {
  return (
    messages
      .slice()
      .reverse()
      .find((message) => message.role === "assistant" || message.role === "user")?.text
      ?.slice(0, 120) ?? undefined
  );
}

export function createLocalThreadId() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hasThreadContent(args: {
  draft: string;
  activeProperty: MobileProperty | null;
  selectedProperties?: MobileProperty[];
  messages: MobileConversationMessage[];
}) {
  return (
    args.messages.length > 0 ||
    args.draft.trim().length > 0 ||
    Boolean(args.activeProperty) ||
    (args.selectedProperties?.length ?? 0) > 0
  );
}

/**
 * WHY:   Mobile thread persistence needs one shared reducer-friendly shape instead of screen-specific serialization.
 * WHAT:  Builds a stored thread record from the current assistant state when there is meaningful content to retain.
 * HOW:   Keeps timestamps stable, derives the title from the transcript, and skips truly empty welcome threads.
 */
export function buildStoredThreadRecord(args: {
  id: string | null;
  draft: string;
  activeThreadKind: MobileStoredThreadKind;
  activeProperty: MobileProperty | null;
  selectedProperties: MobileProperty[];
  messages: MobileConversationMessage[];
  updatedAt: number;
  existing?: MobileStoredThread | null;
}): MobileStoredThread | null {
  if (!args.id) return null;
  if (!hasThreadContent(args)) return null;

  const createdAt =
    args.existing?.createdAt ??
    args.messages.find((message) => typeof message.createdAt === "number")?.createdAt ??
    args.updatedAt;

  return {
    id: args.id,
    draft: args.draft,
    activeThreadKind: args.activeThreadKind,
    activeProperty: args.activeProperty,
    selectedProperties: normalizeSelectedProperties(args.selectedProperties, args.activeProperty),
    messages: args.messages,
    createdAt,
    updatedAt: args.updatedAt,
  };
}

export function upsertStoredThread(threads: MobileStoredThread[], nextThread: MobileStoredThread) {
  const existingIndex = threads.findIndex((thread) => thread.id === nextThread.id);
  if (existingIndex === -1) {
    return [nextThread, ...threads].sort((left, right) => right.updatedAt - left.updatedAt);
  }

  const nextThreads = threads.slice();
  nextThreads[existingIndex] = nextThread;
  return nextThreads.sort((left, right) => right.updatedAt - left.updatedAt);
}

export function buildThreadSummary(thread: MobileStoredThread): MobileThreadSummary {
  return {
    id: thread.id,
    title: buildBuyerThreadTitle(thread.messages),
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    preview: normalizeTextPreview(thread.messages),
  };
}

export function listThreadSummaries(store: MobileGuestThreadStore) {
  return store.threads
    .slice()
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map(buildThreadSummary);
}

export function readStoredThread(store: MobileGuestThreadStore, threadId?: string | null) {
  if (!threadId) return null;
  return store.threads.find((thread) => thread.id === threadId) ?? null;
}

export function createThreadStore(args: { activeThreadId: string | null; threads: MobileStoredThread[] }): MobileGuestThreadStore {
  return {
    version: 3,
    activeThreadId: args.activeThreadId,
    threads: args.threads.slice().sort((left, right) => right.updatedAt - left.updatedAt),
  };
}

/**
 * WHY:   Existing installs may still have the old single-thread snapshot on disk and should not lose that history.
 * WHAT:  Converts the legacy snapshot into the new multi-thread local store format.
 * HOW:   Wraps the old active transcript into one stored thread and marks it as the active thread in the new store.
 */
export function migrateLegacyGuestSnapshot(value: unknown): MobileGuestThreadStore | null {
  if (!value || typeof value !== "object") return null;
  const legacy = value as Partial<MobileGuestSnapshot>;
  if (!Array.isArray(legacy.messages)) return null;

  const activeThreadId = typeof legacy.activeThreadId === "string" && legacy.activeThreadId.trim() ? legacy.activeThreadId : createLocalThreadId();
  const updatedAt = typeof legacy.updatedAt === "number" ? legacy.updatedAt : Date.now();
  const legacyThread = buildStoredThreadRecord({
    id: activeThreadId,
    draft: typeof legacy.draft === "string" ? legacy.draft : "",
    activeThreadKind: legacy.activeThreadKind === "live" ? "live" : "welcome",
    activeProperty: legacy.activeProperty ?? null,
    selectedProperties: normalizeSelectedProperties(legacy.selectedProperties, legacy.activeProperty ?? null),
    messages: legacy.messages,
    updatedAt,
  });

  if (!legacyThread) return EMPTY_THREAD_STORE;
  return createThreadStore({
    activeThreadId,
    threads: [legacyThread],
  });
}

export function parseThreadStore(value: unknown): MobileGuestThreadStore | null {
  if (!value || typeof value !== "object") return null;
  const maybeStore = value as Partial<MobileGuestThreadStore>;
  const maybeVersion = (value as { version?: number }).version;
  if ((maybeVersion === 2 || maybeVersion === 3) && Array.isArray(maybeStore.threads)) {
    return createThreadStore({
      activeThreadId: typeof maybeStore.activeThreadId === "string" ? maybeStore.activeThreadId : null,
      threads: (maybeStore.threads.filter(Boolean) as MobileStoredThread[]).map((thread) => ({
        ...thread,
        selectedProperties: normalizeSelectedProperties(thread.selectedProperties, thread.activeProperty ?? null),
      })),
    });
  }

  return migrateLegacyGuestSnapshot(value);
}

export function emptyThreadStore() {
  return EMPTY_THREAD_STORE;
}
