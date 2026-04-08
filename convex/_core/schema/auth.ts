import { authTables as convexAuthTableDefinitions } from "@convex-dev/auth/server";
import { defineTable } from "convex/server";
import { v } from "convex/values";

const { users: _users, ...convexAuthTables } = convexAuthTableDefinitions;

/**
 * WHY:   Persist channel-scoped session tokens for non-web flows (WhatsApp).
 * WHAT:  Stores backend-issued channel session token identifiers with expiry metadata per channel.
 * HOW:   Indexed by authUserId + channel for fast refresh/cleanup lookups.
 */
const authTables = {
  ...convexAuthTables,
  channelSessions: defineTable({
    authUserId: v.string(),
    channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"), v.literal("main_assistant_web")),
    sessionToken: v.string(),
    expiresAt: v.number(), // epoch ms
    metadata: v.optional(
      v.object({
        sourceMessageId: v.optional(v.string()),
      }),
    ),
  })
    .index("authUserId_channel", ["authUserId", "channel"])
    .index("expiresAt", ["expiresAt"]),
  channelMessageReceipts: defineTable({
    channel: v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"), v.literal("main_assistant_web")),
    messageId: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("processed"),
      v.literal("failed"),
    ),
    userId: v.optional(v.string()),
    threadId: v.optional(v.id("assistantThreads")),
    replyMessageIds: v.optional(v.array(v.string())),
    createdAt: v.number(),
    processedAt: v.optional(v.number()),
    failureCode: v.optional(v.string()),
  })
    .index("channel_messageId", ["channel", "messageId"])
    .index("status", ["status"])
    .index("createdAt", ["createdAt"]),
  oauthClients: defineTable({
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    name: v.string(),
    publisherName: v.string(),
    logoUrl: v.optional(v.string()),
    clientType: v.union(v.literal("public"), v.literal("confidential")),
    redirectUris: v.array(v.string()),
    allowedScopes: v.array(v.string()),
    trusted: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("clientId", ["clientId"])
    .index("isActive", ["isActive"]),
  oauthAuthorizations: defineTable({
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.string(),
    grantedScopes: v.array(v.string()),
    offlineAccess: v.boolean(),
    consentVersion: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    revokedAt: v.optional(v.number()),
    lastUsedAt: v.optional(v.number()),
    approvedByUserId: v.optional(v.id("users")),
  })
    .index("userId_clientId", ["userId", "clientId"])
    .index("userId", ["userId"])
    .index("tenantOrgId", ["tenantOrgId"])
    .index("ownerBrokerId", ["ownerBrokerId"])
    .index("ownerREDId", ["ownerREDId"])
    .index("ownerBrokerId_clientId", ["ownerBrokerId", "clientId"])
    .index("ownerREDId_clientId", ["ownerREDId", "clientId"])
    .index("clientId", ["clientId"]),
  oauthAuthCodes: defineTable({
    codeHash: v.string(),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    redirectUri: v.string(),
    scopes: v.array(v.string()),
    nonce: v.optional(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("codeHash", ["codeHash"])
    .index("clientId", ["clientId"])
    .index("expiresAt", ["expiresAt"]),
  oauthAccessTokens: defineTable({
    jti: v.string(),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    sessionId: v.optional(v.string()),
    scopes: v.array(v.string()),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("jti", ["jti"])
    .index("clientId", ["clientId"])
    .index("userId", ["userId"])
    .index("tenantOrgId", ["tenantOrgId"])
    .index("expiresAt", ["expiresAt"]),
  oauthRefreshTokens: defineTable({
    tokenHash: v.string(),
    familyId: v.string(),
    parentTokenId: v.optional(v.id("oauthRefreshTokens")),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    scopes: v.array(v.string()),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    replayDetectedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("tokenHash", ["tokenHash"])
    .index("familyId", ["familyId"])
    .index("clientId", ["clientId"])
    .index("expiresAt", ["expiresAt"]),
  oauthFlowState: defineTable({
    clientId: v.string(),
    redirectUri: v.string(),
    requestedScopes: v.array(v.string()),
    state: v.string(),
    sourceApp: v.optional(v.union(v.literal("web"), v.literal("admin"), v.literal("mobile"))),
    nonce: v.optional(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
    expiresAt: v.number(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("clientId", ["clientId"])
    .index("expiresAt", ["expiresAt"]),
  oauthSubjectMappings: defineTable({
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    pairwiseSubject: v.string(),
    createdAt: v.number(),
  })
    .index("clientId_userId", ["clientId", "userId"])
    .index("clientId_tenantOrgId", ["clientId", "tenantOrgId"])
    .index("ownerBrokerId_clientId", ["ownerBrokerId", "clientId"])
    .index("ownerREDId_clientId", ["ownerREDId", "clientId"])
    .index("pairwiseSubject", ["pairwiseSubject"]),
  oauthAuditLogs: defineTable({
    eventType: v.string(),
    tenantOrgId: v.optional(v.string()),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    authorizationId: v.optional(v.id("oauthAuthorizations")),
    accessTokenJti: v.optional(v.string()),
    refreshFamilyId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("eventType", ["eventType"])
    .index("clientId", ["clientId"])
    .index("userId", ["userId"])
    .index("createdAt", ["createdAt"]),
};

export default authTables;
