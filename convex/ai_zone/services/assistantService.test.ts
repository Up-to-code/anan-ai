import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestThread, handleAssistantMessage, listThreadMessages } from "./assistantService";

const { mockRunAssistantSurfaceRuntime, mockResolveWorkspaceAgUiTurn } = vi.hoisted(() => ({
  mockRunAssistantSurfaceRuntime: vi.fn(async ({ surface }: { surface: "default" | "workspace" }) => ({
    output:
      surface === "workspace"
        ? "workspace orchestrator output"
        : "default orchestrator output",
    runtime: "open-multi-agent" as const,
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
      buyerContext: {
        getCompiledBuyerContextInternal: Symbol("buyerContext.getCompiledBuyerContextInternal"),
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

vi.mock("../openMultiAgent", () => ({ runAssistantSurfaceRuntime: mockRunAssistantSurfaceRuntime }));
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
    expect(ctx.runQuery).toHaveBeenCalledTimes(1);
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
    expect(ctx.runQuery).toHaveBeenCalledTimes(1);
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

  it("uses safe entitlement lookup for public assistant guest sessions", async () => {
    const ctx = createHandleMessageCtx();
    const publicSaveMutation = Symbol("assistantPublic._saveConversationStep");

    (ctx.runMutation as any).mockImplementation(async (ref: unknown) => {
      if (ref === mockedApi.internal.shared_logic.buyerContext.getCompiledBuyerContextInternal) {
        return {
          compiledPromptContext: "[Buyer Context Compiler]\nIntent: search",
          promptBudgetMeta: {
            contextTokens: 10,
            memoryTokens: 8,
            ragTokens: 6,
            historyTokens: 4,
            totalContextTokens: 28,
            budgetCap: 1200,
            cacheHit: false,
            includedBlocks: ["search_journey"],
            droppedBlocks: [],
          },
        };
      }
      if (ref === mockedApi.internal.ai_zone.agents.shared.tokenTrackerActions.trackTokenUsageInternal) {
        return null;
      }
      return {
        threadId: "thread_123",
        assistantMessageId: "assistant_message_1",
      };
    });

    const result = await handleAssistantMessage(ctx as any, {
      message: "hello from public",
      assistantKind: "anan_main_public",
      ownerOverride: {
        userId: "channel:main_assistant_web:guest_1",
        ownerType: "user",
      },
      saveConversationStepMutationOverride: publicSaveMutation,
    });

    expect(ctx.runQuery).toHaveBeenCalledWith(
      mockedApi.api.shared_logic.subscriptions.index.getAssistantEntitlementSafe,
      {},
    );
    expect(ctx.runQuery).not.toHaveBeenCalledWith(
      mockedApi.api.shared_logic.subscriptions.index.getAssistantEntitlement,
      {},
    );

    const [mutationRef, payload] = (ctx.runMutation as any).mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(mutationRef).toBe(mockedApi.internal.shared_logic.buyerContext.getCompiledBuyerContextInternal);
    expect(payload).toEqual(expect.objectContaining({
      channel: "web",
      userId: "channel:main_assistant_web:guest_1",
      message: "hello from public",
    }));

    const [saveMutationRef, savePayload] = (ctx.runMutation as any).mock.calls[2] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(saveMutationRef).toBe(publicSaveMutation);
    expect(savePayload).toEqual(expect.objectContaining({
      userId: "channel:main_assistant_web:guest_1",
      ownerType: "user",
      userMessage: "hello from public",
      mode: "qa",
    }));

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      output: "default orchestrator output",
      promptBudgetMeta: expect.objectContaining({
        totalContextTokens: 28,
      }),
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
    expect(ctx.runQuery).toHaveBeenCalledTimes(1);
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
