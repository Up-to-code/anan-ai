import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getChatModel, getEmbeddingModel } from "./providers";

describe("providers", () => {
  const originalKey = process.env.OPENROUTER_API_KEY;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalKey;
  });

  it("getChatModel returns a model", () => {
    const model = getChatModel();
    expect(model).toBeDefined();
    expect(typeof model).toBe("object");
  });

  it("getEmbeddingModel returns an embedding model", () => {
    const model = getEmbeddingModel();
    expect(model).toBeDefined();
    expect(typeof model).toBe("object");
  });

  it("getChatModel with override uses provided model", () => {
    const model = getChatModel("custom/model");
    expect(model).toBeDefined();
  });
});
