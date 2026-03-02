import { describe, expect, it } from "vitest";
import { processTextPipeline } from "./textPipeline";

describe("processTextPipeline", () => {
  it("returns ProcessedInput with normalized text", () => {
    const result = processTextPipeline({
      text: "  villas   in   Riyadh  ",
      channelType: "whatsapp",
      userId: "u1",
    });
    expect(result.text).toBe("villas in Riyadh");
    expect(result.channelType).toBe("whatsapp");
    expect(result.userId).toBe("u1");
  });

  it("preserves optional threadId and displayName", () => {
    const result = processTextPipeline({
      text: "hi",
      channelType: "app",
      userId: "u2",
      threadId: "t1",
      displayName: "Alice",
    });
    expect(result.threadId).toBe("t1");
    expect(result.displayName).toBe("Alice");
  });
});
