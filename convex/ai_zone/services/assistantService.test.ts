import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLatestThread, handleAssistantMessage, listThreadMessages } from "./assistantService";
import { apiRefs, internalRefs } from "../../shared_logic/lib/generatedApiRefs";

const {
  mockOrchestrateDefault,
  mockOrchestrateWorkspace,
  mockResolveWorkspaceAgUiTurn,
} = vi.hoisted(() => ({
  mockOrchestrateDefault: vi.fn(async () => ({ output: "default orchestrator output" })),
  mockOrchestrateWorkspace: vi.fn(async () => ({ output: "workspace orchestrator output" })),
  mockResolveWorkspaceAgUiTurn: vi.fn(() => null),
}));

vi.mock("../agents/anan", () => ({
  orchestrate: mockOrchestrateDefault,
}));

vi.mock("../agents/anan_workspace", () => ({
  orchestrate: mockOrchestrateWorkspace,
}));

vi.mock("./agUi", () => ({
  resolveWorkspaceAgUiTurn: mockResolveWorkspaceAgUiTurn,
}));

const mockedRefs = vi.hoisted(() => ({
  apiRefs: {
    "ai_zone/assistantWorkspace": {
      getThread: Symbol("assistantWorkspace.getThread"),
      listMessages: Symbol("assistantWorkspace.listMessages"),
    },
    "ai_zone/assistant": { getThread: Symbol("assistant.getThread") },
    "shared_logic/subscriptions/index": {
      getAssistantEntitlement: Symbol("subscriptions.getAssistantEntitlement"),
      getAssistantEntitlementSafe: Symbol("subscriptions.getAssistantEntitlementSafe"),
    },
    "shared_logic/knowledge/index": {
      retrieveCompanyKnowledge: Symbol("knowledge.retrieveCompanyKnowledge"),
    },
  },
  internalRefs: {
    "ai_zone/assistantWorkspace": {
      _saveConversationStep: Symbol("assistantWorkspace._saveConversationStep"),
    },
    "ai_zone/assistant": {
      _saveConversationStep: Symbol("assistant._saveConversationStep"),
    },
  },
}));

vi.mock("../../shared_logic/lib/generatedApiRefs", () => ({
  apiRefs: mockedRefs.apiRefs,
  internalRefs: mockedRefs.internalRefs,
}));

