import { defineTable } from "convex/server";
import { v } from "convex/values";

const verificationDocumentValidator = v.object({
  key: v.string(),
  url: v.string(),
  name: v.string(),
  size: v.optional(v.number()),
  mime: v.optional(v.string()),
});

const complianceRequirementValidator = v.object({
  id: v.string(),
  label: v.string(),
  required: v.boolean(),
  note: v.optional(v.string()),
});

const complianceSourceValidator = v.object({
  id: v.string(),
  label: v.string(),
  url: v.string(),
});

const complianceEnforcementValidator = v.object({
  blockPublish: v.boolean(),
  hideUnverified: v.boolean(),
  showBanner: v.boolean(),
  requireOrgVerification: v.boolean(),
  requireListingVerification: v.boolean(),
  bannerTitle: v.optional(v.string()),
  bannerBody: v.optional(v.string()),
  bannerCtaLabel: v.optional(v.string()),
  bannerCtaHref: v.optional(v.string()),
});

const adminTables = {
  complianceRulesets: defineTable({
    countryCode: v.string(),
    countryLabel: v.optional(v.string()),
    orgType: v.union(v.literal("broker"), v.literal("red")),
    status: v.union(v.literal("active"), v.literal("draft"), v.literal("inactive")),
    version: v.number(),
    requirements: v.array(complianceRequirementValidator),
    sources: v.array(complianceSourceValidator),
    enforcement: complianceEnforcementValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("country_org_status", ["countryCode", "orgType", "status"])
    .index("country_org", ["countryCode", "orgType"])
    .index("status", ["status"])
    .index("countryCode", ["countryCode"]),

  verificationRequests: defineTable({
    requestType: v.union(v.literal("user"), v.literal("broker"), v.literal("RED"), v.literal("property")),
    subjectProfileId: v.optional(v.id("userProfiles")),
    subjectBrokerId: v.optional(v.id("brokers")),
    subjectREDId: v.optional(v.id("RED")),
    subjectPropertyId: v.optional(v.id("properties")),
    authUserId: v.optional(v.string()),
    externalUserId: v.optional(v.string()),
    title: v.optional(v.string()),
    currentStatus: v.union(
      v.literal("new"),
      v.literal("in_review"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    rulesetId: v.optional(v.id("complianceRulesets")),
    rulesetVersion: v.optional(v.number()),
    submittedData: v.any(),
    attachedDocuments: v.array(verificationDocumentValidator),
    reviewerId: v.optional(v.string()),
    reviewerNotes: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("currentStatus", ["currentStatus"])
    .index("requestType", ["requestType"])
    .index("subjectProfileId", ["subjectProfileId"])
    .index("subjectBrokerId", ["subjectBrokerId"])
    .index("subjectREDId", ["subjectREDId"])
    .index("subjectPropertyId", ["subjectPropertyId"])
    .index("submittedAt", ["submittedAt"]),
};

export default adminTables;
