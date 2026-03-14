import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getCurrentProfileForCurrentUser } from "./service";

describe("profiles domain service", () => {
  it("returns the profile already resolved by the auth session layer", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-1",
      context: {
        userId: "user-1",
        isActive: true,
      },
      profile: {
        role: "broker",
        roleStatus: "approved",
        brokerId: "broker-1",
      },
    }));

    const profile = await getCurrentProfileForCurrentUser({ requireSession });

    expect(profile).toEqual({
      role: "broker",
      roleStatus: "approved",
      brokerId: "broker-1",
    });
  });
});
