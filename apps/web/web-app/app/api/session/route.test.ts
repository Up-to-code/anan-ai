import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { requireSessionContext } = vi.hoisted(() => ({
  requireSessionContext: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

import { GET } from "./route";

describe("GET /api/session", () => {
  beforeEach(() => {
    requireSessionContext.mockReset();
  });

  it("returns the current session context", async () => {
    requireSessionContext.mockResolvedValue({
      context: {
        userId: "user-1",
        email: "owner@example.com",
        role: "broker",
        isActive: true,
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      userId: "user-1",
      email: "owner@example.com",
      role: "broker",
      isActive: true,
    });
  });

  it("serializes unauthorized errors", async () => {
    requireSessionContext.mockRejectedValue(
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
