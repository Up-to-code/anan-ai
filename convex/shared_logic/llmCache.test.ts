import { beforeEach, describe, expect, it, vi } from "vitest";
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
  beforeEach(() => {
    mockLookup.mockReset();
    mockStore.mockReset();
    mockGetConfig.mockReset();
    mockSetConfig.mockReset();
    mockGetStats.mockReset();
    mockGenerateText.mockReset();
    mockRequireRole.mockReset();
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
        response: { text: "fresh" },
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
