import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { getCurrentProfileForCurrentUser } = vi.hoisted(() => ({
  getCurrentProfileForCurrentUser: vi.fn(),
}));

vi.mock("@/server/domains/profiles/service", () => ({
  getCurrentProfileForCurrentUser,
}));

import { GET } from "./route";

describe("GET /api/profile", () => {
  beforeEach(() => {
    getCurrentProfileForCurrentUser.mockReset();
  });

  it("returns the current profile", async () => {
    getCurrentProfileForCurrentUser.mockResolvedValue({
      role: "broker",
      roleStatus: "approved",
      brokerId: "broker-1",
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      role: "broker",
      roleStatus: "approved",
      brokerId: "broker-1",
    });
  });

  it("serializes unauthorized errors", async () => {
    getCurrentProfileForCurrentUser.mockRejectedValue(
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
