import { describe, expect, it } from "vitest";
import {
  buildStoredThreadRecord,
  buildThreadSummary,
  createThreadStore,
  migrateLegacyGuestSnapshot,
  upsertStoredThread,
} from "@/lib/mobileThreadStore";
import type { MobileConversationMessage, MobileProperty } from "@/types/mobile";

const sampleProperty: MobileProperty = {
  id: "property-1",
  title: "Olive Residence",
  address: "Riyadh Front",
  location: "الرياض",
  area: "الصحافة",
  price: 1200000,
  beds: 3,
  baths: 3,
  media: ["https://example.com/1.jpg"],
  owner: {
    id: "broker-1",
    type: "broker",
    name: "Broker One",
    slug: "broker-one",
    isVerified: true,
  },
};

const sampleMessages: MobileConversationMessage[] = [
  {
    id: "user-1",
    role: "user",
    text: "أريد خيارات في الصحافة",
    createdAt: 100,
  },
  {
    id: "assistant-1",
    role: "assistant",
    text: "وجدت لك بعض الخيارات المناسبة.",
    createdAt: 200,
    properties: [sampleProperty],
  },
];

describe("mobileThreadStore", () => {
  it("keeps previous local threads when a fresh thread is created later", () => {
    const firstThread = buildStoredThreadRecord({
      id: "thread-1",
      assistantThreadId: "assistant-thread-1",
      draft: "",
      activeThreadKind: "live",
      activeProperty: sampleProperty,
      selectedProperties: [sampleProperty],
      messages: sampleMessages,
      updatedAt: 200,
    });
    const secondThread = buildStoredThreadRecord({
      id: "thread-2",
      draft: "",
      activeThreadKind: "live",
      activeProperty: null,
      selectedProperties: [],
      messages: [
        {
          id: "user-2",
          role: "user",
          text: "أريد خيارات أخرى",
          createdAt: 300,
        },
      ],
      updatedAt: 300,
    });

    const threads = upsertStoredThread(
      upsertStoredThread([], firstThread!),
      secondThread!,
    );
    const store = createThreadStore({
      activeThreadId: "thread-2",
      threads,
    });

    expect(store.threads).toHaveLength(2);
    expect(store.threads.map((thread) => thread.id)).toEqual(["thread-2", "thread-1"]);
  });

  it("restores thread summaries from the stored transcript", () => {
    const storedThread = buildStoredThreadRecord({
      id: "thread-1",
      assistantThreadId: "assistant-thread-1",
      draft: "",
      activeThreadKind: "live",
      activeProperty: sampleProperty,
      selectedProperties: [sampleProperty],
      messages: sampleMessages,
      updatedAt: 200,
    });

    const summary = buildThreadSummary(storedThread!);

    expect(summary.id).toBe("thread-1");
    expect(summary.preview).toContain("وجدت لك");
    expect(summary.title.length).toBeGreaterThan(0);
  });

  it("preserves the backend assistant thread id separately from the local guest thread id", () => {
    const storedThread = buildStoredThreadRecord({
      id: "guest-local-thread-1",
      assistantThreadId: "assistant-thread-1",
      draft: "",
      activeThreadKind: "live",
      activeProperty: sampleProperty,
      selectedProperties: [sampleProperty],
      messages: sampleMessages,
      updatedAt: 200,
    });

    expect(storedThread?.id).toBe("guest-local-thread-1");
    expect(storedThread?.assistantThreadId).toBe("assistant-thread-1");
  });

  it("migrates the legacy single-thread snapshot into the new store format", () => {
    const migrated = migrateLegacyGuestSnapshot({
      draft: "",
      activeThreadId: "legacy-thread",
      assistantThreadId: "assistant-thread-legacy",
      activeThreadKind: "live",
      activeProperty: sampleProperty,
      messages: sampleMessages,
      updatedAt: 200,
    });

    expect(migrated?.version).toBe(3);
    expect(migrated?.activeThreadId).toBe("legacy-thread");
    expect(migrated?.threads[0]?.messages).toHaveLength(2);
    expect(migrated?.threads[0]?.assistantThreadId).toBe("assistant-thread-legacy");
    expect(migrated?.threads[0]?.selectedProperties).toEqual([sampleProperty]);
  });
});
