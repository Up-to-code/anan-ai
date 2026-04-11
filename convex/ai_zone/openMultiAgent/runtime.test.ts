import { beforeEach, describe, expect, it, vi } from "vitest";

const runtimeHarness = vi.hoisted(() => ({
  constructorConfigs: [] as Array<Record<string, unknown>>,
  teamConfigs: [] as Array<{ name: string; config: Record<string, unknown> }>,
  goals: [] as string[],
  nextRunTeam: vi.fn(async () => ({
    success: true,
    agentResults: new Map([
      [
        "anan_workspace_projects",
        {
          success: true,
          output: "تم تجهيز ملخص المشروع.",
          messages: [],
          toolCalls: [],
          tokenUsage: { input_tokens: 11, output_tokens: 7 },
        },
      ],
      [
        "coordinator",
        {
          success: true,
          output: "1. ما المدينة؟",
          messages: [],
          toolCalls: [],
          tokenUsage: { input_tokens: 5, output_tokens: 3 },
        },
      ],
    ]),
    totalTokenUsage: { input_tokens: 16, output_tokens: 10 },
  })),
}));

const mockedApi = vi.hoisted(() => ({
  internal: {
    ai_zone: {
      agents: {
        shared: {
          orchestrationTrackerActions: {
            trackOrchestrationUsageInternal: Symbol("trackOrchestrationUsageInternal"),
          },
          tokenTrackerActions: {
            trackTokenUsageInternal: Symbol("trackTokenUsageInternal"),
          },
        },
      },
    },
  },
}));

vi.mock("@jackchen_me/open-multi-agent", async () => {
  const actual = await vi.importActual<typeof import("@jackchen_me/open-multi-agent")>(
    "@jackchen_me/open-multi-agent",
  );

  class FakeOpenMultiAgent {
    private readonly config: Record<string, unknown>;

    constructor(config: Record<string, unknown>) {
      this.config = config;
      runtimeHarness.constructorConfigs.push(config);
    }

    createTeam(name: string, config: Record<string, unknown>) {
      runtimeHarness.teamConfigs.push({ name, config });
      return {
        name,
        config,
        getAgents: () => (config.agents as unknown[]) ?? [],
      };
    }

    async runTeam(team: { config: { agents?: Array<{ name: string }> } }, goal: string) {
      runtimeHarness.goals.push(goal);
      const onProgress = this.config.onProgress as
        | ((event: { type: string; agent?: string; task?: string; data?: unknown }) => void)
        | undefined;
      const firstAgent = team.config.agents?.[0]?.name;
      if (firstAgent) {
        onProgress?.({ type: "task_start", agent: firstAgent, task: "task-1" });
        onProgress?.({
          type: "task_complete",
          agent: firstAgent,
          task: "task-1",
          data: { success: true },
        });
      }
      return runtimeHarness.nextRunTeam();
    }
  }

  return {
    ...actual,
    OpenMultiAgent: FakeOpenMultiAgent,
  };
});

vi.mock("../../_generated/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../_generated/api")>();
  return {
    ...actual,
    ...mockedApi,
    internal: {
      ...actual.internal,
      ...mockedApi.internal,
    },
  };
});

import { __testing, runAssistantSurfaceRuntime } from "./runtime";

function createCtx() {
  return {
    runMutation: vi.fn(async () => null),
  };
}

beforeEach(() => {
  runtimeHarness.constructorConfigs.length = 0;
  runtimeHarness.teamConfigs.length = 0;
  runtimeHarness.goals.length = 0;
  runtimeHarness.nextRunTeam.mockClear();
  process.env.OPENROUTER_API_KEY = "default-key";
  process.env.OPENROUTER_MODEL = "openrouter/default-model";
  process.env.OPENROUTER_WORKSPACE_API_KEY = "workspace-key";
  process.env.OPENROUTER_WORKSPACE_MODEL = "openrouter/workspace-model";
});

