import { beforeEach, expect, it, vi } from "vitest";

const { requireSessionContext } = vi.hoisted(() => ({
  requireSessionContext: vi.fn(),
}));

const { resolveOwnerLinkedSession } = vi.hoisted(() => ({
  resolveOwnerLinkedSession: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

vi.mock("@/server/auth/guards", () => ({
  resolveOwnerLinkedSession,
}));

import { buildWorkspaceScopedSessionResolver } from "./index";

beforeEach(() => {
  requireSessionContext.mockReset();
  resolveOwnerLinkedSession.mockReset();
});

it("hydrates broker sessions from owner context before fallback", async () => {
  requireSessionContext.mockResolvedValue({
    token: "token-1",
    context: { userId: "user-1", role: "user", isActive: true },
    profile: null,
  });

  const resolveSession = buildWorkspaceScopedSessionResolver("broker", {
    ownerType: "broker",
    ownerId: "broker-1",
  });
  const session = await resolveSession();

  expect(resolveOwnerLinkedSession).not.toHaveBeenCalled();
  expect(session.context.role).toBe("broker");
  expect(session.context.brokerId).toBe("broker-1");
});

it("hydrates broker sessions from explicit org fallback when owner context is missing", async () => {
  requireSessionContext.mockResolvedValue({
    token: "token-2",
    context: { userId: "user-2", role: "broker", organizationId: "org-2", isActive: true },
    profile: null,
  });
  resolveOwnerLinkedSession.mockResolvedValue({
    token: "token-2",
    context: {
      userId: "user-2",
      role: "broker",
      organizationId: "org-2",
      brokerId: "broker-2",
      isActive: true,
    },
    profile: null,
  });

  const resolveSession = buildWorkspaceScopedSessionResolver("broker");
  const session = await resolveSession();

  expect(resolveOwnerLinkedSession).toHaveBeenCalledWith(
    expect.objectContaining({
      context: expect.objectContaining({ organizationId: "org-2" }),
    }),
    "brokerId",
  );
  expect(session.context.brokerId).toBe("broker-2");
});

it("hydrates developer sessions from explicit org fallback when owner context is missing", async () => {
  requireSessionContext.mockResolvedValue({
    token: "token-3",
    context: { userId: "user-3", role: "developer", organizationId: "org-3", isActive: true },
    profile: null,
  });
  resolveOwnerLinkedSession.mockResolvedValue({
    token: "token-3",
    context: {
      userId: "user-3",
      role: "developer",
      organizationId: "org-3",
      redId: "red-3",
      isActive: true,
    },
    profile: null,
  });

  const resolveSession = buildWorkspaceScopedSessionResolver("developer");
  const session = await resolveSession();

  expect(resolveOwnerLinkedSession).toHaveBeenCalledWith(
    expect.objectContaining({
      context: expect.objectContaining({ organizationId: "org-3" }),
    }),
    "redId",
  );
  expect(session.context.redId).toBe("red-3");
});
