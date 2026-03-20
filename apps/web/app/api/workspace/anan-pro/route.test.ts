import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const { cancelAnanProStreamSession, getAnanProThread, listAnanProThreads, listAnanProStreamEvents, sendAnanProMessage } = vi.hoisted(() => ({
  cancelAnanProStreamSession: vi.fn(),
  getAnanProThread: vi.fn(),
  listAnanProThreads: vi.fn(),
  listAnanProStreamEvents: vi.fn(),
  sendAnanProMessage: vi.fn(),
}));

vi.mock("@/server/domains/ananPro/service", () => ({
  cancelAnanProStreamSession,
  getAnanProThread,
  listAnanProThreads,
  listAnanProStreamEvents,
  sendAnanProMessage,
}));

import { DELETE, GET, POST } from "./route";

const streamEventsFixture = [
  {
    seq: 1,
    eventType: "stage",
    phase: "intent_started",
    status: "running",
    timestamp: 10,
  },
  {
    seq: 2,
    eventType: "thread",
    threadId: "thread-11",
    title: "Workstream",
    timestamp: 10,
  },
  {
    seq: 3,
    eventType: "delta",
    delta: "1. ما المدينة؟",
    timestamp: 11,
  },
];

const threadResultFixture = {
  id: "thread-11",
  title: "Workstream",
  messages: [
    { id: "m1", role: "user", content: "ابدأ مشروع", createdAt: 1 },
    {
      id: "m2",
      role: "assistant",
      content: "1. ما المدينة؟",
      meta: { questions: ["ما المدينة؟"] },
      createdAt: 2,
    },
  ],
};

function jsonRequest(url: string, method: "POST" | "DELETE", body?: Record<string, unknown>) {
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });
}

beforeEach(() => {
  cancelAnanProStreamSession.mockReset();
  getAnanProThread.mockReset();
  listAnanProThreads.mockReset();
  listAnanProStreamEvents.mockReset();
  sendAnanProMessage.mockReset();
});

it("lists threads when requested", async () => {
  listAnanProThreads.mockResolvedValue([{ id: "thread-1", title: "Latest", updatedAt: 1 }]);

  const response = await GET(new NextRequest("http://localhost/api/workspace/anan-pro?list=threads"));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual([{ id: "thread-1", title: "Latest", updatedAt: 1 }]);
});

it("loads a specific thread when threadId is present", async () => {
  getAnanProThread.mockResolvedValue({ id: "thread-9", title: "Saved", messages: [] });

  const response = await GET(new NextRequest("http://localhost/api/workspace/anan-pro?threadId=thread-9"));

  expect(getAnanProThread).toHaveBeenCalledWith("thread-9");
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ id: "thread-9", title: "Saved", messages: [] });
});

it("returns a stable invalid-argument error for invalid message payloads", async () => {
  const response = await POST(jsonRequest("http://localhost/api/workspace/anan-pro", "POST", { message: " " }));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toMatchObject({ code: "INVALID_ARGUMENT", status: 400 });
});

it("serializes domain failures", async () => {
  sendAnanProMessage.mockRejectedValue(new DomainError({ code: "UNAUTHORIZED", message: "Authentication required", status: 401 }));

  const response = await POST(jsonRequest("http://localhost/api/workspace/anan-pro", "POST", { message: "Plan the next step" }));

  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({
    code: "UNAUTHORIZED",
    message: "Authentication required",
    status: 401,
  });
});

it("streams ordered SSE events when stream mode is enabled", async () => {
  listAnanProStreamEvents.mockResolvedValueOnce(streamEventsFixture).mockResolvedValueOnce([]);
  sendAnanProMessage.mockResolvedValue(threadResultFixture);

  const response = await POST(jsonRequest("http://localhost/api/workspace/anan-pro?stream=1", "POST", {
    message: "ابدأ مشروع",
    startNewThread: true,
  }));

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toContain("text/event-stream");
  expect(sendAnanProMessage).toHaveBeenCalled();
  const firstCall = sendAnanProMessage.mock.calls[0]?.[0];
  expect(firstCall?.message).toBe("ابدأ مشروع");
  expect(firstCall?.threadId).toBeUndefined();
  expect(firstCall?.startNewThread).toBe(true);

  const payload = await response.text();
  expect(payload).toContain("\"type\":\"stage\"");
  expect(payload).toContain("\"phase\":\"intent_started\"");
  expect(payload.indexOf("event: thread")).toBeLessThan(payload.indexOf("event: delta"));
  expect(payload).toContain("\"1. ما المدينة؟\"");
  expect(payload).toContain("\"type\":\"assistant_meta\"");
  expect(payload.lastIndexOf("event: done")).toBeGreaterThan(payload.indexOf("event: delta"));
});

it("cancels an active stream session", async () => {
  cancelAnanProStreamSession.mockResolvedValue({ ok: true, sessionId: "session-1" });

  const response = await DELETE(jsonRequest("http://localhost/api/workspace/anan-pro?sessionId=session-1", "DELETE"));

  expect(response.status).toBe(200);
  expect(cancelAnanProStreamSession).toHaveBeenCalledWith("session-1");
  await expect(response.json()).resolves.toEqual({ ok: true, sessionId: "session-1" });
});
