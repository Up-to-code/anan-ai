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
  expect(events[0].messageType).toBe("text");
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
  expect(events[0].messageType).toBe("audio");
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
  expect(events[0].messageType).toBe("image");
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
  expect(events[0].messageType).toBe("document");
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
  expect(events[0].messageType).toBe("video");
});

it("extracts interactive button reply", () => {
  const body = JSON.stringify({
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: "123" },
              messages: [
                {
                  from: "u1",
                  type: "interactive",
                  interactive: {
                    button_reply: { id: "property_action:finance", title: "تمويل" },
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  });
  const events = extractWebhookEvents(body);
  expect(events[0].messageType).toBe("interactive_button_reply");
  expect(events[0].interactiveReplyId).toBe("property_action:finance");
  expect(events[0].interactiveReplyTitle).toBe("تمويل");
});

it("extracts interactive list reply", () => {
  const body = JSON.stringify({
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: "123" },
              messages: [
                {
                  from: "u1",
                  type: "interactive",
                  interactive: {
                    list_reply: { id: "select_property:abc", title: "شقة الرياض" },
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  });
  const events = extractWebhookEvents(body);
  expect(events[0].messageType).toBe("interactive_list_reply");
  expect(events[0].interactiveReplyId).toBe("select_property:abc");
  expect(events[0].interactiveReplyTitle).toBe("شقة الرياض");
});
});
