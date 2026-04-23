import { defineTable } from "convex/server";
import type { VLiteral } from "convex/values";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import {
  AD_LICENSE_STATUS,
  BROKER_AUTHORIZATION_STATUS,
  CASE_ACTIVITY_TYPE,
  CASE_PARTICIPANT_ROLE,
  CODE_CHALLENGE_METHOD,
  CONTACT_TYPE,
  ORG_MEMBERSHIP_ROLE,
  ORG_TYPE,
  SALES_ORDER_ASSIGNEE_TYPE,
  SALES_ORDER_STATUS,
  SUBSCRIPTION_TIER,
} from "../../lib/constants";

type LiteralObject = Record<string, string>;

function enumValidator<T extends LiteralObject>(values: T) {
  const literals = Object.values(values).map((value) =>
    v.literal(value as T[keyof T]),
  ) as Array<VLiteral<T[keyof T], "required">>;
  return v.union(...literals);
}

const searchPreferencesValidator = v.object({
  propertyTypes: v.array(v.string()),
  minBudget: v.number(),
  maxBudget: v.number(),
  currency: v.string(),
  preferredCities: v.array(v.string()),
});

const installmentScheduleItemValidator = v.object({
  label: v.string(),
  duePct: v.number(),
  dueDateOffset: v.number(),
});

/**
 * WHY:   Real Estate OS adds the new canonical tables that do not collide with today's live schema.
 * WHAT:  Identity, org, OAuth, inventory, CRM, and audit tables for the infrastructure data model.
 * HOW:   Existing table names are extended in their owning schema modules; only missing tables are defined here.
 */
