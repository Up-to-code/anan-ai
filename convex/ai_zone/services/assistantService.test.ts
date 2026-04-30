import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestThread, handleAssistantMessage, listThreadMessages } from "./assistantService";

const { mockRunAssistantSurfaceRuntime, mockResolveWorkspaceAgUiTurn } = vi.hoisted(() => ({
  mockRunAssistantSurfaceRuntime: vi.fn(async ({ surface }: { surface: "default" | "workspace" }) => ({
    output:
      surface === "workspace"
        ? "workspace orchestrator output"
        : "default orchestrator output",
    runtime: "anan-native" as const,
  })),
  mockResolveWorkspaceAgUiTurn: vi.fn(() => null),
}));

const mockedApi = vi.hoisted(() => ({
  api: {
    ai_zone: {
      assistant: {
        getThread: Symbol("assistant.getThread"),
        getRuntimeContextBundle: Symbol("assistant.getRuntimeContextBundle"),
      },
      assistantWorkspace: {
        createThread: Symbol("assistantWorkspace.createThread"),
        getThread: Symbol("assistantWorkspace.getThread"),
        getRuntimeContextBundle: Symbol("assistantWorkspace.getRuntimeContextBundle"),
        listMessages: Symbol("assistantWorkspace.listMessages"),
      },
    },
    shared_logic: {
      knowledge: {
        index: {
          retrieveCompanyKnowledge: Symbol("knowledge.retrieveCompanyKnowledge"),
        },
      },
      subscriptions: {
        index: {
          getAssistantEntitlement: Symbol("subscriptions.getAssistantEntitlement"),
          getAssistantEntitlementSafe: Symbol("subscriptions.getAssistantEntitlementSafe"),
        },
      },
    },
  },
  internal: {
    shared_logic: {
      memory: {
        repository: {
          getRelevantMemoriesByQuery: Symbol("memory.getRelevantMemoriesByQuery"),
        },
      },
    },
    ai_zone: {
      assistant: { _saveConversationStep: Symbol("assistant._saveConversationStep") },
      assistantWorkspace: { _saveConversationStep: Symbol("assistantWorkspace._saveConversationStep") },
      agents: {
        shared: {
          tokenTrackerActions: {
            trackTokenUsageInternal: Symbol("tokenTrackerActions.trackTokenUsageInternal"),
          },
        },
      },
    },
  },
}));

vi.mock("./assistantSurfaceRuntime", () => ({ runAssistantSurfaceRuntime: mockRunAssistantSurfaceRuntime }));
vi.mock("./agUi", () => ({ resolveWorkspaceAgUiTurn: mockResolveWorkspaceAgUiTurn }));
vi.mock("../../_generated/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../_generated/api")>();
  return {
    ...actual,
    ...mockedApi,
    api: {
      ...actual.api,
      ...mockedApi.api,
    },
    internal: {
      ...actual.internal,
      ...mockedApi.internal,
    },
  };
});

function resetAssistantMocks() {
  mockRunAssistantSurfaceRuntime.mockClear();
  mockResolveWorkspaceAgUiTurn.mockClear();
}