describe("assistantService handleAssistantMessage", () => {
  beforeEach(() => {
    mockOrchestrateDefault.mockClear();
    mockOrchestrateWorkspace.mockClear();
    mockResolveWorkspaceAgUiTurn.mockClear();
  });

  function createCtx() {
    const runQuery = vi.fn(async (ref: unknown) => {
      if (
        ref === apiRefs["ai_zone/assistantWorkspace"].getThread ||
        ref === apiRefs["ai_zone/assistant"].getThread
      ) {
        return {
          thread: { _id: "thread_123" },
          owner: {
            userId: "user_1",
            ownerType: "broker",
            ownerBrokerId: "broker_1",
          },
        };
      }

      if (
        ref === apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlement ||
        ref === apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlementSafe
      ) {
        return { mode: "qa" };
      }

      if (ref === apiRefs["shared_logic/knowledge/index"].retrieveCompanyKnowledge) {
        return [];
      }

      if (ref === apiRefs["ai_zone/assistantWorkspace"].listMessages) {
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

  it("uses workspace save mutation and sanitized payload for workspace assistant", async () => {
    const ctx = createCtx();

    const result = await handleAssistantMessage(ctx as any, {
      message: "أضف عقار جديد",
      assistantKind: "anan_workspace",
      orchestratorName: "anan_workspace_orchestrator",
      promptPrefix: "[Anan Workspace Operator]",
    });

    expect(mockOrchestrateWorkspace).toHaveBeenCalledTimes(1);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);
    const [workspaceMutationRef, workspacePayload] = (ctx.runMutation as any).mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(workspaceMutationRef).toBe(
      internalRefs["ai_zone/assistantWorkspace"]._saveConversationStep,
    );

    expect(workspacePayload).toEqual(
      expect.objectContaining({
        threadId: "thread_123",
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1",
        userMessage: "أضف عقار جديد",
        assistantMessage: expect.stringContaining("workspace orchestrator output"),
        mode: "qa",
      }),
    );
    expect(workspacePayload.assistantKind).toBeUndefined();
    expect(workspacePayload.orchestratorName).toBeUndefined();

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        threadId: "thread_123",
        output: expect.stringContaining("workspace orchestrator output"),
      }),
    );
  });

  it("uses default save mutation and sanitized payload for default assistant", async () => {
    const ctx = createCtx();

    const result = await handleAssistantMessage(ctx as any, {
      message: "hello",
    });

    expect(mockOrchestrateDefault).toHaveBeenCalledTimes(1);
    expect(ctx.runMutation).toHaveBeenCalledTimes(1);
    const [defaultMutationRef, defaultPayload] = (ctx.runMutation as any).mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(defaultMutationRef).toBe(
      internalRefs["ai_zone/assistant"]._saveConversationStep,
    );

    expect(defaultPayload).toEqual(
      expect.objectContaining({
        threadId: "thread_123",
        userId: "user_1",
        ownerType: "broker",
        ownerBrokerId: "broker_1",
        userMessage: "hello",
        assistantMessage: "default orchestrator output",
        mode: "qa",
      }),
    );
    expect(defaultPayload.assistantKind).toBeUndefined();
    expect(defaultPayload.orchestratorName).toBeUndefined();

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        threadId: "thread_123",
        output: "default orchestrator output",
      }),
    );
  });

  it("persists voice input mode metadata when provided", async () => {
    const ctx = createCtx();

    await handleAssistantMessage(ctx as any, {
      message: "رسالة صوتية",
      assistantKind: "anan_workspace",
      inputMode: "voice",
    });

    const [, payload] = (ctx.runMutation as any).mock.calls[0] as [unknown, Record<string, unknown>];
    expect(payload).toEqual(
      expect.objectContaining({
        userMessageMetadata: {
          inputMode: "voice",
        },
      }),
    );
  });

  it("uses safe entitlement lookup for public assistant guest sessions", async () => {
    const ctx = createCtx();
    const publicSaveMutation = Symbol("assistantPublic._saveConversationStep");

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
      apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlementSafe,
      {},
    );
    expect(ctx.runQuery).not.toHaveBeenCalledWith(
      apiRefs["shared_logic/subscriptions/index"].getAssistantEntitlement,
      {},
    );

    const [mutationRef, payload] = (ctx.runMutation as any).mock.calls[0] as [
      unknown,
      Record<string, unknown>,
    ];
    expect(mutationRef).toBe(publicSaveMutation);
    expect(payload).toEqual(
      expect.objectContaining({
        userId: "channel:main_assistant_web:guest_1",
        ownerType: "user",
        userMessage: "hello from public",
        mode: "qa",
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        output: "default orchestrator output",
      }),
    );
  });
});

describe("assistantService thread scope access", () => {
  function createQueryCtx() {
    const threads = [
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

    const messages = [
      { _id: "m-2", threadId: "org-thread", role: "assistant", content: "رد", mode: "qa", createdAt: 2 },
      { _id: "m-1", threadId: "org-thread", role: "user", content: "طلب", mode: "qa", createdAt: 1 },
    ];

    return {
      db: {
        get: vi.fn(async (id: string) => threads.find((thread) => thread._id === id) ?? null),
        query: vi.fn((table: string) => {
          if (table === "assistantThreads") {
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
                    threads.filter((thread) =>
                      filters.every(({ field, value }) => String((thread as Record<string, unknown>)[field]) === String(value)),
                    ),
                };
              },
            };
          }

          if (table === "assistantMessages") {
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
                    messages.filter((message) =>
                      filters.every(({ field, value }) => String((message as Record<string, unknown>)[field]) === String(value)),
                    ),
                };
              },
            };
          }

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

  it("prefers organization-scoped workspace thread when available", async () => {
    const ctx = createQueryCtx();
    const latest = await getLatestThread(ctx as any, owner, "anan_workspace");
    expect(latest?._id).toBe("org-thread");
  });

  it("allows org members to read shared org-scoped messages while keeping foreign org blocked", async () => {
    const ctx = createQueryCtx();

    const sharedMessages = await listThreadMessages(ctx as any, owner, "org-thread" as any, "anan_workspace");
    expect(sharedMessages.map((message) => message._id)).toEqual(["m-1", "m-2"]);

    const blockedMessages = await listThreadMessages(ctx as any, owner, "foreign-org-thread" as any, "anan_workspace");
    expect(blockedMessages).toEqual([]);
  });
});
