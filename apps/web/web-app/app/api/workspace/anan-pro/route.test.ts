import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const { getAnanProThread, listAnanProThreads, sendAnanProMessage } = vi.hoisted(() => ({
  getAnanProThread: vi.fn(),
  listAnanProThreads: vi.fn(),
  sendAnanProMessage: vi.fn(),
}));

vi.mock("@/server/domains/ananPro/service", () => ({
  getAnanProThread,
  listAnanProThreads,
  sendAnanProMessage,
}));

import { GET, POST } from "./route";

describe("/api/workspace/anan-pro", () => {
  beforeEach(() => {
    getAnanProThread.mockReset();
    listAnanProThreads.mockReset();
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
    const response = await POST(
      new Request("http://localhost/api/workspace/anan-pro", {
        method: "POST",
        body: JSON.stringify({ message: " " }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_ARGUMENT",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    sendAnanProMessage.mockRejectedValue(
      new DomainError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        status: 401,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/workspace/anan-pro", {
        method: "POST",
        body: JSON.stringify({ message: "Plan the next step" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  });
});
