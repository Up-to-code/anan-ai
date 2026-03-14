import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  getWorkspacePushConfig,
  registerWorkspacePushSubscription,
  removeWorkspacePushSubscription,
  updateWorkspaceNotificationPreferences,
} = vi.hoisted(() => ({
  getWorkspacePushConfig: vi.fn(),
  registerWorkspacePushSubscription: vi.fn(),
  removeWorkspacePushSubscription: vi.fn(),
  updateWorkspaceNotificationPreferences: vi.fn(),
}));

vi.mock("@/server/domains/notifications/service", () => ({
  getWorkspacePushConfig,
  registerWorkspacePushSubscription,
  removeWorkspacePushSubscription,
  updateWorkspaceNotificationPreferences,
}));

import { DELETE, GET, POST } from "./route";

describe("/api/workspace/notifications/push", () => {
  beforeEach(() => {
    getWorkspacePushConfig.mockReset();
    registerWorkspacePushSubscription.mockReset();
    removeWorkspacePushSubscription.mockReset();
    updateWorkspaceNotificationPreferences.mockReset();
  });

  it("returns the push configuration", async () => {
    getWorkspacePushConfig.mockResolvedValue({ browserPushEnabled: true });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ browserPushEnabled: true });
  });

  it("returns a stable invalid-argument error for invalid subscriptions", async () => {
    const response = await POST(
      new Request("http://localhost/api/workspace/notifications/push", {
        method: "POST",
        body: JSON.stringify({ endpoint: "not-a-url" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_ARGUMENT",
      status: 400,
    });
  });

  it("returns a stable invalid-argument error when endpoint is missing on delete", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/workspace/notifications/push", {
        method: "DELETE",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_ARGUMENT",
      message: "endpoint is required",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    getWorkspacePushConfig.mockRejectedValue(
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
