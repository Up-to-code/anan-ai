import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import {
  boundedMetadataValidator,
  oauthScopeValidator,
  redirectUriValidator,
  tenantOrgIdValidator,
  tokenHashValidator,
} from "./securityValidators";

const authTables = {
  oauthClients: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    ownerOrgId: v.optional(v.id("organizations")),
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    clientName: v.optional(v.string()),
    name: v.string(),
    publisherName: v.string(),
    logoUrl: v.optional(v.string()),
    iconUrl: v.optional(v.string()),
    clientType: v.union(v.literal("public"), v.literal("confidential")),
    redirectUris: v.array(redirectUriValidator),
    allowedScopes: v.array(oauthScopeValidator),
    trusted: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerOrgId", ["ownerOrgId"])
    .index("by_org_client", ["orgId", "clientId"])
    .index("clientId", ["clientId"])
    .index("isActive", ["isActive"]),
  oauthAuthorizations: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.string(),
    grantedScopes: v.array(oauthScopeValidator),
    offlineAccess: v.boolean(),
    consentVersion: v.number(),
    expiresAt: v.optional(v.number()),
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
    .index("clientId", ["clientId"])
    .index("tenantOrgId_clientId_revokedAt", ["tenantOrgId", "clientId", "revokedAt"])
    .index("by_org_client", ["orgId", "clientId"]),
  oauthAuthCodes: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    codeHash: v.string(),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    redirectUri: redirectUriValidator,
    scopes: v.array(oauthScopeValidator),
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
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    jti: v.string(),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    sessionId: v.optional(v.string()),
    scopes: v.array(oauthScopeValidator),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("jti", ["jti"])
    .index("clientId", ["clientId"])
    .index("userId", ["userId"])
    .index("tenantOrgId", ["tenantOrgId"])
    .index("expiresAt", ["expiresAt"])
    .index("by_org_expiresAt", ["orgId", "expiresAt"]),
  oauthRefreshTokens: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    tokenHash: tokenHashValidator,
    familyId: v.string(),
    parentTokenId: v.optional(v.id("oauthRefreshTokens")),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    approvedByUserId: v.optional(v.id("users")),
    authorizationId: v.id("oauthAuthorizations"),
    scopes: v.array(oauthScopeValidator),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    replayDetectedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("tokenHash", ["tokenHash"])
    .index("familyId", ["familyId"])
    .index("familyId_revokedAt", ["familyId", "revokedAt"])
    .index("familyId_replayDetectedAt", ["familyId", "replayDetectedAt"])
    .index("clientId", ["clientId"])
    .index("expiresAt", ["expiresAt"]),
  oauthFlowState: defineTable({
    ...transitionalGlobalSecurityFields,
    clientId: v.string(),
    redirectUri: redirectUriValidator,
    requestedScopes: v.array(oauthScopeValidator),
    state: v.string(),
    sourceApp: v.optional(v.union(v.literal("web"), v.literal("admin"))),
    nonce: v.optional(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
    expiresAt: v.number(),
    createdAt: v.number(),
    usedAt: v.optional(v.number()),
  })
    .index("clientId", ["clientId"])
    .index("state_expiresAt", ["state", "expiresAt"])
    .index("expiresAt", ["expiresAt"]),
  oauthSubjectMappings: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    clientId: v.string(),
    userId: v.optional(v.id("users")),
    tenantOrgId: v.optional(tenantOrgIdValidator),
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
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    eventType: v.string(),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    authorizationId: v.optional(v.id("oauthAuthorizations")),
    accessTokenJti: v.optional(v.string()),
    refreshFamilyId: v.optional(v.string()),
    metadata: v.optional(boundedMetadataValidator),
    createdAt: v.number(),
  })
    .index("eventType", ["eventType"])
    .index("clientId", ["clientId"])
    .index("userId", ["userId"])
    .index("createdAt", ["createdAt"]),
};

export default authTables;
