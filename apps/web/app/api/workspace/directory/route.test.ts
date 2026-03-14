import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const { searchCurrentOrganizationDirectoryExact } = vi.hoisted(() => ({
  searchCurrentOrganizationDirectoryExact: vi.fn(),
}));

vi.mock("@/server/domains/organizations/service", () => ({
  searchCurrentOrganizationDirectoryExact,
}));

import { GET } from "./route";

describe("GET /api/workspace/directory", () => {
  beforeEach(() => {
    searchCurrentOrganizationDirectoryExact.mockReset();
  });

  it("returns directory matches", async () => {
    searchCurrentOrganizationDirectoryExact.mockResolvedValue([
      {
        id: "profile-1",
        authUserId: "user-1",
        email: "agent@example.com",
        name: "Agent",
        membershipState: "not-member",
        canMessage: true,
      },
    ]);

    const response = await GET(new NextRequest("http://localhost/api/workspace/directory?q=agent@example.com"));

    expect(searchCurrentOrganizationDirectoryExact).toHaveBeenCalledWith("agent@example.com");
    expect(response.status).toBe(200);
  });

  it("serializes domain failures", async () => {
    searchCurrentOrganizationDirectoryExact.mockRejectedValue(
      new DomainError({
        code: "FORBIDDEN",
        message: "Workspace required",
        status: 403,
      }),
    );

    const response = await GET(new NextRequest("http://localhost/api/workspace/directory?q=test"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      message: "Workspace required",
      status: 403,
    });
  });
});
