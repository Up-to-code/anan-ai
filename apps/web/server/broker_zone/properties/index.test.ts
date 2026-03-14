import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerProperty,
  listBrokerProperties,
  publishBrokerProperty,
  updateBrokerProperty,
} from "./index";

function makeRepository() {
  return {
    listProperties: vi.fn(async () => ({
      page: [],
      isDone: true,
      continueCursor: "",
    })),
    getProperty: vi.fn(),
    createProperty: vi.fn(async () => "property-1"),
    updateProperty: vi.fn(async () => undefined),
    deleteProperty: vi.fn(async () => undefined),
    publishProperty: vi.fn(async () => ({ ok: true as const })),
  };
}

function requireBrokerSession() {
  return vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
    profile: null,
  }));
}

describe("broker property server functions", () => {
  it("lists broker properties through the repository", async () => {
    const repository = makeRepository();
    await listBrokerProperties(
      { paginationOpts: { cursor: null, numItems: 10 } },
      { requireSession: requireBrokerSession(), repository },
    );
    expect(repository.listProperties).toHaveBeenCalledWith("broker-1", {
      paginationOpts: { cursor: null, numItems: 10 },
    });
  });

  it("rejects property access when ownership mismatches", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Villa",
      address: "Riyadh",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      brokerId: "broker-2",
    });

    await expect(
      getBrokerProperty({ id: "property-1" }, { requireSession: requireBrokerSession(), repository }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("creates a broker property", async () => {
    const repository = makeRepository();
    await expect(
      createBrokerProperty(
        {
          title: "Villa",
          address: "Riyadh",
          description: "Desc",
          price: 100,
          beds: 3,
          baths: 2,
        },
        { requireSession: requireBrokerSession(), repository },
      ),
    ).resolves.toBe("property-1");
    expect(repository.createProperty).toHaveBeenCalledWith("broker-1", expect.any(Object));
  });

  it("updates an owned broker property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Villa",
      address: "Riyadh",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      brokerId: "broker-1",
    });
    await updateBrokerProperty(
      { id: "property-1", patch: { price: 200 } },
      { requireSession: requireBrokerSession(), repository },
    );
    expect(repository.updateProperty).toHaveBeenCalledWith("property-1", { price: 200 });
  });

  it("deletes an owned broker property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Villa",
      address: "Riyadh",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      brokerId: "broker-1",
    });
    await deleteBrokerProperty(
      { id: "property-1" },
      { requireSession: requireBrokerSession(), repository },
    );
    expect(repository.deleteProperty).toHaveBeenCalledWith("property-1");
  });

  it("publishes an owned broker property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Villa",
      address: "Riyadh",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      brokerId: "broker-1",
    });
    await expect(
      publishBrokerProperty(
        { id: "property-1" },
        { requireSession: requireBrokerSession(), repository },
      ),
    ).resolves.toEqual({ ok: true });
  });
});
