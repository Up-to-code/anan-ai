import { v } from "convex/values";
import { uploadedFileReferenceValidator } from "../files";

export const dealStageValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("negotiation"),
  v.literal("won"),
  v.literal("lost"),
);

export const dealRelationTypeValidator = v.union(
  v.literal("internal_client"),
  v.literal("broker_managed"),
);

export const createDealArgs = {
  title: v.string(),
  description: v.optional(v.string()),
  value: v.optional(v.number()),
  nextFollowUpAt: v.optional(v.number()),
  stage: dealStageValidator,
  contactName: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  propertyId: v.optional(v.id("properties")),
  relationType: dealRelationTypeValidator,
  crmClientId: v.optional(v.id("crmClients")),
  relatedBrokerId: v.optional(v.id("brokers")),
  brokerId: v.optional(v.id("brokers")),
  REDId: v.optional(v.id("RED")),
  lastUpdatedBy: v.string(),
} as const;

export const updateDealArgs = {
  dealId: v.id("deals"),
  title: v.string(),
  description: v.optional(v.string()),
  value: v.optional(v.number()),
  nextFollowUpAt: v.optional(v.number()),
  stage: dealStageValidator,
  contactName: v.optional(v.string()),
  contactPhone: v.optional(v.string()),
  propertyId: v.optional(v.id("properties")),
  relationType: dealRelationTypeValidator,
  crmClientId: v.optional(v.id("crmClients")),
  relatedBrokerId: v.optional(v.id("brokers")),
  notes: v.optional(v.string()),
  lastUpdatedBy: v.string(),
} as const;

export const updateDealStageArgs = {
  dealId: v.id("deals"),
  stage: dealStageValidator,
  lastUpdatedBy: v.string(),
} as const;

export const updateDealFollowUpArgs = {
  dealId: v.id("deals"),
  nextFollowUpAt: v.number(),
  lastUpdatedBy: v.string(),
} as const;

export const updateDealNotesArgs = {
  dealId: v.id("deals"),
  notes: v.string(),
  lastUpdatedBy: v.string(),
} as const;

export const archiveDealArgs = {
  dealId: v.id("deals"),
  archivedAt: v.number(),
  archivedBy: v.string(),
  lastUpdatedBy: v.string(),
} as const;

export const addDealDocumentArgs = {
  dealId: v.id("deals"),
  document: uploadedFileReferenceValidator,
  lastUpdatedBy: v.string(),
} as const;