const realEstateOsTables = {
  /**
   * Represents the credential record for one human.
   * Primary access pattern: point lookup by email during login and guard resolution.
   * Shard/isolation strategy: global identity table; tenant access is enforced through orgMemberships.
   */
  authUsers: defineTable({
    ...transitionalGlobalSecurityFields,
    email: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.string(),
    mfaSecret: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    regionHint: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),

  /**
   * Represents a buyer account attached to a human auth user.
   * Primary access pattern: load buyer preferences by authUserId for search, assistant, and orders.
   * Shard/isolation strategy: buyer-owned global record; org exposure happens through orders/conversations.
   */
  buyerAccounts: defineTable({
    ...transitionalGlobalSecurityFields,
    authUserId: v.id("authUsers"),
    preferredLocale: v.string(),
    searchPreferences: searchPreferencesValidator,
    channelSource: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),

  /**
   * Represents a broker firm or real estate developer company.
   * Primary access pattern: list organizations by owner, country, or org type for onboarding/admin.
   * Shard/isolation strategy: tenant root; child tables reference orgId for isolation.
   */
  organizations: defineTable({
    ...transitionalGlobalSecurityFields,
    orgType: enumValidator(ORG_TYPE),
    legalName: v.string(),
    countryCode: v.string(),
    regionCode: v.string(),
    operatingMarkets: v.array(v.string()),
    ownerUserId: v.id("authUsers"),
    subscriptionTier: enumValidator(SUBSCRIPTION_TIER),
    isVerified: v.boolean(),
  })
    .index("by_ownerUserId", ["ownerUserId"])
    .index("by_countryCode", ["countryCode"])
    .index("by_orgType_and_countryCode", ["orgType", "countryCode"])
    .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),

  /**
   * Represents worker membership in an organization with org-specific role/scopes.
   * Primary access pattern: requireOrgAccess checks orgId + userProfileId before tenant reads/writes.
   * Shard/isolation strategy: orgId is the tenant gate; by_orgId is the primary roster index.
   */
  orgMemberships: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.id("organizations"),
    userProfileId: v.id("userProfiles"),
    authUserId: v.optional(v.id("authUsers")),
    role: enumValidator(ORG_MEMBERSHIP_ROLE),
    grantedScopes: v.array(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    joinedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_userProfileId", ["userProfileId"])
    .index("by_orgId_and_role", ["orgId", "role"])
    .index("by_orgId_and_userProfileId", ["orgId", "userProfileId"])
    .index("by_authUser_status", ["authUserId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  orgInvites: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.id("organizations"),
    invitedEmail: v.string(),
    role: enumValidator(ORG_MEMBERSHIP_ROLE),
    tokenHash: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("canceled"),
      v.literal("expired"),
    ),
    expiresAt: v.number(),
    acceptedByAuthUserId: v.optional(v.id("authUsers")),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_status_createdAt", ["orgId", "status", "createdAt"])
    .index("by_tokenHash", ["tokenHash"])
    .index("by_invitedEmail_status", ["invitedEmail", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  orgSubscriptions: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.id("organizations"),
    planTier: enumValidator(SUBSCRIPTION_TIER),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("canceled"),
      v.literal("trial"),
    ),
    startedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_status", ["orgId", "status"])
    .index("by_status_expiresAt", ["status", "expiresAt"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents OAuth consent created when a user approves a third-party app.
   * Primary access pattern: list grants by authUserId or clientId during OAuth flows.
   * Shard/isolation strategy: global consent table; token actingOrgId applies tenant context.
   */
  oauthGrants: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    clientId: v.id("oauthClients"),
    authUserId: v.id("authUsers"),
    approvedScopes: v.array(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: enumValidator(CODE_CHALLENGE_METHOD),
    expiresAt: v.number(),
    isUsed: v.boolean(),
    revokedAt: v.optional(v.number()),
    grantVersion: v.optional(v.number()),
  })
    .index("by_authUserId", ["authUserId"])
    .index("by_clientId", ["clientId"])
    .index("by_authUser_client", ["authUserId", "clientId"])
    .index("by_org_client", ["orgId", "clientId"])
    .index("by_expiresAt", ["expiresAt"]),

  /**
   * Represents short-lived OAuth access tokens minted from grants.
   * Primary access pattern: validate bearer tokens by tokenHash on every public API request.
   * Shard/isolation strategy: global token table; actingOrgId narrows scoped APIs to one tenant.
   */
  accessTokens: defineTable({
    ...transitionalGlobalSecurityFields,
    grantId: v.id("oauthGrants"),
    tokenHash: v.string(),
    scopes: v.array(v.string()),
    orgId: v.optional(v.id("organizations")),
    actingOrgId: v.optional(v.id("organizations")),
    expiresAt: v.number(),
    revokedAt: v.optional(v.number()),
    grantVersion: v.optional(v.number()),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_grantId", ["grantId"])
    .index("by_expiresAt", ["expiresAt"])
    .index("by_org_expiresAt", ["orgId", "expiresAt"]),

  /**
   * Represents installment payment plans available for a project dossier.
   * Primary access pattern: load plans by dossierId when showing a project or offer.
   * Shard/isolation strategy: orgId gates developer/broker workspace management of plan records.
   */
  paymentPlans: defineTable({
    ...transitionalGlobalSecurityFields,
    dossierId: v.id("projectDossiers"),
    orgId: v.id("organizations"),
    planName: v.string(),
    downPaymentPct: v.number(),
    installmentSchedule: v.array(installmentScheduleItemValidator),
    currency: v.string(),
    isActive: v.boolean(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_dossierId", ["dossierId"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents media assets attached to a property.
   * Primary access pattern: load ordered media by propertyId for listing detail pages.
   * Shard/isolation strategy: orgId gates media management; media is separate from listing cards.
   */
  listingMedia: defineTable({
    ...transitionalGlobalSecurityFields,
    propertyId: v.id("properties"),
    orgId: v.id("organizations"),
    mediaType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("floor_plan"),
      v.literal("360_tour"),
    ),
    storageId: v.id("_storage"),
    cdnUrl: v.string(),
    sortOrder: v.number(),
    uploadedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_property_sortOrder", ["propertyId", "sortOrder"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents a developer-granted contract allowing a broker to market inventory.
   * Primary access pattern: verify propertyId + brokerOrgId + active status before broker actions.
   * Shard/isolation strategy: dual-org contract indexed by brokerOrgId and grantedByOrgId.
   */
  brokerAuthorizations: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    propertyId: v.id("properties"),
    brokerOrgId: v.id("organizations"),
    grantedByOrgId: v.id("organizations"),
    authorizedActions: v.array(v.string()),
    validFrom: v.number(),
    validUntil: v.optional(v.number()),
    status: enumValidator(BROKER_AUTHORIZATION_STATUS),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_brokerOrgId", ["brokerOrgId"])
    .index("by_grantedByOrgId", ["grantedByOrgId"])
    .index("by_brokerOrgId_and_status", ["brokerOrgId", "status"])
    .index("by_propertyId_and_brokerOrgId_and_status", ["propertyId", "brokerOrgId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents regulatory advertising licenses required before marketing a property.
   * Primary access pattern: publishProperty checks for a valid license by propertyId + status.
   * Shard/isolation strategy: orgId gates license management for the listing owner.
   */
  adLicenses: defineTable({
    ...transitionalGlobalSecurityFields,
    propertyId: v.id("properties"),
    orgId: v.id("organizations"),
    licenseNumber: v.string(),
    issuingAuthority: v.string(),
    issuedAt: v.number(),
    expiresAt: v.number(),
    status: enumValidator(AD_LICENSE_STATUS),
  })
    .index("by_orgId", ["orgId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_propertyId_and_status", ["propertyId", "status"])
    .index("by_org_status_expiresAt", ["orgId", "status", "expiresAt"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents a person in an org CRM pipeline before or after platform signup.
   * Primary access pattern: list contacts by orgId/contactType and link by email after signup.
   * Shard/isolation strategy: orgId gates tenant access; authUserId may be absent until linked.
   */
  crmContacts: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.id("organizations"),
    authUserId: v.optional(v.id("authUsers")),
    buyerAccountId: v.optional(v.id("buyerAccounts")),
    fullName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    contactType: enumValidator(CONTACT_TYPE),
    sourceChannel: v.optional(v.string()),
    tags: v.array(v.string()),
    isArchived: v.boolean(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_contactType", ["orgId", "contactType"])
    .index("by_authUserId", ["authUserId"])
    .index("by_buyerAccountId", ["buyerAccountId"])
    .index("by_email_and_authUserId", ["email", "authUserId"])
    .index("by_org_contactType_updatedAt", ["orgId", "contactType", "updatedAt"])
    .index("by_org_email", ["orgId", "email"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents a buyer-initiated lead or reservation request.
   * Primary access pattern: route new orders by orgId/status and trace buyer/property history.
   * Shard/isolation strategy: orgId gates owner handling; assigneeId is string because target type varies.
   */
  salesOrders: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.id("organizations"),
    buyerAccountId: v.id("buyerAccounts"),
    propertyId: v.id("properties"),
    unitId: v.optional(v.id("projectUnits")),
    dealId: v.optional(v.id("deals")),
    assigneeType: enumValidator(SALES_ORDER_ASSIGNEE_TYPE),
    assigneeId: v.string(),
    status: enumValidator(SALES_ORDER_STATUS),
  })
    .index("by_orgId", ["orgId"])
    .index("by_buyerAccountId", ["buyerAccountId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_orgId_and_status", ["orgId", "status"])
    .index("by_org_status_updatedAt", ["orgId", "status", "updatedAt"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents which workers/orgs are participating in an offer case.
   * Primary access pattern: list participants by caseId or userProfileId.
   * Shard/isolation strategy: orgId records the represented tenant and gates org participant views.
   */
  caseParticipants: defineTable({
    ...transitionalGlobalSecurityFields,
    caseId: v.id("offerCases"),
    userProfileId: v.id("userProfiles"),
    orgId: v.id("organizations"),
    role: enumValidator(CASE_PARTICIPANT_ROLE),
    joinedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_caseId", ["caseId"])
    .index("by_userProfileId", ["userProfileId"])
    .index("by_case_user", ["caseId", "userProfileId"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  /**
   * Represents the immutable audit trail for an offer case.
   * Primary access pattern: append events and read by caseId in _creationTime order.
   * Shard/isolation strategy: caseId resolves to an org-owned offerCase before activity access.
   */
  caseActivities: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    caseId: v.id("offerCases"),
    actorProfileId: v.id("userProfiles"),
    actorAuthUserId: v.optional(v.id("authUsers")),
    actionType: enumValidator(CASE_ACTIVITY_TYPE),
    // Payload shape varies by actionType; companion TypeScript contracts document each event payload.
    payload: v.object({ data: v.any() }),
  })
    .index("by_caseId", ["caseId"])
    .index("by_org_createdAt", ["orgId", "createdAt"])
    .index("by_case_createdAt", ["caseId", "createdAt"]),

};

export default realEstateOsTables;
