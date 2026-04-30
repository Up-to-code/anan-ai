import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { api } from "./_generated/api";
import { modules } from "./test.setup";

type TenantMember = {
  userId: string;
  role: string;
  status: "active";
  joinedAt: number;
  _creationTime: number;
};

type TenantOrganization = {
  _id: string;
  name: string;
  slug?: string;
  metadata?: Record<string, unknown>;
  members: Map<string, TenantMember>;
};

const tenantState = vi.hoisted(() => {
  const organizations = new Map<string, TenantOrganization>();
  function reset() {
    organizations.clear();
  }
  function ensureOrganization(tenantOrgId: string, args: { name: string; slug?: string; metadata?: Record<string, unknown> }) {
    let existing = organizations.get(tenantOrgId);
    if (!existing) {
      existing = {
        _id: tenantOrgId,
        name: args.name,
        slug: args.slug,
        metadata: args.metadata,
        members: new Map<string, TenantMember>(),
      };
      organizations.set(tenantOrgId, existing);
    } else {
      existing.name = args.name;
      existing.slug = args.slug;
      existing.metadata = args.metadata;
    }
    return existing;
  }
  return {
    organizations,
    reset,
    ensureOrganization,
  };
});

const tenantsMock = vi.hoisted(() => ({
  createOrganization: vi.fn(async (_ctx: unknown, authUserId: string, name: string, options?: { slug?: string; metadata?: Record<string, unknown> }) => {
    const tenantOrgId = `tenant-${options?.slug ?? authUserId}`;
    const organization = tenantState.ensureOrganization(tenantOrgId, {
      name,
      slug: options?.slug,
      metadata: options?.metadata,
    });
    if (!organization.members.has(authUserId)) {
      const now = Date.now();
      organization.members.set(authUserId, {
        userId: authUserId,
        role: "owner",
        status: "active",
        joinedAt: now,
        _creationTime: now,
      });
    }
    return tenantOrgId;
  }),
  getMember: vi.fn(async (_ctx: unknown, tenantOrgId: string, authUserId: string) => {
    return tenantState.organizations.get(tenantOrgId)?.members.get(authUserId) ?? null;
  }),
  addMember: vi.fn(async (_ctx: unknown, _actorAuthUserId: string, tenantOrgId: string, authUserId: string, role: string) => {
    const organization = tenantState.organizations.get(tenantOrgId);
    if (!organization) return;
    const now = Date.now();
    organization.members.set(authUserId, {
      userId: authUserId,
      role,
      status: "active",
      joinedAt: now,
      _creationTime: now,
    });
  }),
  updateMemberRole: vi.fn(async (_ctx: unknown, _actorAuthUserId: string, tenantOrgId: string, authUserId: string, role: string) => {
    const organization = tenantState.organizations.get(tenantOrgId);
    const existing = organization?.members.get(authUserId);
    if (!organization || !existing) return;
    organization.members.set(authUserId, { ...existing, role });
  }),
  listOrganizations: vi.fn(async (_ctx: unknown, authUserId: string) => {
    return Array.from(tenantState.organizations.values())
      .filter((organization) => organization.members.has(authUserId))
      .map((organization) => ({
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        metadata: organization.metadata,
      }));
  }),
  listMembers: vi.fn(async (_ctx: unknown, tenantOrgId: string, options?: { status?: string }) => {
    const members = Array.from(tenantState.organizations.get(tenantOrgId)?.members.values() ?? []);
    if (!options?.status) return members;
    return members.filter((member) => member.status === options.status);
  }),
  getOrganization: vi.fn(async (_ctx: unknown, tenantOrgId: string) => {
    const organization = tenantState.organizations.get(tenantOrgId);
    if (!organization) return null;
    return {
      _id: organization._id,
      name: organization.name,
      slug: organization.slug,
      metadata: organization.metadata,
    };
  }),
  listInvitations: vi.fn(async () => []),
}));

