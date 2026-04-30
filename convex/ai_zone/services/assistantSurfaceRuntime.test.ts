import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  workspaceOrchestrate: vi.fn(async () => ({
    ok: true,
    output: "workspace native output",
    structured: { questions: ["ما المدينة؟"] },
    agentsDispatched: ["anan_workspace_projects"],
    agentResults: [],
    totalTokenUsage: { inputTokens: 3, outputTokens: 4 },
  })),
}));

vi.mock("../agents/anan_workspace", () => ({
  orchestrate: mocks.workspaceOrchestrate,
}));

import { runAssistantSurfaceRuntime } from "./assistantSurfaceRuntime";

beforeEach(() => {
  mocks.workspaceOrchestrate.mockClear();
});

describe("assistantSurfaceRuntime", () => {
  it("disables legacy default buyer orchestration", async () => {
    const ctx = {} as any;
    const result = await runAssistantSurfaceRuntime({
      surface: "default",
      ctx,
      prompt: "ابحث عن شقة",
      intentPrompt: "ابحث عن شقة",
      role: "user",
      userId: "user-1",
      threadId: "thread-1",
      channel: "web",
      ragContext: "[Company Knowledge]",
      promptBudgetMeta: {
        contextTokens: 1,
        memoryTokens: 2,
        ragTokens: 3,
        historyTokens: 4,
        totalContextTokens: 10,
        budgetCap: 1200,
        cacheHit: false,
        includedBlocks: ["persona_context"],
        droppedBlocks: [],
      },
    });

    expect(mocks.workspaceOrchestrate).not.toHaveBeenCalled();
    expect(result.output).toContain("Anan AI");
    expect(result.runtime).toBe("anan-native");
  });

  it("routes workspace surface through the native workspace orchestrator and preserves streaming hooks", async () => {
    const ctx = {} as any;
    const onStageEvent = vi.fn();
    const onTextDelta = vi.fn();
    const onStreamCancelledCheck = vi.fn(async () => false);

    const result = await runAssistantSurfaceRuntime({
      surface: "workspace",
      ctx,
      prompt: "ابدأ مشروع جديد",
      intentPrompt: "ابدأ مشروع جديد",
      role: "broker",
      userId: "broker-1",
      threadId: "thread-2",
      channel: "workspace",
      onStageEvent,
      onTextDelta,
      onStreamCancelledCheck,
    });

    expect(mocks.workspaceOrchestrate).toHaveBeenCalledWith(
      expect.objectContaining({
        ctx,
        prompt: "ابدأ مشروع جديد",
        intentPrompt: "ابدأ مشروع جديد",
        role: "broker",
        userId: "broker-1",
        threadId: "thread-2",
        channel: "workspace",
        onStageEvent,
        onTextDelta,
        onStreamCancelledCheck,
      }),
    );
    expect(result).toEqual({
      output: "workspace native output",
      structured: { questions: ["ما المدينة؟"] },
      runtime: "anan-native",
    });
  });

  it("answers simple default greetings locally without hitting the model orchestrator", async () => {
    const result = await runAssistantSurfaceRuntime({
      surface: "default",
      ctx: {} as any,
      prompt: "[large assembled prompt]\n\nhi",
      intentPrompt: "hi",
      role: "user",
      userId: "guest-1",
      channel: "web",
    });

    expect(result.output).toContain("Anan AI");
    expect(result.runtime).toBe("anan-native");
  });
});
