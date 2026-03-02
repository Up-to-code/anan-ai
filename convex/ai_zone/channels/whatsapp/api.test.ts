import { describe, expect, it } from "vitest";
import { extractWebhookEvents } from "./api";

describe("extractWebhookEvents", () => {
  it("extracts text message", () => {
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "123" },
                contacts: [{ wa_id: "user1", profile: { name: "John" } }],
                messages: [
                  { from: "user1", id: "msg1", type: "text", text: { body: "Hello" } },
                ],
              },
            },
          ],
        },
      ],
    });
    const events = extractWebhookEvents(body);
    expect(events).toHaveLength(1);
    expect(events[0].from).toBe("user1");
    expect(events[0].text).toBe("Hello");
    expect(events[0].mediaType).toBe("text");
  });

  it("extracts voice message", () => {
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: "123" },
                messages: [{ from: "u1", type: "audio", voice: { id: "v1" } }],
              },
            },
          ],
        },
      ],
    });
    const events = extractWebhookEvents(body);
    expect(events).toHaveLength(1);
    expect(events[0].text).toContain("voice");
    expect(events[0].mediaType).toBe("audio");
  });

  it("extracts image with caption", () => {
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: {},
                messages: [
                  {
                    from: "u1",
                    type: "image",
                    image: { id: "i1", caption: "My photo" },
                  },
                ],
              },
            },
          ],
        },
      ],
    });
    const events = extractWebhookEvents(body);
    expect(events[0].text).toContain("My photo");
    expect(events[0].mediaType).toBe("image");
  });

  it("returns empty for invalid json", () => {
    expect(() => extractWebhookEvents("not json")).toThrow();
  });

  it("returns empty for empty entry", () => {
    const events = extractWebhookEvents(JSON.stringify({}));
    expect(events).toEqual([]);
  });

  it("extracts document with caption", () => {
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: {},
                messages: [
                  { from: "u1", type: "document", document: { id: "d1", caption: "Contract" } },
                ],
              },
            },
          ],
        },
      ],
    });
    const events = extractWebhookEvents(body);
    expect(events[0].text).toContain("Contract");
    expect(events[0].mediaType).toBe("document");
  });

  it("extracts video message", () => {
    const body = JSON.stringify({
      entry: [
        {
          changes: [
            {
              value: {
                metadata: {},
                messages: [{ from: "u1", type: "video", video: { id: "v1" } }],
              },
            },
          ],
        },
      ],
    });
    const events = extractWebhookEvents(body);
    expect(events[0].text).toContain("video");
    expect(events[0].mediaType).toBe("video");
  });
});
