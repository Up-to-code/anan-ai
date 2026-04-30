import { expect, it, vi } from "vitest";
import { getOptionalSessionContext, requireSessionContext } from "./session";

it("resolves a Better Auth Convex token into the admin session context", async () => {
  const session = await getOptionalSessionContext({
    getToken: vi.fn(async () => "convex-token"),
    sessionsRepository: {
      getCurrent: vi.fn(async () => ({
        id: "auth-user-1",
        email: "admin@example.com",
        name: "Admin User",
        image: null,
        isActive: true,
      })),
    },
    profilesRepository: {
      getCurrent: vi.fn(async () => ({
        email: "admin@example.com",
        name: "Admin User",
        username: "admin",
        role: "user",
        roleApprovalStatus: "approved",
        requestedRole: undefined,
        brokerId: undefined,
        developerId: undefined,
        showInOffersDirectory: true,
        isActive: true,
        metadata: {
          platformAccess: {
            admin: {
              enabled: true,
              level: "owner",
              permissions: ["admin:*"],
              grantedAt: 1,
            },
          },
        },
        authProvider: { id: "google", passwordManaged: false },
      })),
    },
  });

  expect(session?.token).toBe("convex-token");
  expect(session?.context).toMatchObject({
    userId: "auth-user-1",
    email: "admin@example.com",
    role: "user",
    isAdmin: true,
    isActive: true,
  });
});

it("returns null when the Better Auth bridge has no active session", async () => {
  const session = await getOptionalSessionContext({
    getToken: vi.fn(async () => null),
    sessionsRepository: {
      getCurrent: vi.fn(),
    },
    profilesRepository: {
      getCurrent: vi.fn(),
    },
  });

  expect(session).toBeNull();
});

it("throws unauthorized when a protected server entrypoint has no session", async () => {
  await expect(
    requireSessionContext({
      getToken: vi.fn(async () => null),
      sessionsRepository: {
        getCurrent: vi.fn(),
      },
      profilesRepository: {
        getCurrent: vi.fn(),
      },
    }),
  ).rejects.toMatchObject({
    code: "UNAUTHORIZED",
    status: 401,
  });
});
