import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  createRedProperty,
  deleteRedProperty,
  getRedProperty,
  listRedProperties,
  publishRedProperty,
  updateRedProperty,
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

function requireRedSession() {
  return vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "developer", isActive: true, redId: "red-1" },
    profile: null,
  }));
}

describe("red property server functions", () => {
  it("lists RED properties through the repository", async () => {
    const repository = makeRepository();
    await listRedProperties(
      { paginationOpts: { cursor: null, numItems: 10 } },
      { requireSession: requireRedSession(), repository },
    );
    expect(repository.listProperties).toHaveBeenCalledWith("red-1", {
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
      REDId: "red-2",
    });

    await expect(
      getRedProperty({ id: "property-1" }, { requireSession: requireRedSession(), repository }),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("creates a RED property", async () => {
    const repository = makeRepository();
    await expect(
      createRedProperty(
        {
          title: "Tower",
          address: "Jeddah",
          description: "Desc",
          price: 100,
          beds: 3,
          baths: 2,
        },
        { requireSession: requireRedSession(), repository },
      ),
    ).resolves.toBe("property-1");
    expect(repository.createProperty).toHaveBeenCalledWith("red-1", expect.any(Object));
  });

  it("updates an owned RED property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Tower",
      address: "Jeddah",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      REDId: "red-1",
    });
    await updateRedProperty(
      { id: "property-1", patch: { price: 200 } },
      { requireSession: requireRedSession(), repository },
    );
    expect(repository.updateProperty).toHaveBeenCalledWith("property-1", { price: 200 });
  });

  it("deletes an owned RED property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Tower",
      address: "Jeddah",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      REDId: "red-1",
    });
    await deleteRedProperty(
      { id: "property-1" },
      { requireSession: requireRedSession(), repository },
    );
    expect(repository.deleteProperty).toHaveBeenCalledWith("property-1");
  });

  it("publishes an owned RED property", async () => {
    const repository = makeRepository();
    repository.getProperty.mockResolvedValue({
      _id: "property-1",
      title: "Tower",
      address: "Jeddah",
      description: "Desc",
      price: 1,
      beds: 1,
      baths: 1,
      REDId: "red-1",
    });
    await expect(
      publishRedProperty(
        { id: "property-1" },
        { requireSession: requireRedSession(), repository },
      ),
    ).resolves.toEqual({ ok: true });
  });
});
