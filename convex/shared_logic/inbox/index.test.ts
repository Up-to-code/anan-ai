import { convexTest } from "convex-test";
import { expect, it, vi } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

vi.mock("../lib/middleware/rateLimit", () => ({
  enforceHttpRateLimit: vi.fn(async () => undefined),
}));
vi.mock("../notifications", () => ({
  createWorkspaceNotification: vi.fn(async () => null),
}));
const { mockTenants } = vi.hoisted(() => ({
  mockTenants: {
    listInvitations: vi.fn(async () => []),
    getMember: vi.fn(async () => null),
  },
}));
vi.mock("../../tenants", () => ({
  tenants: mockTenants,
}));

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedUserProfile(t: ReturnType<typeof convexTest>, args: {
  authUserId: string;
  email: string;
  name: string;
  role?: "user" | "broker" | "developer";
  brokerId?: string;
  developerId?: string;
  roleApprovalStatus?: "approved" | "pending";
}) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role ?? "user",
      brokerId: args.brokerId,
      developerId: args.developerId,
      isActive: true,
      roleApprovalStatus: args.roleApprovalStatus ?? "approved",
    } as any);
  });
}

async function seedDeveloperTargets(t: ReturnType<typeof convexTest>, redId: string) {
  await Promise.all(
    Array.from({ length: 205 }, (_, index) =>
      seedUserProfile(t, {
        authUserId: `auth-dev-${index}`,
        email: `dev-${index}@example.com`,
        name: `Target Developer ${index}`,
        role: "developer",
        developerId: redId as any,
      }),
    ),
  );
}

async function seedBrokerDeveloperSearchFixture(t: ReturnType<typeof convexTest>) {
  const identityOwner = makeIdentity({
    subject: "auth-owner",
    email: "owner@example.com",
    name: "Broker Owner",
  });
  let brokerId = "" as any;
  let redId = "" as any;
  await t.run(async (ctx) => {
    brokerId = await ctx.db.insert("brokers", {
      name: "Elite Brokers",
      slug: "elite-brokers",
    } as any);
    redId = await ctx.db.insert("RED", {
      name: "Palm Hills",
      slug: "palm-hills",
    } as any);
    await ctx.db.insert("tenantOrgLinks", {
      tenantOrgId: "tenant-broker",
      ownerType: "broker",
      ownerBrokerId: brokerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });

  await seedUserProfile(t, {
    authUserId: "auth-owner",
    email: "owner@example.com",
    name: "Broker Owner",
    role: "broker",
    brokerId,
  });
  await seedDeveloperTargets(t, redId);
  return { identityOwner };
}

it("orders conversations by the latest message activity", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "User A" });
  const identityB = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "User B" });
  const identityC = makeIdentity({ subject: "auth-c", email: "c@example.com", name: "User C" });
  await Promise.all([
    seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "User A" }),
    seedUserProfile(t, { authUserId: "auth-b", email: "b@example.com", name: "User B" }),
    seedUserProfile(t, { authUserId: "auth-c", email: "c@example.com", name: "User C" }),
  ]);

  const conversationAB = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-b" } as never,
  );
  const conversationAC = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-c" } as never,
  );
  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.sendConversationMessage as never,
    { conversationId: conversationAB, body: "First conversation" } as never,
  );
  await new Promise((resolve) => setTimeout(resolve, 5));
  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.sendConversationMessage as never,
    { conversationId: conversationAC, body: "Newest conversation" } as never,
  );

  const conversations = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];

  expect(conversations.map((item: any) => item.id)).toEqual([conversationAC, conversationAB]);
  expect(conversations[0]?.lastMessagePreview).toBe("Newest conversation");
});

it("increments recipient unread count and keeps sender unread count cleared", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "User A" });
  const identityB = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "User B" });

  await Promise.all([
    seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "User A" }),
    seedUserProfile(t, { authUserId: "auth-b", email: "b@example.com", name: "User B" }),
  ]);

  const conversationId = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-b" } as never,
  );

  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.sendConversationMessage as never,
    { conversationId, body: "Hello from A" } as never,
  );

  const senderConversations = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];
  const recipientConversations = await t.withIdentity(identityB).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];
  const recipientUnreadSummary = await t.withIdentity(identityB).query(
    api.shared_logic.inbox.getInboxUnreadSummary as never,
    {} as never,
  ) as { unreadCount: number };

  expect(senderConversations[0]?.unreadCount).toBe(0);
  expect(recipientConversations[0]?.unreadCount).toBe(1);
  expect(recipientUnreadSummary.unreadCount).toBe(1);
});

