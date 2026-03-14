import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getBrokerOverview } from "./index";

describe("getBrokerOverview", () => {
  it("rejects non-broker sessions", async () => {
    await expect(
      getBrokerOverview({
        requireSession: vi.fn(async () => ({
          token: "token",
          context: { userId: "user-1", role: "developer", isActive: true, redId: "red-1" },
          profile: null,
        })),
        repository: { getOverview: vi.fn() },
      }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("returns broker overview for a broker session", async () => {
    const repository = {
      getOverview: vi.fn(async () => ({ properties: 4 })),
    };

    await expect(
      getBrokerOverview({
        requireSession: vi.fn(async () => ({
          token: "token",
          context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
          profile: null,
        })),
        repository,
      }),
    ).resolves.toEqual({ properties: 4 });

    expect(repository.getOverview).toHaveBeenCalledWith("broker-1");
  });
});
