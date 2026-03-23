import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestThread, handleAssistantMessage, listThreadMessages } from "./assistantService";

const { mockOrchestrateDefault, mockOrchestrateWorkspace, mockResolveWorkspaceAgUiTurn } = vi.hoisted(() => ({
  mockOrchestrateDefault: vi.fn(async () => ({ output: "default orchestrator output" })),
  mockOrchestrateWorkspace: vi.fn(async () => ({ output: "workspace orchestrator output" })),
  mockResolveWorkspaceAgUiTurn: vi.fn(() => null),
}));

vi.mock("../agents/anan", () => ({ orchestrate: mockOrchestrateDefault }));
vi.mock("../agents/anan_workspace", () => ({ orchestrate: mockOrchestrateWorkspace }));
vi.mock("./agUi", () => ({ resolveWorkspaceAgUiTurn: mockResolveWorkspaceAgUiTurn }));

function resetAssistantMocks() {
  mockOrchestrateDefault.mockClear();
  mockOrchestrateWorkspace.mockClear();
  mockResolveWorkspaceAgUiTurn.mockClear();
}

function createHandleMessageCtx() {
  let call = 0;
  const runQuery = vi.fn(async () => {
    call += 1;
    if (call === 1) {
      return { thread: { _id: "thread_123" }, owner: { userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1" } };
    }
    if (call === 2) return { mode: "qa" };
    return [];
  });
  const runMutation = vi.fn(async () => ({ threadId: "thread_123", assistantMessageId: "assistant_message_1" }));
  return { runQuery, runMutation };
}

function createFreshThreadHandleMessageCtx() {
  let call = 0;
  let mutationCall = 0;
  const runQuery = vi.fn(async (...args: unknown[]) => {
    call += 1;
    if (call === 1) {
      return { thread: { _id: "legacy_thread" }, owner: { userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1" } };
    }
    if (call === 2) return { mode: "qa" };
    if (call === 3) {
      const payload = args[1] as { threadId?: string } | undefined;
      expect(payload?.threadId).toBe("fresh_thread");
      return [];
    }
    return [];
  });
  const runMutation = vi.fn(async (...args: unknown[]) => {
    mutationCall += 1;
    if (mutationCall === 1) {
      const payload = args[1] as { title?: string } | undefined;
      expect(payload?.title).toBe("ابدأ محادثة جديدة");
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

    expect(mockOrchestrateWorkspace).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(4);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);

    const [, workspacePayload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(workspacePayload).toEqual(expect.objectContaining({ threadId: "thread_123", userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1", userMessage: "أضف عقار جديد", assistantMessage: expect.stringContaining("workspace orchestrator output"), mode: "qa" }));
    expect(workspacePayload.assistantKind).toBeUndefined();
    expect(workspacePayload.orchestratorName).toBeUndefined();
    expect(result).toEqual(expect.objectContaining({ ok: true, threadId: "thread_123", output: expect.stringContaining("workspace orchestrator output") }));
  });
}

function registerDefaultAssistantTest() {
  it("uses default save mutation and sanitized payload for default assistant", async () => {
    const ctx = createHandleMessageCtx();
    const result = await handleAssistantMessage(ctx as any, { message: "hello" });

    expect(mockOrchestrateDefault).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(3);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);

    const [, defaultPayload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(defaultPayload).toEqual(expect.objectContaining({ threadId: "thread_123", userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1", userMessage: "hello", assistantMessage: "default orchestrator output", mode: "qa" }));
    expect(defaultPayload.assistantKind).toBeUndefined();
    expect(defaultPayload.orchestratorName).toBeUndefined();
    expect(result).toEqual(expect.objectContaining({ ok: true, threadId: "thread_123", output: "default orchestrator output" }));
  });
}

function registerVoiceMetadataTest() {
  it("persists voice input mode metadata when provided", async () => {
    const ctx = createHandleMessageCtx();
    await handleAssistantMessage(ctx as any, { message: "رسالة صوتية", assistantKind: "anan_workspace", inputMode: "voice" });

    const [, payload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual(expect.objectContaining({ userMessageMetadata: { inputMode: "voice" } }));
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

    expect(mockOrchestrateWorkspace).toHaveBeenCalledTimes(1);
    expect(ctx.runQuery).toHaveBeenCalledTimes(4);
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

type ThreadRow = { _id: string; userId: string; scope?: string; ownerType: string; ownerBrokerId: string; assistantKind: string; updatedAt: number };
type MessageRow = { _id: string; threadId: string; role: string; content: string; mode: string; createdAt: number };

const threadRows: ThreadRow[] = [
  { _id: "legacy-thread", userId: "user_1", ownerType: "broker", ownerBrokerId: "broker_1", assistantKind: "anan_workspace", updatedAt: 10 },
  { _id: "org-thread", userId: "user_2", scope: "organization", ownerType: "broker", ownerBrokerId: "broker_1", assistantKind: "anan_workspace", updatedAt: 20 },
  { _id: "foreign-org-thread", userId: "user_9", scope: "organization", ownerType: "broker", ownerBrokerId: "broker_2", assistantKind: "anan_workspace", updatedAt: 30 },
];

const messageRows: MessageRow[] = [
  { _id: "m-2", threadId: "org-thread", role: "assistant", content: "رد", mode: "qa", createdAt: 2 },
  { _id: "m-1", threadId: "org-thread", role: "user", content: "طلب", mode: "qa", createdAt: 1 },
];

function createIndexedQuery(items: Array<Record<string, unknown>>) {
  return {
    withIndex: (_index: string, selector: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      const filters: Array<{ field: string; value: unknown }> = [];
      const q = { eq: (field: string, value: unknown) => { filters.push({ field, value }); return q; } };
      selector(q);
      return { collect: async () => items.filter((item) => filters.every(({ field, value }) => String(item[field]) === String(value))) };
    },
  };
}

function createQueryCtx() {
  return {
    db: {
      get: vi.fn(async (id: string) => threadRows.find((thread) => thread._id === id) ?? null),
      query: vi.fn((table: string) => {
        if (table === "assistantThreads") return createIndexedQuery(threadRows as any[]);
        if (table === "assistantMessages") return createIndexedQuery(messageRows as any[]);
        throw new Error(`Unexpected table: ${table}`);
      }),
    },
  };
}

const owner = { userId: "user_1", ownerType: "broker" as const, ownerBrokerId: "broker_1" as any };

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