function createHandleMessageCtx() {
  const runQuery = vi.fn(async (ref: unknown, args?: any) => {
    if (
      ref === mockedApi.api.ai_zone.assistantWorkspace.getRuntimeContextBundle ||
      ref === mockedApi.api.ai_zone.assistant.getRuntimeContextBundle
    ) {
      return {
        thread: { _id: "thread_123" },
        owner: { userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1" },
        entitlement: { mode: "qa" },
        existingMessages: [],
        regenerateSource: null,
        effectiveUserMessage: args?.message ?? "hello",
        knowledge: [],
      };
    }
    if (
      ref === mockedApi.api.ai_zone.assistantWorkspace.getThread ||
      ref === mockedApi.api.ai_zone.assistant.getThread
    ) {
      return {
        thread: { _id: "thread_123" },
        owner: { userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1" },
      };
    }
    if (
      ref === mockedApi.api.shared_logic.subscriptions.index.getAssistantEntitlement ||
      ref === mockedApi.api.shared_logic.subscriptions.index.getAssistantEntitlementSafe
    ) {
      return { mode: "qa" };
    }
    if (ref === mockedApi.api.ai_zone.assistantWorkspace.listMessages) {
      return [];
    }
    if (ref === mockedApi.api.shared_logic.knowledge.index.retrieveCompanyKnowledge) {
      return [];
    }
    if (ref === mockedApi.internal.shared_logic.memory.repository.getRelevantMemoriesByQuery) {
      return {
        summary: "",
        preferences: [],
        constraints: [],
        recentInteractions: [],
        lastSearchSummary: null,
      };
    }
    throw new Error("Unexpected query ref");
  });

  const runMutation = vi.fn(async () => ({
    threadId: "thread_123",
    assistantMessageId: "assistant_message_1",
  }));

  return { runQuery, runMutation };
}

function createFreshThreadHandleMessageCtx() {
  let mutationCall = 0;

  const runQuery = vi.fn(async (ref: unknown, args?: any) => {
    if (ref === mockedApi.api.ai_zone.assistantWorkspace.getRuntimeContextBundle) {
      return {
        thread: { _id: "legacy_thread" },
        owner: { userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1" },
        entitlement: { mode: "qa" },
        existingMessages: [],
        regenerateSource: null,
        effectiveUserMessage: args?.message ?? "ابدأ محادثة جديدة",
        knowledge: [],
      };
    }
    if (ref === mockedApi.internal.shared_logic.memory.repository.getRelevantMemoriesByQuery) {
      return {
        summary: "",
        preferences: [],
        constraints: [],
        recentInteractions: [],
        lastSearchSummary: null,
      };
    }
    throw new Error("Unexpected query ref");
  });

  const runMutation = vi.fn(async (_ref: unknown, args?: unknown) => {
    mutationCall += 1;
    if (mutationCall === 1) {
      expect(args).toEqual({ title: "ابدأ محادثة جديدة" });
      return { threadId: "fresh_thread" };
    }
    return { threadId: "fresh_thread", assistantMessageId: "assistant_message_1" };
  });

  return { runQuery, runMutation };
}

function registerWorkspaceAssistantTest() {
  it("uses workspace save mutation and sanitized payload for workspace assistant", async () => {
    const ctx = createHandleMessageCtx();
    const result = await handleAssistantMessage(ctx as any, {
      message: "أضف عقار جديد",
      assistantKind: "anan_workspace",
      orchestratorName: "anan_workspace_orchestrator",
      promptPrefix: "[Anan Workspace Operator]",
    });

    expect(mockRunAssistantSurfaceRuntime).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(2);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);

    const [, workspacePayload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(workspacePayload).toEqual(expect.objectContaining({
      threadId: "thread_123",
      userId: "user_1",
      ownerType: "broker",
      ownerBrokerId: "broker_1",
      userMessage: "أضف عقار جديد",
      assistantMessage: expect.stringContaining("workspace orchestrator output"),
      mode: "qa",
    }));
    expect(workspacePayload.assistantKind).toBeUndefined();
    expect(workspacePayload.orchestratorName).toBeUndefined();
    expect(result).toEqual(expect.objectContaining({
      ok: true,
      threadId: "thread_123",
      output: expect.stringContaining("workspace orchestrator output"),
    }));
  });
}

function registerDefaultAssistantTest() {
  it("uses default save mutation and sanitized payload for default assistant", async () => {
    const ctx = createHandleMessageCtx();
    const result = await handleAssistantMessage(ctx as any, { message: "hello" });

    expect(mockRunAssistantSurfaceRuntime).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(2);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);

    const [, defaultPayload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(defaultPayload).toEqual(expect.objectContaining({
      threadId: "thread_123",
      userId: "user_1",
      ownerType: "broker",
      ownerBrokerId: "broker_1",
      userMessage: "hello",
      assistantMessage: "default orchestrator output",
      mode: "qa",
    }));
    expect(defaultPayload.assistantKind).toBeUndefined();
    expect(defaultPayload.orchestratorName).toBeUndefined();
    expect(result).toEqual(expect.objectContaining({
      ok: true,
      threadId: "thread_123",
      output: "default orchestrator output",
    }));
  });
}

function registerVoiceMetadataTest() {
  it("persists voice input mode metadata when provided", async () => {
    const ctx = createHandleMessageCtx();
    await handleAssistantMessage(ctx as any, {
      message: "رسالة صوتية",
      assistantKind: "anan_workspace",
      inputMode: "voice",
    });

    const [, payload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual(expect.objectContaining({
      userMessageMetadata: { inputMode: "voice" },
    }));
  });

}

function registerFreshWorkspaceThreadTest() {
  it("creates a fresh workspace thread when requested instead of reusing the latest one", async () => {
    const ctx = createFreshThreadHandleMessageCtx();
    const result = await handleAssistantMessage(ctx as any, {
      message: "ابدأ محادثة جديدة",
      startNewThread: true,
      assistantKind: "anan_workspace",
      orchestratorName: "anan_workspace_orchestrator",
      promptPrefix: "[Anan Workspace Operator]",
    });

    expect(mockRunAssistantSurfaceRuntime).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(2);
    expect(ctx.runMutation).toHaveBeenCalledTimes(2);

    const [, createThreadPayload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(createThreadPayload).toEqual({ title: "ابدأ محادثة جديدة" });

    const [, savePayload] = (ctx.runMutation as any).mock.calls[1] as [unknown, Record<string, unknown>];
    expect(savePayload).toEqual(expect.objectContaining({
      threadId: "fresh_thread",
      userMessage: "ابدأ محادثة جديدة",
      assistantMessage: expect.stringContaining("workspace orchestrator output"),
    }));
    expect(result).toEqual(expect.objectContaining({ threadId: "fresh_thread" }));
  });
}

function registerHandleAssistantMessageSuite() {
  beforeEach(resetAssistantMocks);
  registerWorkspaceAssistantTest();
  registerDefaultAssistantTest();
  registerVoiceMetadataTest();
  registerFreshWorkspaceThreadTest();
}

type ThreadRow = {
  _id: string;
  userId: string;
  scope?: string;
  ownerType: string;
  ownerBrokerId: string;
  assistantKind: string;
  updatedAt: number;
};

type MessageRow = {
  _id: string;
  threadId: string;
  role: string;
  content: string;
  mode: string;
  createdAt: number;
};

const threadRows: ThreadRow[] = [
  {
    _id: "legacy-thread",
    userId: "user_1",
    ownerType: "broker",
    ownerBrokerId: "broker_1",
    assistantKind: "anan_workspace",
    updatedAt: 10,
  },
  {
    _id: "org-thread",
    userId: "user_2",
    scope: "organization",
    ownerType: "broker",
    ownerBrokerId: "broker_1",
    assistantKind: "anan_workspace",
    updatedAt: 20,
  },
  {
    _id: "foreign-org-thread",
    userId: "user_9",
    scope: "organization",
    ownerType: "broker",
    ownerBrokerId: "broker_2",
    assistantKind: "anan_workspace",
    updatedAt: 30,
  },
];

const messageRows: MessageRow[] = [
  { _id: "m-2", threadId: "org-thread", role: "assistant", content: "رد", mode: "qa", createdAt: 2 },
  { _id: "m-1", threadId: "org-thread", role: "user", content: "طلب", mode: "qa", createdAt: 1 },
];

function createIndexedQuery(items: Array<Record<string, unknown>>) {
  return {
    withIndex: (_index: string, selector: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      const filters: Array<{ field: string; value: unknown }> = [];
      const q = {
        eq: (field: string, value: unknown) => {
          filters.push({ field, value });
          return q;
        },
      };
      selector(q);
      return {
        collect: async () =>
          items.filter((item) =>
            filters.every(({ field, value }) => String(item[field]) === String(value)),
          ),
        first: async () =>
          items.find((item) =>
            filters.every(({ field, value }) => String(item[field]) === String(value)),
          ) ?? null,
      };
    },
  };
}

function createQueryCtx() {
  return {
    db: {
      get: vi.fn(async (id: string) => threadRows.find((thread) => thread._id === id) ?? null),
      normalizeId: vi.fn((_table: string, id: string) => id),
      query: vi.fn((table: string) => {
        if (table === "assistantThreads") return createIndexedQuery(threadRows as any[]);
        if (table === "assistantMessages") return createIndexedQuery(messageRows as any[]);
        if (table === "assistantThreadState") return createIndexedQuery([]);
        if (table === "assistantMessageState") return createIndexedQuery([]);
        throw new Error(`Unexpected table: ${table}`);
      }),
    },
  };
}

const owner = {
  userId: "user_1",
  ownerType: "broker" as const,
  ownerBrokerId: "broker_1" as any,
};

function registerLatestThreadScopeTest() {
  it("prefers organization-scoped workspace thread when available", async () => {
    const ctx = createQueryCtx();
    const latest = await getLatestThread(ctx as any, owner, "anan_workspace");
    expect(latest?._id).toBe("org-thread");
  });
}

function registerThreadMessagesScopeTest() {
  it("allows org members to read shared org-scoped messages while keeping foreign org blocked", async () => {
    const ctx = createQueryCtx();
    const sharedMessages = await listThreadMessages(ctx as any, owner, "org-thread" as any, "anan_workspace");
    expect(sharedMessages.map((message) => message._id)).toEqual(["m-1", "m-2"]);

    const blockedMessages = await listThreadMessages(ctx as any, owner, "foreign-org-thread" as any, "anan_workspace");
    expect(blockedMessages).toEqual([]);
  });
}

function registerThreadScopeSuite() {
  registerLatestThreadScopeTest();
  registerThreadMessagesScopeTest();
}

describe("assistantService handleAssistantMessage", registerHandleAssistantMessageSuite);
describe("assistantService thread scope access", registerThreadScopeSuite);
