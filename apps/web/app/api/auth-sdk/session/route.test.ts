import { beforeEach, expect, it, vi } from "vitest";

const { getOptionalSessionContext } = vi.hoisted(() => ({
  getOptionalSessionContext: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getOptionalSessionContext,
}));

const session = {
  token: "convex-access-token",
  context: {
    userId: "user-1",
    email: "user@example.com",
    role: "developer",
    redId: "red-1",
    organizationPermissions: ["clients:read"],
    isActive: true,
  },
};

beforeEach(() => {
  getOptionalSessionContext.mockReset();
});

it("returns a sanitized SDK session payload without refresh secrets", async () => {
  getOptionalSessionContext.mockResolvedValue(session);
  const { GET } = await import("./route");
  const response = await GET();
  const body = await response.json();

  expect(body.authenticated).toBe(true);
  expect(body.accessToken).toBe("convex-access-token");
  expect(body.context.token).toBeUndefined();
  expect(body.context.entitlements).toContain("workspace:developer");
  expect(JSON.stringify(body)).not.toContain("refresh");
  expect(response.headers.get("set-cookie")).toContain("__Host-anan_csrf");
});

it("refresh rejects requests without a valid CSRF double-submit token", async () => {
  getOptionalSessionContext.mockResolvedValue(session);
  const { POST } = await import("../refresh/route");
  const response = await POST(new Request("https://anan.test/api/auth-sdk/refresh", { method: "POST" }));
  const body = await response.json();

  expect(response.status).toBe(403);
  expect(body.message).toMatch(/csrf/i);
});
