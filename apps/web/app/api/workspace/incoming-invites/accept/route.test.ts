import { beforeEach, expect, it, vi } from "vitest";

const { acceptCurrentOrganizationInvite } = vi.hoisted(() => ({
  acceptCurrentOrganizationInvite: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizations/service", () => ({
  acceptCurrentOrganizationInvite,
}));

import { POST } from "./route";

beforeEach(() => {
  acceptCurrentOrganizationInvite.mockReset();
});

it("accepts the invite", async () => {
  const response = await POST(
    new Request("http://localhost/api/workspace/incoming-invites/accept", {
      method: "POST",
      body: JSON.stringify({ token: "invite-token" }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(acceptCurrentOrganizationInvite).toHaveBeenCalledWith("invite-token");
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
});

it("returns a stable invalid-argument error when token is missing", async () => {
  const response = await POST(
    new Request("http://localhost/api/workspace/incoming-invites/accept", {
      method: "POST",
      body: JSON.stringify({ token: " " }),
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    code: "INVALID_ARGUMENT",
    message: "Invite token is required",
    status: 400,
  });
});

it("returns a stable invalid-json error", async () => {
  const response = await POST(
    new Request("http://localhost/api/workspace/incoming-invites/accept", {
      method: "POST",
      body: "{",
      headers: { "Content-Type": "application/json" },
    }),
  );

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    code: "INVALID_REQUEST",
    message: "Request body must be valid JSON",
    status: 400,
  });
});
