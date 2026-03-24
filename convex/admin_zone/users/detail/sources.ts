export type AdminUserDetailSources = Awaited<ReturnType<typeof loadAdminUserDetailSources>>;

async function loadCoreAdminUserDetailSources(ctx: any) {
  const [profiles, users, brokers, developers, tenantLinks, verificationRequests, subscriptions, properties] = await Promise.all([
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("users").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("verificationRequests").collect(),
    ctx.db.query("subscriptions").collect(),
    ctx.db.query("properties").collect(),
  ]);
  return {
    profiles,
    users,
    brokers,
    developers,
    tenantLinks,
    verificationRequests,
    subscriptions,
    properties,
  };
}

async function loadActivityAdminUserDetailSources(ctx: any) {
  const [
    assistantThreads,
    assistantMessages,
    inboxMessages,
    knowledgeResearch,
    searchLogs,
    offers,
    conversationParticipants,
    conversations,
    notifications,
    orders,
    deals,
  ] = await Promise.all([
    ctx.db.query("assistantThreads").collect(),
    ctx.db.query("assistantMessages").collect(),
    ctx.db.query("inboxMessages").collect(),
    ctx.db.query("knowledgeResearch").collect(),
    ctx.db.query("searchLogs").collect(),
    ctx.db.query("offers").collect(),
    ctx.db.query("inboxConversationParticipants").collect(),
    ctx.db.query("inboxConversations").collect(),
    ctx.db.query("workspaceNotifications").collect(),
    ctx.db.query("orders").collect(),
    ctx.db.query("deals").collect(),
  ]);
  return {
    assistantThreads,
    assistantMessages,
    inboxMessages,
    knowledgeResearch,
    searchLogs,
    offers,
    conversationParticipants,
    conversations,
    notifications,
    orders,
    deals,
  };
}

export async function loadAdminUserDetailSources(ctx: any) {
  const [core, activity] = await Promise.all([
    loadCoreAdminUserDetailSources(ctx),
    loadActivityAdminUserDetailSources(ctx),
  ]);

  return {
    ...core,
    ...activity,
  };
}
