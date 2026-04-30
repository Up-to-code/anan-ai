import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import { boundedMetadataValidator, tenantOrgIdValidator } from "./securityValidators";

const zaneAiWebhookActionValidator = v.union(
  v.literal("organization.upsert"),
  v.literal("organization.archive"),
  v.literal("project.upsert"),
  v.literal("project.archive"),
  v.literal("unit.upsert"),
  v.literal("unit.archive"),
);

const zaneAiWebhookPayloadValidator = v.object({
  version: v.string(),
  action: zaneAiWebhookActionValidator,
  occurredAt: v.number(),
  source: v.object({
    system: v.literal("anan"),
    environment: v.string(),
    tenantOrgId: v.optional(tenantOrgIdValidator),
  }),
  actor: v.optional(boundedMetadataValidator),
  organization: v.optional(boundedMetadataValidator),
  project: v.optional(boundedMetadataValidator),
  unit: v.optional(boundedMetadataValidator),
});

const integrationTables = {
  zaneAiWebhookOutbox: defineTable({
    ...transitionalGlobalSecurityFields,
    eventId: v.string(),
    version: v.string(),
    action: zaneAiWebhookActionValidator,
    destination: v.literal("zaneai"),
    sourceSystem: v.literal("anan"),
    tenantOrgId: v.optional(tenantOrgIdValidator),
    externalOrgId: v.optional(v.string()),
    externalProjectId: v.optional(v.string()),
    externalUnitId: v.optional(v.string()),
    payload: zaneAiWebhookPayloadValidator,
    status: v.union(
      v.literal("pending"),
      v.literal("delivering"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("dead"),
    ),
    attempts: v.number(),
    nextAttemptAt: v.number(),
    lastAttemptAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("eventId", ["eventId"])
    .index("status_nextAttemptAt", ["status", "nextAttemptAt"])
    .index("tenantOrgId_status", ["tenantOrgId", "status"]),
};

export default integrationTables;
