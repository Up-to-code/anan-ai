import { expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  addBrokerDealDocument,
  archiveBrokerDeal,
  createBrokerDeal,
  listBrokerDealsByProperty,
  updateBrokerDeal,
  updateBrokerDealFollowUp,
  updateBrokerDealStage,
} from "./broker";

function requireBroker() {
  return vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "broker", brokerId: "broker-1", isActive: true },
    profile: null,
  }));
}

it("creates a broker deal after property ownership validation", async () => {
  const crmRepository = {
    create: vi.fn(async () => "deal-1"),
  };
  const propertiesRepository = {
    getProperty: vi.fn(async (_token: string, _propertyId: string) => ({
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
      { title: "Deal", stage: "new", propertyId: "property-1", relationType: "internal_client" },
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
          getProperty: vi.fn(async (_token: string, _propertyId: string) => ({
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
    update: vi.fn(async () => undefined),
    updateStage: vi.fn(async () => undefined),
    updateFollowUp: vi.fn(async () => undefined),
    archive: vi.fn(async () => undefined),
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
  await updateBrokerDealFollowUp(
    { dealId: "deal-1", nextFollowUpAt: Date.now() + 3600000 },
    { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository: {} as never },
  );
  expect(crmRepository.updateStage).toHaveBeenCalled();
  expect(crmRepository.updateFollowUp).toHaveBeenCalled();
  expect(crmRepository.addDocument).toHaveBeenCalled();
});

it("updates full deal fields and archives only owned broker deals", async () => {
  const crmRepository = {
    getById: vi.fn(async () => ({ id: "deal-1", brokerId: "broker-1", stage: "new", title: "Deal" })),
    update: vi.fn(async () => undefined),
    archive: vi.fn(async () => undefined),
  };
  const propertiesRepository = {
    getProperty: vi.fn(async (_token: string, _propertyId: string) => ({
      _id: "property-2",
      brokerId: "broker-1",
      title: "Updated Villa",
      address: "Riyadh",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
    })),
  };

  await updateBrokerDeal(
    {
      dealId: "deal-1",
      title: "Updated Deal",
      description: "Updated description",
      value: 2500000,
      nextFollowUpAt: 1_700_000_000_000,
      stage: "negotiation",
      relationType: "internal_client",
      contactName: "Client Updated",
      contactPhone: "+966500000000",
      propertyId: "property-2",
      notes: "Important note",
    },
    { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository },
  );

  await archiveBrokerDeal(
    { dealId: "deal-1" },
    { requireBroker: requireBroker(), crmRepository: crmRepository as never, propertiesRepository: {} as never },
  );

  expect(crmRepository.update).toHaveBeenCalledWith(expect.objectContaining({
    dealId: "deal-1",
    title: "Updated Deal",
    notes: "Important note",
    lastUpdatedBy: "user-1",
  }));
  expect(crmRepository.archive).toHaveBeenCalledWith(expect.objectContaining({
    dealId: "deal-1",
    lastUpdatedBy: "user-1",
    archivedAt: expect.any(Number),
  }));
});
