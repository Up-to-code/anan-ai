import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  addBrokerDealDocument,
  createBrokerDeal,
  listBrokerDealsByProperty,
  updateBrokerDealStage,
} from "./index";

function requireBroker() {
  return vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "broker", brokerId: "broker-1", isActive: true },
    profile: null,
  }));
}

describe("broker crm server functions", () => {
  it("creates a broker deal after property ownership validation", async () => {
    const crmRepository = {
      create: vi.fn(async () => "deal-1"),
    };
    const propertiesRepository = {
      getProperty: vi.fn(async () => ({
        _id: "property-1",
        brokerId: "broker-1",
        title: "Villa",
        address: "Riyadh",
        description: "Desc",
        price: 1,
        beds: 1,
        baths: 1,
      })),
    };

    await expect(
      createBrokerDeal(
        { title: "Deal", stage: "new", propertyId: "property-1" },
        { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository },
      ),
    ).resolves.toBe("deal-1");
  });

  it("rejects property-scoped reads for non-owned properties", async () => {
    await expect(
      listBrokerDealsByProperty(
        { propertyId: "property-1" },
        {
          requireBroker: requireBroker(),
          crmRepository: {} as never,
          propertiesRepository: {
            getProperty: vi.fn(async () => ({
              _id: "property-1",
              brokerId: "broker-2",
              title: "Villa",
              address: "Riyadh",
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

  it("updates and appends documents only for owned deals", async () => {
    const crmRepository = {
      getById: vi.fn(async () => ({ id: "deal-1", brokerId: "broker-1", stage: "new", title: "Deal" })),
      updateStage: vi.fn(async () => undefined),
      addDocument: vi.fn(async () => undefined),
    };

    await updateBrokerDealStage(
      { dealId: "deal-1", stage: "won" },
      { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository: {} as never },
    );
    await addBrokerDealDocument(
      { dealId: "deal-1", document: { key: "file-1", url: "https://files.test/file-1", name: "file-1.pdf" } },
      { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository: {} as never },
    );
    expect(crmRepository.updateStage).toHaveBeenCalled();
    expect(crmRepository.addDocument).toHaveBeenCalled();
  });
});