describe("open multi-agent runtime", () => {
  it("maps the default surface to OpenRouter config and role-filtered public agents", async () => {
    const ctx = createCtx();

    await runAssistantSurfaceRuntime({
      surface: "default",
      ctx: ctx as any,
      prompt: "ابحث عن شقة مناسبة",
      role: "broker",
      userId: "user-1",
      channel: "web",
    });

    expect(runtimeHarness.constructorConfigs[0]).toEqual(
      expect.objectContaining({
        defaultProvider: "openai",
        defaultApiKey: "default-key",
        defaultBaseURL: "https://openrouter.ai/api/v1",
        defaultModel: "openrouter/default-model",
      }),
    );

    const createdAgents =
      (runtimeHarness.teamConfigs[0]?.config.agents as Array<{ name: string; tools?: string[] }>) ?? [];
    expect(createdAgents.map((agent) => agent.name)).toEqual(
      expect.arrayContaining([
        "anan_search",
        "anan_web",
        "anan_property",
        "anan_recommender",
        "anan_knowledge",
        "anan_memory",
        "anan_platform_docs",
      ]),
    );
    expect(createdAgents.find((agent) => agent.name === "anan_search")?.tools).toContain(
      "search_smart_property",
    );
  });

  it("uses workspace OpenRouter credentials, emits legacy workspace stages, and preserves analytics writes", async () => {
    const ctx = createCtx();
    const stageEvents: Array<{ phase: string; status?: string; teamId?: string; agentName?: string }> = [];

    const result = await runAssistantSurfaceRuntime({
      surface: "workspace",
      ctx: ctx as any,
      prompt: "ابدأ مشروع جديد",
      role: "broker",
      userId: "broker-1",
      threadId: "thread-1",
      channel: "app",
      onStageEvent: async (event) => {
        stageEvents.push({
          phase: event.phase,
          status: event.status,
          teamId: event.teamId,
          agentName: event.agentName,
        });
      },
    });

    expect(runtimeHarness.constructorConfigs[0]).toEqual(
      expect.objectContaining({
        defaultApiKey: "workspace-key",
        defaultModel: "openrouter/workspace-model",
      }),
    );
    expect(stageEvents.map((event) => event.phase)).toEqual(
      expect.arrayContaining([
        "intent_started",
        "intent_done",
        "merge_started",
        "team_started",
        "team_done",
        "merge_done",
      ]),
    );
    expect(result).toEqual(
      expect.objectContaining({
        output: "1. ما المدينة؟",
        structured: { questions: ["ما المدينة؟"] },
        runtime: "open-multi-agent",
      }),
    );

    expect(ctx.runMutation).toHaveBeenCalledWith(
      mockedApi.internal.ai_zone.agents.shared.tokenTrackerActions.trackTokenUsageInternal,
      expect.objectContaining({
        agentName: "anan_workspace_projects",
        teamName: "team_workspace_projects",
        userId: "broker-1",
        threadId: "thread-1",
      }),
    );
    expect(ctx.runMutation).toHaveBeenCalledWith(
      mockedApi.internal.ai_zone.agents.shared.orchestrationTrackerActions.trackOrchestrationUsageInternal,
      expect.objectContaining({
        orchestratorName: "anan_workspace_orchestrator",
        agentsDispatched: ["anan_workspace_projects"],
        successfulAgents: ["anan_workspace_projects"],
        failedAgents: [],
      }),
    );
  });

  it("exposes helper mappings for workspace question extraction", () => {
    expect(__testing.resolveSurfaceRuntimeConfig("workspace").orchestratorName).toBe(
      "anan_workspace_orchestrator",
    );
    expect(__testing.toWorkspaceStructuredOutput("1. ما السعر؟\n2. ما المدينة؟")).toEqual({
      questions: ["ما السعر؟", "ما المدينة؟"],
    });
  });
});
