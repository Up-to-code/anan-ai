import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { apiRefs } from "./lib/generatedApiRefs";
import { modules } from "../test.setup";
import { cachedGenerateText } from "./llmCache";

const {
  mockLookup,
  mockStore,
  mockGetConfig,
  mockSetConfig,
  mockGetStats,
  mockGenerateText,
  mockRequireRole,
} = vi.hoisted(() => ({
  mockLookup: vi.fn(async () => null),
  mockStore: vi.fn(async () => undefined),
  mockGetConfig: vi.fn(async () => ({ defaultTtlMs: 60000 })),
  mockSetConfig: vi.fn(async () => ({ ok: true })),
  mockGetStats: vi.fn(async () => ({ hits: 1, misses: 0 })),
  mockGenerateText: vi.fn(async () => ({ text: "generated" })),
  mockRequireRole: vi.fn(async () => ({ authUserId: "admin-auth" })),
}));

vi.mock("@mzedstudio/llm-cache", () => ({
  LLMCache: class {
    lookup = mockLookup;
    store = mockStore;
    getConfig = mockGetConfig;
    setConfig = mockSetConfig;
    getStats = mockGetStats;
  },
}));

vi.mock("ai", () => ({
  generateText: mockGenerateText,
}));

vi.mock("../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
}));

describe("llm cache", () => {
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  afterAll(() => {
    warnSpy.mockRestore();
  });

  beforeEach(() => {
    mockLookup.mockReset();
    mockStore.mockReset();
    mockGetConfig.mockReset();
    mockSetConfig.mockReset();
    mockGetStats.mockReset();
    mockGenerateText.mockReset();
    mockRequireRole.mockReset();
    warnSpy.mockClear();
  });

  it("returns cached response without calling generateText", async () => {
    mockLookup.mockResolvedValueOnce({ response: { text: "cached" } } as any);

    const result = await cachedGenerateText(
      {} as any,
      { model: "gpt-4o-mini", prompt: "hello" } as any,
      { modelName: "gpt-4o-mini" },
    );

    expect(result).toEqual({ text: "cached" });
    expect(mockGenerateText).not.toHaveBeenCalled();
    expect(mockStore).not.toHaveBeenCalled();
  });

  it("stores responses on cache miss", async () => {
    mockLookup.mockResolvedValueOnce(null);
    mockGenerateText.mockResolvedValueOnce({ text: "fresh" });

    const result = await cachedGenerateText(
      {} as any,
      { model: "gpt-4o-mini", prompt: "hello" } as any,
      { modelName: "gpt-4o-mini", tags: ["intent"] },
    );

    expect(result).toEqual({ text: "fresh" });
    expect(mockGenerateText).toHaveBeenCalled();
    expect(mockStore).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        response: expect.objectContaining({ text: "fresh" }),
        tags: ["intent"],
      }),
    );
  });

  it("bypasses lookup when requested", async () => {
    mockGenerateText.mockResolvedValueOnce({ text: "bypass" });

    const result = await cachedGenerateText(
      {} as any,
      { model: "gpt-4o-mini", prompt: "hello" } as any,
      { modelName: "gpt-4o-mini", bypass: true },
    );

    expect(result).toEqual({ text: "bypass" });
    expect(mockLookup).not.toHaveBeenCalled();
    expect(mockStore).toHaveBeenCalled();
  });

  it("stores a Convex-safe response shape from rich SDK results", async () => {
    mockLookup.mockResolvedValueOnce(null);
    mockGenerateText.mockResolvedValueOnce({
      text: "[\"team_workspace_projects\"]",
      usage: { inputTokens: 263, outputTokens: 7, totalTokens: 270, reasoningTokens: 0 },
      response: {
        id: "gen-id",
        headers: { "content-type": "application/json" },
      },
      steps: [
        {
          content: [{ type: "text", text: "[\"team_workspace_projects\"]" }],
        },
      ],
    } as any);

    await cachedGenerateText(
      {} as any,
      { model: "google/gemini-2.5-flash", prompt: "classify" } as any,
      { modelName: "google/gemini-2.5-flash" },
    );

    const storedResponse = (mockStore as any).mock.calls[0]?.[1]?.response;
    expect(storedResponse).toEqual(
      expect.objectContaining({
        text: "[\"team_workspace_projects\"]",
        usage: expect.objectContaining({
          inputTokens: 263,
          outputTokens: 7,
          totalTokens: 270,
          promptTokens: 263,
          completionTokens: 7,
        }),
      }),
    );
    expect(storedResponse).not.toHaveProperty("response");
    expect(storedResponse).not.toHaveProperty("steps");
  });

  it("ignores malformed cached payloads and regenerates", async () => {
    mockLookup.mockResolvedValueOnce({ response: { bad: true } } as any);
    mockGenerateText.mockResolvedValueOnce({ text: "regenerated" });

    const result = await cachedGenerateText(
      {} as any,
      { model: "gpt-4o-mini", prompt: "hello" } as any,
      { modelName: "gpt-4o-mini" },
    );

    expect(result).toEqual({ text: "regenerated" });
    expect(mockGenerateText).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      "[llmCache] Ignoring malformed cached response and regenerating",
    );
  });

  it("returns live output when cache store fails", async () => {
    mockLookup.mockResolvedValueOnce(null);
    mockGenerateText.mockResolvedValueOnce({ text: "live" });
    mockStore.mockRejectedValueOnce(new Error("store failed"));

    const result = await cachedGenerateText(
      {} as any,
      { model: "gpt-4o-mini", prompt: "hello" } as any,
      { modelName: "gpt-4o-mini" },
    );

    expect(result).toEqual({ text: "live" });
    expect(warnSpy).toHaveBeenCalledWith(
      "[llmCache] Cache store failed (non-critical):",
      expect.any(Error),
    );
  });

  it("guards admin cache config queries", async () => {
    const t = convexTest(schema, modules);

    await t.query(apiRefs["shared_logic/llmCache"].getLlmCacheConfig as never, {} as never);
    await t.query(apiRefs["shared_logic/llmCache"].getLlmCacheStats as never, {} as never);

    expect(mockRequireRole).toHaveBeenCalledTimes(2);
    expect(mockGetConfig).toHaveBeenCalled();
    expect(mockGetStats).toHaveBeenCalled();
  });

  it("guards admin cache config updates", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(
      apiRefs["shared_logic/llmCache"].updateLlmCacheConfig as never,
      { config: { defaultTtlMs: 5000 } } as never,
    );

    expect(mockRequireRole).toHaveBeenCalled();
    expect(mockSetConfig).toHaveBeenCalled();
  });
});
