import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import {
  requireAdminSession,
  requireBrokerSession,
  requireDeveloperSession,
} from "./guards";

describe("auth guards", () => {
  it("accepts broker sessions with a broker link", async () => {
    vi.mocked(requireSessionContext).mockResolvedValue({
      token: "token",
      context: { userId: "u1", role: "broker", brokerId: "broker-1", isActive: true },
      profile: null,
    });

    await expect(requireBrokerSession()).resolves.toMatchObject({
      context: { brokerId: "broker-1" },
    });
  });

  it("rejects broker sessions without a linked broker", async () => {
    vi.mocked(requireSessionContext).mockResolvedValue({
      token: "token",
      context: { userId: "u1", role: "broker", isActive: true },
      profile: null,
    });

    await expect(requireBrokerSession()).rejects.toBeInstanceOf(DomainError);
  });

  it("accepts developer sessions for either developer role label", async () => {
    vi.mocked(requireSessionContext).mockResolvedValue({
      token: "token",
      context: { userId: "u1", role: "RED", redId: "red-1", isActive: true },
      profile: null,
    });

    await expect(requireDeveloperSession()).resolves.toMatchObject({
      context: { redId: "red-1" },
    });
  });

  it("rejects non-admin sessions from admin guard", async () => {
    vi.mocked(requireSessionContext).mockResolvedValue({
      token: "token",
      context: { userId: "u1", role: "broker", brokerId: "broker-1", isActive: true },
      profile: null,
    });

    await expect(requireAdminSession()).rejects.toBeInstanceOf(DomainError);
  });
});
