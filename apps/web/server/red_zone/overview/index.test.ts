import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getRedOverview } from "./index";

describe("getRedOverview", () => {
  it("rejects missing RED ownership", async () => {
    await expect(
      getRedOverview({
        requireSession: vi.fn(async () => ({
          token: "token",
          context: { userId: "user-1", role: "developer", isActive: true },
          profile: null,
        })),
        repository: { getOverview: vi.fn() },
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("returns overview for a developer-linked RED session", async () => {
    const repository = {
      getOverview: vi.fn(async () => ({ properties: 3 })),
    };

    await expect(
      getRedOverview({
        requireSession: vi.fn(async () => ({
          token: "token",
          context: { userId: "user-1", role: "developer", isActive: true, redId: "red-1" },
          profile: null,
        })),
        repository,
      }),
    ).resolves.toEqual({ properties: 3 });

    expect(repository.getOverview).toHaveBeenCalledWith("red-1");
  });
});
