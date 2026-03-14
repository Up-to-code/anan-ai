import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const { getWorkspaceNotificationSummary, listWorkspaceNotifications, markWorkspaceNotificationRead } = vi.hoisted(() => ({
  getWorkspaceNotificationSummary: vi.fn(),
  listWorkspaceNotifications: vi.fn(),
  markWorkspaceNotificationRead: vi.fn(),
}));

vi.mock("@/server/domains/notifications/service", () => ({
  getWorkspaceNotificationSummary,
  listWorkspaceNotifications,
  markWorkspaceNotificationRead,
}));

import { GET, PATCH } from "./route";

describe("/api/workspace/notifications", () => {
  beforeEach(() => {
    getWorkspaceNotificationSummary.mockReset();
    listWorkspaceNotifications.mockReset();
    markWorkspaceNotificationRead.mockReset();
  });

  it("returns the summary payload when requested", async () => {
    getWorkspaceNotificationSummary.mockResolvedValue({ unreadCount: 2, latest: [] });

    const response = await GET(new NextRequest("http://localhost/api/workspace/notifications?summary=1"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ unreadCount: 2, latest: [] });
  });

  it("returns a stable invalid-argument error when notificationId is missing", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/workspace/notifications", {
        method: "PATCH",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_ARGUMENT",
      message: "notificationId is required",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    markWorkspaceNotificationRead.mockRejectedValue(
      new DomainError({
        code: "NOT_FOUND",
        message: "Notification not found",
        status: 404,
      }),
    );

    const response = await PATCH(
      new Request("http://localhost/api/workspace/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: "notification-1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: "NOT_FOUND",
      message: "Notification not found",
      status: 404,
    });
  });
});