it("markConversationRead clears only the active participant unread count", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "User A" });
  const identityB = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "User B" });

  await Promise.all([
    seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "User A" }),
    seedUserProfile(t, { authUserId: "auth-b", email: "b@example.com", name: "User B" }),
  ]);

  const conversationId = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-b" } as never,
  );

  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.sendConversationMessage as never,
    { conversationId, body: "Unread for B" } as never,
  );

  await t.withIdentity(identityB).mutation(
    api.shared_logic.inbox.markConversationRead as never,
    { conversationId } as never,
  );

  const senderConversations = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];
  const recipientConversations = await t.withIdentity(identityB).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];

  expect(senderConversations[0]?.unreadCount).toBe(0);
  expect(recipientConversations[0]?.unreadCount).toBe(0);
});

it("archives conversations per participant and restores them when unarchived", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "User A" });
  const identityB = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "User B" });

  await Promise.all([
    seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "User A" }),
    seedUserProfile(t, { authUserId: "auth-b", email: "b@example.com", name: "User B" }),
  ]);

  const conversationId = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-b" } as never,
  );

  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.setConversationArchived as never,
    { conversationId, archived: true } as never,
  );

  const activeAfterArchive = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];
  const archivedAfterArchive = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    { archived: true } as never,
  ) as any[];
  const recipientStillActive = await t.withIdentity(identityB).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];

  expect(activeAfterArchive).toHaveLength(0);
  expect(archivedAfterArchive[0]?.id).toBe(conversationId);
  expect(recipientStillActive[0]?.id).toBe(conversationId);

  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.setConversationArchived as never,
    { conversationId, archived: false } as never,
  );

  const activeAfterRestore = await t.withIdentity(identityA).query(
    api.shared_logic.inbox.listConversations as never,
    {} as never,
  ) as any[];

  expect(activeAfterRestore[0]?.id).toBe(conversationId);
});

it("forbids resolving a direct conversation with yourself", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "User A" });

  await seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "User A" });

  await expect(
    t.withIdentity(identityA).mutation(
      api.shared_logic.inbox.resolveDirectConversation as never,
      { targetUserId: "auth-a" } as never,
    ),
  ).rejects.toMatchObject({
    data: expect.stringContaining("\"code\":\"INVALID_TARGET\""),
  });
});

it("returns broker-developer search results beyond the first 200 profiles with org context", async () => {
  const t = convexTest(schema, modules);
  const { identityOwner } = await seedBrokerDeveloperSearchFixture(t);

  const conversationId = await t.withIdentity(identityOwner).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-dev-204" } as never,
  );

  const results = await t.withIdentity(identityOwner).query(
    api.shared_logic.inbox.searchConversationTargets as never,
    { query: "target developer 204" } as never,
  ) as Array<any>;

  expect(results).toHaveLength(1);
  expect(results[0]).toMatchObject({
    id: "auth-dev-204",
    role: "developer",
    organizationName: "Palm Hills",
    conversationId,
  });
});

it("stores typed invite events and keeps unread behavior intact", async () => {
  const t = convexTest(schema, modules);
  const identityA = makeIdentity({ subject: "auth-a", email: "a@example.com", name: "Broker A" });
  const identityB = makeIdentity({ subject: "auth-b", email: "b@example.com", name: "Developer B" });

  await Promise.all([
    seedUserProfile(t, { authUserId: "auth-a", email: "a@example.com", name: "Broker A" }),
    seedUserProfile(t, { authUserId: "auth-b", email: "b@example.com", name: "Developer B" }),
  ]);

  const conversationId = await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.resolveDirectConversation as never,
    { targetUserId: "auth-b" } as never,
  );

  await t.withIdentity(identityA).mutation(
    api.shared_logic.inbox.sendConversationMessage as never,
    {
      conversationId,
      body: "تم إرسال دعوة",
      type: "invite_event",
      metadata: {
        contextType: "invite_event",
        title: "Elite Brokers",
      },
    } as never,
  );

  const conversation = await t.withIdentity(identityB).query(
    api.shared_logic.inbox.getConversation as never,
    { conversationId } as never,
  ) as any;

  expect(conversation.unreadCount).toBe(1);
  expect(conversation.lastMessage.type).toBe("invite_event");
  expect(conversation.messages[0]).toMatchObject({
    type: "invite_event",
    body: "تم إرسال دعوة",
  });
});
