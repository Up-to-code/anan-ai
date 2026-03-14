import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { getWorkspaceBehaviorForCurrentUser } = vi.hoisted(() => ({
  getWorkspaceBehaviorForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/workspaces/service", () => ({
  getWorkspaceBehaviorForCurrentUser,
}));

import { GET } from "./route";

describe("GET /api/workspaces", () => {
  beforeEach(() => {
    getWorkspaceBehaviorForCurrentUser.mockReset();
  });

  it("returns the composed workspace payload", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Ahmed",
        email: "ahmed@example.com",
        isActive: true,
      },
      session: {
        userId: "user-1",
        role: "broker",
        isActive: true,
      },
      profile: {
        role: "broker",
        roleStatus: "approved",
      },
      organizations: [
        {
          id: "broker-1",
          type: "broker",
          name: "Fresh Start Realty",
          slug: "fresh-start-realty",
          status: "active",
          isVerified: false,
        },
      ],
      primaryOrganization: {
        id: "broker-1",
        type: "broker",
        name: "Fresh Start Realty",
        slug: "fresh-start-realty",
        status: "active",
        isVerified: false,
      },
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
      visibleZoneKeys: ["overview", "projects", "offers", "crm", "inbox", "settings"],
      capabilities: {
        canAccessMarket: false,
        canManageProjects: true,
        canManageOffers: true,
        canManageCrm: true,
        canUseInbox: true,
        canManageOrganization: true,
      },
      onboarding: {
        needsOrganization: false,
        suggestedOrganizationType: "broker",
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.organizations).toHaveLength(1);
    expect(payload.audience).toBe("broker");
    expect(payload.primaryOrganization.slug).toBe("fresh-start-realty");
  });

  it("serializes unauthorized errors", async () => {
    getWorkspaceBehaviorForCurrentUser.mockRejectedValue(
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
