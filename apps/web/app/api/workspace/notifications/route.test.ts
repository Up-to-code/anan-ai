import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { markWorkspaceNotificationRead } = vi.hoisted(() => ({
  markWorkspaceNotificationRead: vi.fn(),
}));

vi.mock("@/server/domains/workspace/notifications/service", () => ({
  markWorkspaceNotificationRead,
}));

import { PATCH } from "./route";

beforeEach(() => {
  markWorkspaceNotificationRead.mockReset();
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
