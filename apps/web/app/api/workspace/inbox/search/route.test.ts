import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const { searchInboxTargets } = vi.hoisted(() => ({
  searchInboxTargets: vi.fn(),
}));

vi.mock("@/server/domains/inbox/service", () => ({
  searchInboxTargets,
}));

import { GET } from "./route";

describe("GET /api/workspace/inbox/search", () => {
  beforeEach(() => {
    searchInboxTargets.mockReset();
  });

  it("returns matching inbox targets", async () => {
    searchInboxTargets.mockResolvedValue([]);

    const response = await GET(new NextRequest("http://localhost/api/workspace/inbox/search?q=agent"));

    expect(searchInboxTargets).toHaveBeenCalledWith("agent");
    expect(response.status).toBe(200);
  });

  it("serializes domain failures", async () => {
    searchInboxTargets.mockRejectedValue(
      new DomainError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        status: 401,
      }),
    );

    const response = await GET(new NextRequest("http://localhost/api/workspace/inbox/search?q=agent"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  });
});
