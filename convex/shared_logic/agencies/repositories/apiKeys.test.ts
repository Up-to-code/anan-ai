import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../../../_generated/api";
import schema from "../../../schema";
import { modules } from "../../../test.setup";

async function seedBrokerKeyFixture(t: ReturnType<typeof convexTest>) {
  const now = Date.now();
  return t.run(async (ctx) => {
    const [brokerOneId, brokerTwoId, relatedBrokerId] = await Promise.all([
      ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one", status: "active" } as any),
      ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two", status: "active" } as any),
      ctx.db.insert("brokers", { name: "Related Broker", slug: "related-broker", status: "active", phone: "+966500000001", isVerified: true } as any),
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

    const [ownDealId, foreignDealId] = await Promise.all([
      ctx.db.insert("deals", {
        title: "Deal One",
        brokerId: brokerOneId,
        crmClientId: ownClientId,
        propertyId: ownPropertyId,
        relatedBrokerId,
        relationType: "broker_managed",
        stage: "negotiation",
        createdAt: now - 1000,
      } as any),
      ctx.db.insert("deals", {
        title: "Deal Two",
        brokerId: brokerTwoId,
        crmClientId: foreignClientId,
        propertyId: foreignPropertyId,
        relationType: "internal_client",
        stage: "new",
        createdAt: now - 1000,
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
        { resource: "deals", action: "read" },
        { resource: "deals", action: "create" },
        { resource: "deals", action: "update" },
        { resource: "deals", action: "delete" },
        { resource: "brokers", action: "read" },
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
      ownDealId,
      foreignDealId,
      relatedBrokerId,
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

  it("persists external references on client writes", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    const result = await t.mutation(api.shared_logic.agencies.repositories.apiKeys.createClientByApiKey as never, {
      secretHash: "secret-hash-active",
      now: seeded.now,
      name: "Imported Client",
      sourceSystem: "hubspot",
      externalId: "ext-123",
      businessId: "biz-456",
    } as never);

    expect((result as { client: { sourceSystem?: string; externalId?: string; businessId?: string } }).client).toEqual(
      expect.objectContaining({
        sourceSystem: "hubspot",
        externalId: "ext-123",
        businessId: "biz-456",
      }),
    );
  });

  it("returns relation-rich deals for the owning organization only", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    const result = await t.mutation(api.shared_logic.agencies.repositories.apiKeys.listDealsByApiKey as never, {
      secretHash: "secret-hash-active",
      now: seeded.now,
    } as never);

    expect((result as { deals: Array<{ id: string; stage: string; client: { id: string } | null; project: { id: string } | null; broker: { id: string } | null }> }).deals).toEqual([
      expect.objectContaining({
        id: String(seeded.ownDealId),
        stage: "negotiation",
        client: expect.objectContaining({ id: String(seeded.ownClientId) }),
        project: expect.objectContaining({ id: String(seeded.ownPropertyId) }),
        broker: expect.objectContaining({ id: String(seeded.relatedBrokerId) }),
      }),
    ]);
  });

  it("lists brokers when the key has broker read access", async () => {
    const t = convexTest(schema, modules);
    const seeded = await seedBrokerKeyFixture(t);

    const result = await t.mutation(api.shared_logic.agencies.repositories.apiKeys.listBrokersByApiKey as never, {
      secretHash: "secret-hash-active",
      now: seeded.now,
    } as never);

    expect((result as { brokers: Array<{ id: string; name: string }> }).brokers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: String(seeded.relatedBrokerId), name: "Related Broker" }),
      ]),
    );
  });
});
