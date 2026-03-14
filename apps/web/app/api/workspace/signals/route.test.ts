import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { getWorkspaceNotificationSummary } = vi.hoisted(() => ({
  getWorkspaceNotificationSummary: vi.fn(),
}));

const { getInboxUnreadSummaryForCurrentUser } = vi.hoisted(() => ({
  getInboxUnreadSummaryForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/notifications/service", () => ({
  getWorkspaceNotificationSummary,
}));

vi.mock("@/server/domains/inbox/service", () => ({
  getInboxUnreadSummaryForCurrentUser,
}));

import { GET } from "./route";

describe("GET /api/workspace/signals", () => {
  beforeEach(() => {
    getWorkspaceNotificationSummary.mockReset();
    getInboxUnreadSummaryForCurrentUser.mockReset();
  });

  it("returns aggregated unread counts", async () => {
    getWorkspaceNotificationSummary.mockResolvedValue({ unreadCount: 3, latest: [] });
    getInboxUnreadSummaryForCurrentUser.mockResolvedValue({ unreadCount: 3 });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      notificationCount: 3,
      inboxCount: 3,
    });
  });

  it("serializes domain failures", async () => {
    getWorkspaceNotificationSummary.mockRejectedValue(
      new DomainError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        status: 401,
      }),
    );

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  });
});
