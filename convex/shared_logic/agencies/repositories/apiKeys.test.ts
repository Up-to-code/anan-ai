import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../../../_generated/api";
import schema from "../../../schema";
import { modules } from "../../../test.setup";

async function seedBrokerKeyFixture(t: ReturnType<typeof convexTest>) {
  const now = Date.now();
  return t.run(async (ctx) => {
    const [brokerOneId, brokerTwoId] = await Promise.all([
      ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one", status: "active" } as any),
      ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two", status: "active" } as any),
    ]);

    const [ownClientId, foreignClientId] = await Promise.all([
      ctx.db.insert("crmClients", {
        ownerAuthUserId: "auth-broker-1",
        brokerId: brokerOneId,
        name: "Client One",
        createdAt: now - 1000,
        updatedAt: now - 1000,
      } as any),
      ctx.db.insert("crmClients", {
        ownerAuthUserId: "auth-broker-2",
        brokerId: brokerTwoId,
        name: "Client Two",
        createdAt: now - 1000,
        updatedAt: now - 1000,
      } as any),
    ]);

    const [ownPropertyId, foreignPropertyId] = await Promise.all([
      ctx.db.insert("properties", {
        title: "Property One",
        address: "Street One",
        brokerId: brokerOneId,
        price: 10,
        beds: 2,
        baths: 1,
        description: "Owned property",
        status: "available",
        publicationState: "draft",
        searchText: "Property One Street One",
      } as any),
      ctx.db.insert("properties", {
        title: "Property Two",
        address: "Street Two",
        brokerId: brokerTwoId,
        price: 20,
        beds: 3,
        baths: 2,
        description: "Foreign property",
        status: "available",
        publicationState: "draft",
        searchText: "Property Two Street Two",
      } as any),
    ]);

    const activeKeyId = await ctx.db.insert("organizationApiKeys", {
      keyId: "oak_active",
      prefix: "anan_1234",
      secretHash: "secret-hash-active",
      name: "Primary Key",
      permissions: [
        { resource: "clients", action: "read" },
        { resource: "clients", action: "create" },
        { resource: "clients", action: "update" },
        { resource: "properties", action: "read" },
        { resource: "properties", action: "update" },
      ],
      status: "active",
      ownerType: "broker",
      ownerBrokerId: brokerOneId,
      createdBy: "auth-broker-1",
      createdAt: now - 2000,
    } as any);

    await ctx.db.insert("organizationApiKeys", {
      keyId: "oak_revoked",
      prefix: "anan_9999",
      secretHash: "secret-hash-revoked",
      name: "Revoked Key",
      permissions: [{ resource: "properties", action: "read" }],
      status: "revoked",
      ownerType: "broker",
      ownerBrokerId: brokerOneId,
      createdBy: "auth-broker-1",
      createdAt: now - 3000,
      revokedAt: now - 500,
    } as any);

    return {
      now,
      activeKeyId,
      ownClientId,
      foreignClientId,
      ownPropertyId,
      foreignPropertyId,
    };
  });
}

describe("organization api key machine mutations", () => {
  it("lists only the owning org clients and updates last-used timestamp", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    const result = await t.mutation(api.shared_logic.agencies.repositories.apiKeys.listClientsByApiKey as never, {
      secretHash: "secret-hash-active",
      now: seeded.now,
    } as never);

    expect((result as { clients: Array<{ id: string; name: string }> }).clients).toEqual([
      expect.objectContaining({ id: String(seeded.ownClientId), name: "Client One" }),
    ]);

    const storedKey = await t.run(async (ctx) => ctx.db.get(seeded.activeKeyId));
    expect(storedKey?.lastUsedAt).toBe(seeded.now);
  });

  it("rejects revoked keys", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    await expect(
      t.mutation(api.shared_logic.agencies.repositories.apiKeys.listPropertiesByApiKey as never, {
        secretHash: "secret-hash-revoked",
        now: seeded.now,
      } as never),
    ).rejects.toThrow("Invalid API key");
  });

  it("enforces the permission matrix for destructive actions", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    await expect(
      t.mutation(api.shared_logic.agencies.repositories.apiKeys.deleteClientByApiKey as never, {
        secretHash: "secret-hash-active",
        now: seeded.now,
        clientId: seeded.ownClientId,
      } as never),
    ).rejects.toThrow("Missing API key permission: clients:delete");
  });

  it("blocks cross-organization property updates even when the id exists", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    await expect(
      t.mutation(api.shared_logic.agencies.repositories.apiKeys.updatePropertyByApiKey as never, {
        secretHash: "secret-hash-active",
        now: seeded.now,
        propertyId: seeded.foreignPropertyId,
        title: "Foreign Update",
      } as never),
    ).rejects.toThrow("Property not found");
  });
});