vi.mock("./tenants", () => ({
  tenants: tenantsMock,
}));

vi.mock("./auditLog", () => ({
  auditLog: {
    log: vi.fn(async () => undefined),
    logChange: vi.fn(async () => undefined),
  },
}));

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedRealPlaygroundUser(t: ReturnType<typeof convexTest>, args: { email: string; name: string }) {
  const user = await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      displayName: args.name,
    } as any);
    return { userId: String(userId) };
  });
  return {
    authUserId: user.userId,
    identity: makeIdentity({
      subject: user.userId,
      email: args.email,
      name: args.name,
    }),
  };
}

async function seedLegacyPlaygroundOwnerWithoutTenantLink(
  t: ReturnType<typeof convexTest>,
  args: { email: string; name: string },
) {
  return t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      displayName: args.name,
    } as any);
    const redId = await ctx.db.insert("RED", {
      name: "Legacy Developer",
      slug: "legacy-playground-red",
      status: "active",
      isVerified: false,
      contactEmail: args.email,
    } as any);
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: String(userId),
      email: args.email,
      name: args.name,
      role: "developer",
      roleStatus: "approved",
      isActive: true,
      REDId: redId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    return { userId: String(userId), redId: String(redId), profileId: String(profileId) };
  });
}

async function readSeedRows(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const [brokers, developers, profiles, properties, clients, deals, banks, orders] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("crmClients").collect(),
      ctx.db.query("deals").collect(),
      ctx.db.query("banks").collect(),
      ctx.db.query("orders").collect(),
    ]);
    return { brokers, developers, profiles, properties, clients, deals, banks, orders };
  });
}

