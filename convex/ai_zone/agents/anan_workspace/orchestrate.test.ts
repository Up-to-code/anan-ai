import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cachedGenerateText: vi.fn(),
}));

vi.mock("../../../shared_logic/llmCache", () => ({
  cachedGenerateText: mocks.cachedGenerateText,
}));

import { orchestrate } from "./orchestrate";

const originalOpenRouterKey = process.env.OPENROUTER_WORKSPACE_API_KEY;

beforeEach(() => {
  mocks.cachedGenerateText.mockReset();
  process.env.OPENROUTER_WORKSPACE_API_KEY = originalOpenRouterKey;
});

afterEach(() => {
  process.env.OPENROUTER_WORKSPACE_API_KEY = originalOpenRouterKey;
});

describe("anan workspace orchestrator", () => {
  it("answers simple greetings without calling the provider", async () => {
    const result = await orchestrate({
      ctx: {} as any,
      prompt: "hi",
      role: "broker",
      userId: "user-1",
      channel: "workspace",
    });

    expect(mocks.cachedGenerateText).not.toHaveBeenCalled();
    expect(result.output).toContain("Anan AI");
    expect(result.agentsDispatched).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("returns a configuration message when provider auth fails during intent analysis", async () => {
    process.env.OPENROUTER_WORKSPACE_API_KEY = "invalid-key";
    mocks.cachedGenerateText.mockRejectedValueOnce({
      statusCode: 401,
      responseBody: '{"error":{"message":"User not found.","code":401}}',
      data: { error: { message: "User not found.", code: 401 } },
    });

    const result = await orchestrate({
      ctx: {} as any,
      prompt: "اعرض آخر المشاريع",
      role: "broker",
      userId: "user-1",
      channel: "workspace",
    });

    expect(result.output).toContain("Anan AI");
    expect(result.output).toContain("OPENROUTER_WORKSPACE_API_KEY");
    expect(result.agentsDispatched).toEqual([]);
    expect(result.ok).toBe(false);
  });
});
