import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedProfile(
  t: ReturnType<typeof convexTest>,
  args: {
    authUserId: string;
    email: string;
    name: string;
    role: "broker" | "developer" | "user";
    brokerId?: string;
    REDId?: string;
  },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      brokerId: args.brokerId,
      REDId: args.REDId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

it("lets owners list and revoke explicit property viewers", async () => {
  const t = convexTest(schema, modules);
  const ownerIdentity = makeIdentity({
    subject: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
  });
  const viewerIdentity = makeIdentity({
    subject: "auth-viewer",
    email: "viewer@example.com",
    name: "Viewer",
  });

  const { brokerId, propertyId } = await t.run(async (ctx) => {
    const ownerBrokerId = await ctx.db.insert("brokers", { name: "Owner Broker", slug: "owner-broker" } as any);
    const ownerPropertyId = await ctx.db.insert("properties", {
      title: "Private Project",
      address: "Riyadh",
      price: 100,
      beds: 3,
      baths: 2,
      description: "Private project",
      searchText: "Private Project Riyadh",
      publicationState: "published",
      brokerId: ownerBrokerId,
    } as any);
    await ctx.db.insert("propertyViewerAccess", {
      propertyId: ownerPropertyId,
      authUserId: "auth-viewer",
      accessSource: "chat_share",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    return { brokerId: ownerBrokerId, propertyId: ownerPropertyId };
  });

  await seedProfile(t, {
    authUserId: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
    role: "broker",
    brokerId,
  });
  await seedProfile(t, {
    authUserId: "auth-viewer",
    email: "viewer@example.com",
    name: "Viewer",
    role: "user",
  });

  const viewers = await t.withIdentity(ownerIdentity).query(
    api.shared_logic.projectAccess.listPropertyViewers as never,
    { propertyId } as never,
  );
  expect(viewers).toEqual([
    expect.objectContaining({
      authUserId: "auth-viewer",
      email: "viewer@example.com",
    }),
  ]);

  await t.withIdentity(ownerIdentity).mutation(
    api.shared_logic.projectAccess.revokePropertyViewer as never,
    { propertyId, viewerAuthUserId: "auth-viewer" } as never,
  );

  const hasAccess = await t.withIdentity(viewerIdentity).query(
    api.shared_logic.projectAccess.hasExplicitProjectViewerAccess as never,
    { propertyId } as never,
  );
  expect(hasAccess).toBe(false);
});

it("promotes inbox-shared viewers and lets them read project assets", async () => {
  const t = convexTest(schema, modules);
  const ownerIdentity = makeIdentity({
    subject: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
  });
  const sharedIdentity = makeIdentity({
    subject: "auth-shared",
    email: "shared@example.com",
    name: "Shared User",
  });

  const { brokerId, propertyId, conversationId } = await t.run(async (ctx) => {
    const ownerBrokerId = await ctx.db.insert("brokers", { name: "Owner Broker", slug: "owner-broker" } as any);
    const ownerPropertyId = await ctx.db.insert("properties", {
      title: "Shared Project",
      address: "Jeddah",
      price: 200,
      beds: 4,
      baths: 3,
      description: "Shared project",
      searchText: "Shared Project Jeddah",
      publicationState: "published",
      brokerId: ownerBrokerId,
    } as any);
    const inboxConversationId = await ctx.db.insert("inboxConversations", {
      directKey: "auth-owner__auth-shared",
      firstParticipantUserId: "auth-owner",
      secondParticipantUserId: "auth-shared",
      createdByUserId: "auth-owner",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    await Promise.all([
      ctx.db.insert("inboxConversationParticipants", {
        conversationId: inboxConversationId,
        userId: "auth-owner",
        otherUserId: "auth-shared",
        joinedAt: Date.now(),
        unreadCount: 0,
      } as any),
      ctx.db.insert("inboxConversationParticipants", {
        conversationId: inboxConversationId,
        userId: "auth-shared",
        otherUserId: "auth-owner",
        joinedAt: Date.now(),
        unreadCount: 0,
      } as any),
      ctx.db.insert("inboxMessages", {
        conversationId: inboxConversationId,
        senderUserId: "auth-owner",
        recipientUserId: "auth-shared",
        type: "project_share",
        body: "Project share",
        metadata: { propertyId: ownerPropertyId },
        createdAt: Date.now(),
      } as any),
      ctx.db.insert("organizationAssets", {
        tenantOrgId: "tenant-owner",
        uploaderAuthUserId: "auth-owner",
        category: "project_image",
        kind: "image",
        key: "asset-1",
        url: "https://example.com/asset-1.jpg",
        name: "Asset 1",
        size: 100,
        mime: "image/jpeg",
        lifecycleState: "active",
        attachedEntityType: "project",
        attachedEntityId: ownerPropertyId,
        visibilityScope: "project_private_share",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any),
    ]);
    return { brokerId: ownerBrokerId, propertyId: ownerPropertyId, conversationId: inboxConversationId };
  });

  await seedProfile(t, {
    authUserId: "auth-owner",
    email: "owner@example.com",
    name: "Owner",
    role: "broker",
    brokerId,
  });
  await seedProfile(t, {
    authUserId: "auth-shared",
    email: "shared@example.com",
    name: "Shared User",
    role: "user",
  });

  const promotion = await t.withIdentity(sharedIdentity).mutation(
    api.shared_logic.projectAccess.promoteCurrentUserToProjectViewer as never,
    { propertyId, sharedByAuthUserId: "auth-owner" } as never,
  );
  expect(promotion).toEqual({ alreadyOwner: false, promoted: true });

  const assets = await t.withIdentity(sharedIdentity).query(
    api.shared_logic.organizationAssets.listProjectAssetsForViewer as never,
    { propertyId } as never,
  );
  expect((assets as any[])[0]?.name).toBe("Asset 1");
  expect(conversationId).toBeTruthy();

  const explicitAccess = await t.withIdentity(sharedIdentity).query(
    api.shared_logic.projectAccess.hasExplicitProjectViewerAccess as never,
    { propertyId } as never,
  );
  expect(explicitAccess).toBe(true);

  const ownerAssets = await t.withIdentity(ownerIdentity).query(
    api.shared_logic.organizationAssets.listProjectAssetsForViewer as never,
    { propertyId } as never,
  );
  expect((ownerAssets as any[])).toHaveLength(1);
});

it("blocks unrelated users from promoting themselves or reading shared project assets", async () => {
  const t = convexTest(schema, modules);
  const strangerIdentity = makeIdentity({
    subject: "auth-stranger",
    email: "stranger@example.com",
    name: "Stranger",
  });

  const propertyId = await t.run(async (ctx) => {
    const brokerId = await ctx.db.insert("brokers", { name: "Owner Broker", slug: "owner-broker" } as any);
    return ctx.db.insert("properties", {
      title: "Restricted Project",
      address: "Cairo",
      price: 300,
      beds: 5,
      baths: 4,
      description: "Restricted project",
      searchText: "Restricted Project Cairo",
      publicationState: "published",
      brokerId,
    } as any);
  });

  await seedProfile(t, {
    authUserId: "auth-stranger",
    email: "stranger@example.com",
    name: "Stranger",
    role: "user",
  });

  await expect(
    t.withIdentity(strangerIdentity).mutation(
      api.shared_logic.projectAccess.promoteCurrentUserToProjectViewer as never,
      { propertyId } as never,
    ),
  ).rejects.toThrow("Property access not granted");

  await expect(
    t.withIdentity(strangerIdentity).query(
      api.shared_logic.organizationAssets.listProjectAssetsForViewer as never,
      { propertyId } as never,
    ),
  ).rejects.toThrow("Property access not granted");
});