function countBy<T>(rows: T[], keyOf: (row: T) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

beforeEach(() => {
  tenantState.reset();
  tenantsMock.createOrganization.mockClear();
  tenantsMock.getMember.mockClear();
  tenantsMock.addMember.mockClear();
  tenantsMock.updateMemberRole.mockClear();
  tenantsMock.listOrganizations.mockClear();
  tenantsMock.listMembers.mockClear();
  tenantsMock.getOrganization.mockClear();
  tenantsMock.listInvitations.mockClear();
});

describe("seedSaudiWorkspaceDataset", () => {
  it("creates a large Saudi dataset with minimum org/project/member coverage", async () => {
    const t = convexTest(schema, modules);
    const playgroundEmail = "playground.owner@example.com";
    await seedRealPlaygroundUser(t, { email: playgroundEmail, name: "Playground Owner" });

    const result = await (t as any).action((api as any).seed.seedSaudiWorkspaceDataset, {
      playgroundOwnerEmail: playgroundEmail,
      batchLabel: "batch-alpha",
    });

    expect(result.organizations).toBe(50);
    expect(result.developers).toBe(25);
    expect(result.brokers).toBe(25);
    expect(result.playgroundOrganizationId).toBeTruthy();
    expect(result.playgroundStatus).toBe("created");
    expect(result.properties).toBeGreaterThanOrEqual(1000);
    expect(result.crmClients).toBeGreaterThan(0);
    expect(result.deals).toBeGreaterThan(0);
    expect(result.offers).toBeGreaterThan(0);
    expect(result.messages).toBeGreaterThan(0);
    expect(result.banks).toBe(10);
    expect(result.bankProducts).toBeGreaterThanOrEqual(20);
    expect(result.loanOrders).toBeGreaterThan(result.propertyOrders);
    expect(result.publishedPropertiesWithBank).toBeGreaterThan(0);

    const rows = await readSeedRows(t);
    const seededBrokers = rows.brokers.filter((row) => row.slug.startsWith("seed-saudi-"));
    const seededDevelopers = rows.developers.filter((row) => row.slug.startsWith("seed-saudi-"));
    expect(seededBrokers).toHaveLength(25);
    expect(seededDevelopers).toHaveLength(25);
    expect(rows.banks.filter((row) => row.slug.startsWith("saudi-") || row.slug.endsWith("-seed"))).toHaveLength(10);
    const bankProductCount = rows.banks.reduce((sum, bank) => sum + (bank.products?.length ?? 0), 0);
    expect(bankProductCount).toBeGreaterThanOrEqual(20);

    const memberCounts = countBy(
      rows.profiles.filter(
        (profile) =>
          profile.currentTenantOrgId &&
          (profile.authUserId.startsWith("seed-saudi-") || profile.email === playgroundEmail),
      ),
      (profile) => profile.currentTenantOrgId,
    );
    expect(Math.min(...Array.from(memberCounts.values()))).toBeGreaterThanOrEqual(5);

    const propertyCounts = new Map<string, number>();
    for (const property of rows.properties.filter((row) => row.sourceSystem === "seed.saudi_workspace_v1")) {
      const key = property.brokerId ? `broker:${String(property.brokerId)}` : property.REDId ? `red:${String(property.REDId)}` : null;
      if (!key) continue;
      propertyCounts.set(key, (propertyCounts.get(key) ?? 0) + 1);
    }
    expect(propertyCounts.size).toBe(50);
    expect(Math.min(...Array.from(propertyCounts.values()))).toBeGreaterThanOrEqual(20);

    const publicationStates = rows.properties
      .filter((row) => row.sourceSystem === "seed.saudi_workspace_v1")
      .map((row) => row.publicationState);
    expect(publicationStates).toContain("published");
    expect(publicationStates).toContain("draft");
    const publishedSeedProperties = rows.properties.filter(
      (row) => row.sourceSystem === "seed.saudi_workspace_v1" && row.publicationState === "published",
    );
    const publishedWithBank = publishedSeedProperties.filter((row) => Boolean(row.bankId));
    expect(publishedWithBank.length / publishedSeedProperties.length).toBeGreaterThanOrEqual(0.8);

    const seededOrders = rows.orders.filter((row) => (row.intent ?? "").includes("seed.saudi_workspace_v1:"));
    expect(seededOrders.filter((row) => row.type === "loan").length).toBeGreaterThan(
      seededOrders.filter((row) => row.type === "property").length,
    );
    expect(seededOrders.filter((row) => row.type === "loan" && row.bankId).length).toBeGreaterThan(0);

    const riyadhProperty = rows.properties.find(
      (property) => property.sourceSystem === "seed.saudi_workspace_v1" && property.location === "الرياض" && property.publicationState === "published",
    );
    expect(riyadhProperty).toBeTruthy();

    expect(riyadhProperty).toBeTruthy();
  });

  it("appends a second batch while reusing the playground organization", async () => {
    const t = convexTest(schema, modules);
    const playgroundEmail = "playground.owner@example.com";
    await seedRealPlaygroundUser(t, { email: playgroundEmail, name: "Playground Owner" });

    const firstRun = await (t as any).action((api as any).seed.seedSaudiWorkspaceDataset, {
      playgroundOwnerEmail: playgroundEmail,
      batchLabel: "batch-one",
    });
    const secondRun = await (t as any).action((api as any).seed.seedSaudiWorkspaceDataset, {
      playgroundOwnerEmail: playgroundEmail,
      batchLabel: "batch-two",
    });

    expect(firstRun.playgroundOrganizationId).toBeTruthy();
    expect(secondRun.playgroundOrganizationId).toBe(firstRun.playgroundOrganizationId);
    expect(secondRun.playgroundStatus).toBe("reused");
    expect(secondRun.organizations).toBeGreaterThan(firstRun.organizations);
    expect(secondRun.properties).toBeGreaterThan(firstRun.properties);
    expect(secondRun.crmClients).toBeGreaterThan(firstRun.crmClients);
    expect(secondRun.messages).toBeGreaterThan(firstRun.messages);
    expect(secondRun.loanOrders).toBeGreaterThan(firstRun.loanOrders);
    expect(secondRun.bankProducts).toBeGreaterThan(0);
    expect(secondRun.publishedPropertiesWithBank).toBeGreaterThan(0);

    const rows = await readSeedRows(t);
    const batchOneRows = rows.properties.filter((row) => row.externalId?.includes("batch-one"));
    const batchTwoRows = rows.properties.filter((row) => row.externalId?.includes("batch-two"));
    expect(batchOneRows.length).toBeGreaterThan(0);
    expect(batchTwoRows.length).toBeGreaterThan(0);
  });

  it("reuses a legacy playground owner org that is missing tenant linkage", async () => {
    const t = convexTest(schema, modules);
    const playgroundEmail = "legacy.owner@example.com";
    const legacy = await seedLegacyPlaygroundOwnerWithoutTenantLink(t, {
      email: playgroundEmail,
      name: "Legacy Owner",
    });

    const result = await (t as any).action((api as any).seed.seedSaudiWorkspaceDataset, {
      playgroundOwnerEmail: playgroundEmail,
      batchLabel: "legacy-tenant-repair",
    });

    expect(result.playgroundStatus).toBe("reused");
    expect(result.playgroundOrganizationId).toBe(legacy.redId);

    const rows = await t.run(async (ctx) => {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("email", (q) => q.eq("email", playgroundEmail))
        .first();
      const tenantLink = await ctx.db
        .query("tenantOrgLinks")
        .withIndex("ownerREDId", (q) => q.eq("ownerREDId", legacy.redId as any))
        .first();
      return { profile, tenantLink };
    });

    expect(rows.tenantLink?.tenantOrgId).toBeTruthy();
    expect(rows.profile?.currentTenantOrgId).toBe(rows.tenantLink?.tenantOrgId);
  });

  it("binds the playground owner to a real current organization with projects, crm, offers, and inbox activity", async () => {
    const t = convexTest(schema, modules);
    const playgroundEmail = "playground.owner@example.com";
    const realUser = await seedRealPlaygroundUser(t, { email: playgroundEmail, name: "Playground Owner" });

    const seedResult = await (t as any).action((api as any).seed.seedSaudiWorkspaceDataset, {
      playgroundOwnerEmail: playgroundEmail,
      batchLabel: "workspace-smoke",
    });

    const currentOrganization = await t.withIdentity(realUser.identity).query(
      (api as any)["shared_logic/agencies/repositories/organization"].getCurrentOrganization,
      {},
    );
    expect(currentOrganization.organization).toEqual(
      expect.objectContaining({
        id: seedResult.playgroundOrganizationId,
        type: "red",
      }),
    );

    const teamMembers = await t.withIdentity(realUser.identity).query(
      (api as any)["shared_logic/agencies/repositories/membership"].listCurrentTeamMembers,
      {},
    );
    expect(teamMembers.length).toBeGreaterThanOrEqual(5);

    const redId = seedResult.playgroundOrganizationId;
    const projects = await t.withIdentity(realUser.identity).query(
      (api as any).red_zone.properties.listByRedId,
      {
        REDId: redId,
        paginationOpts: { cursor: null, numItems: 60 },
      },
    );
    expect(projects.page.length).toBeGreaterThan(0);

    const clients = await t.query((api as any)["shared_logic/crm/repositories"].listClientsByRedId, {
      REDId: redId,
    });
    const deals = await t.query((api as any)["shared_logic/crm/repositories"].listDealsByRedId, {
      REDId: redId,
    });
    expect(clients.length).toBeGreaterThan(0);
    expect(deals.length).toBeGreaterThan(0);

    const offerQueues = await t.withIdentity(realUser.identity).query((api as any)["shared_logic/offers"].getWorkspaceOfferQueues, {});
    expect(offerQueues.sent.length + offerQueues.received.length + offerQueues.marketplace.length).toBeGreaterThan(0);

    const conversations = await t.withIdentity(realUser.identity).query((api as any).shared_logic.inbox.listConversations, {});
    expect(conversations.length).toBeGreaterThan(0);
  });
});
