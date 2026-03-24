import { afterEach, describe, expect, it, vi } from "vitest";
import {
  chunkTextForWhatsApp,
  normalizeOutboundMessages,
  WhatsAppService,
} from "./service";

describe("whatsapp service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("chunks long text into WhatsApp-safe pieces", () => {
    const chunks = chunkTextForWhatsApp(
      Array.from({ length: 18 }, (_, index) => `Line ${index + 1}`).join("\n"),
    );
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.split("\n").length).toBeLessThanOrEqual(10);
  });

  it("normalizes outbound messages to the configured turn budget", () => {
    const normalized = normalizeOutboundMessages([
      { type: "text", text: "one" },
      { type: "text", text: "two" },
      { type: "text", text: "three" },
      { type: "text", text: "four" },
    ]);
    expect(normalized).toHaveLength(3);
  });

  it("sends reply buttons with a WhatsApp interactive payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid-1" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new WhatsAppService("12345", "token");
    await service.sendReplyButtons("966501234567", {
      type: "reply_buttons",
      body: "اختر الخطوة التالية",
      buttons: [
        { id: "a", title: "تمويل" },
        { id: "b", title: "عائد" },
        { id: "c", title: "مستشار" },
        { id: "d", title: "extra" },
      ],
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.type).toBe("interactive");
    expect(body.interactive.type).toBe("button");
    expect(body.interactive.action.buttons).toHaveLength(3);
  });

  it("sends list messages with at most 10 rows", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid-2" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const service = new WhatsAppService("12345", "token");
    await service.sendListMessage("966501234567", {
      type: "list",
      body: "اختر العقار",
      buttonText: "عرض",
      sectionTitle: "نتائج",
      rows: Array.from({ length: 12 }, (_, index) => ({
        id: `row-${index}`,
        title: `Property ${index}`,
      })),
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.interactive.type).toBe("list");
    expect(body.interactive.action.sections[0].rows).toHaveLength(10);
  });

  it("paces sequence sends and respects the normalized sequence", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: "wamid-seq" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const timeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const service = new WhatsAppService("12345", "token");
    const pending = service.sendMessageSequence("966501234567", [
      { type: "text", text: "one" },
      { type: "text", text: "two" },
      { type: "reply_buttons", body: "three", buttons: [{ id: "a", title: "تمويل" }] },
      { type: "text", text: "four" },
    ]);

    await vi.runAllTimersAsync();
    const results = await pending;

    expect(results).toHaveLength(3);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(timeoutSpy).toHaveBeenCalled();
  });
});
