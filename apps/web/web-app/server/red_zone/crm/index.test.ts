import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  createRedDeal,
  listRedDealsByProperty,
  updateRedDealNotes,
} from "./index";

function requireDeveloper() {
  return vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "developer", redId: "red-1", isActive: true },
    profile: null,
  }));
}

describe("red crm server functions", () => {
  it("creates a developer deal after property ownership validation", async () => {
    const crmRepository = {
      create: vi.fn(async () => "deal-1"),
    };
    const propertiesRepository = {
      getProperty: vi.fn(async () => ({
        _id: "property-1",
        REDId: "red-1",
        title: "Tower",
        address: "Jeddah",
        description: "Desc",
        price: 1,
        beds: 1,
        baths: 1,
      })),
    };

    await expect(
      createRedDeal(
        { title: "Deal", stage: "new", propertyId: "property-1" },
        { requireDeveloper: requireDeveloper(), crmRepository: crmRepository as never, propertiesRepository },
      ),
    ).resolves.toBe("deal-1");
  });

  it("rejects property-scoped reads for non-owned properties", async () => {
    await expect(
      listRedDealsByProperty(
        { propertyId: "property-1" },
        {
          requireDeveloper: requireDeveloper(),
          crmRepository: {} as never,
          propertiesRepository: {
            getProperty: vi.fn(async () => ({
              _id: "property-1",
              REDId: "red-2",
              title: "Tower",
              address: "Jeddah",
              description: "Desc",
              price: 1,
              beds: 1,
              baths: 1,
            })),
          },
        },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("updates notes only for owned deals", async () => {
    const crmRepository = {
      getById: vi.fn(async () => ({ id: "deal-1", redId: "red-1", stage: "new", title: "Deal" })),
      updateNotes: vi.fn(async () => undefined),
    };

    await updateRedDealNotes(
      { dealId: "deal-1", notes: "Follow up" },
      { requireDeveloper: requireDeveloper(), crmRepository: crmRepository as never, propertiesRepository: {} as never },
    );

    expect(crmRepository.updateNotes).toHaveBeenCalled();
  });
});
