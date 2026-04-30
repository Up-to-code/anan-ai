import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  gccPermitTypeValidator,
  gccPermitVerificationStatusValidator,
  gccSourceAuthorityValidator,
} from "./gccCompliance";
import { uploadedFileReferenceListValidator } from "./uploadedFiles";
import { transitionalGlobalSecurityFields } from "./securityFields";
import { unsafeDynamicPayloadValidator } from "./securityValidators";

const projectReadinessStatusValidator = v.union(
  v.literal("draft"),
  v.literal("incomplete"),
  v.literal("data_complete"),
  v.literal("compliance_pending"),
  v.literal("approved"),
  v.literal("blocked"),
  v.literal("published_ready"),
);

const projectInventoryKindValidator = v.union(
  v.literal("project"),
  v.literal("standalone_unit"),
);

const projectBlockerSeverityValidator = v.union(
  v.literal("critical"),
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
);

const projectReadinessBlockerValidator = v.object({
  code: v.string(),
  label: v.string(),
  severity: projectBlockerSeverityValidator,
  area: v.union(
    v.literal("identity"),
    v.literal("location"),
    v.literal("compliance"),
    v.literal("units"),
    v.literal("payment"),
    v.literal("authorization"),
    v.literal("publication"),
  ),
  nextAction: v.string(),
});

const saudiProjectLocationValidator = v.object({
  countryCode: v.string(),
  city: v.optional(v.string()),
  district: v.optional(v.string()),
  neighborhood: v.optional(v.string()),
  street: v.optional(v.string()),
  nationalAddress: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  confidence: v.optional(v.union(v.literal("manual"), v.literal("verified"), v.literal("legacy"))),
});

const paymentMilestoneValidator = v.object({
  label: v.string(),
  amount: v.optional(v.number()),
  percentage: v.optional(v.number()),
  dueType: v.optional(v.union(v.literal("booking"), v.literal("contract"), v.literal("construction"), v.literal("handover"), v.literal("custom"))),
  dueDate: v.optional(v.number()),
});

const documentTypeValidator = v.union(
  v.literal("ad_license"),
  v.literal("wafi_license"),
  v.literal("commercial_registration"),
  v.literal("chamber_certificate"),
  v.literal("land_title"),
  v.literal("brokerage_contract"),
  v.literal("architectural_plan"),
  v.literal("consultant_contract"),
  v.literal("escrow_or_cpa"),
  v.literal("other"),
);

const documentStatusValidator = v.union(
  v.literal("missing"),
  v.literal("submitted"),
  v.literal("in_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("expired"),
);

const projectsTables = {
  projectDossiers: defineTable({
    ...transitionalGlobalSecurityFields,
    propertyId: v.id("properties"),
    inventoryKind: v.optional(projectInventoryKindValidator),
    orgId: v.optional(v.id("organizations")),
    tenantOrgId: v.optional(v.string()),
    name: v.optional(v.string()),
    phase: v.optional(v.union(
      v.literal("planning"),
      v.literal("under_construction"),
      v.literal("ready"),
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("sold_out"),
      v.literal("archived"),
    )),
    totalUnits: v.optional(v.number()),
    expectedUnitCountLabel: v.optional(v.string()),
    unitTypeMix: v.optional(v.array(v.string())),
    primaryUnitType: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    averagePrice: v.optional(v.number()),
    options: v.optional(v.array(v.string())),
    handoverDate: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),
    services: v.optional(v.array(v.string())),
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    projectType: v.union(v.literal("ready_property"), v.literal("off_plan"), v.literal("land"), v.literal("mixed_use")),
    salesMode: v.union(v.literal("developer_direct"), v.literal("broker_mediated"), v.literal("broker_owned")),
    lifecycleStage: v.union(v.literal("rough_draft"), v.literal("draft"), v.literal("review"), v.literal("active"), v.literal("suspended"), v.literal("archived")),
    requestedVisibility: v.union(v.literal("private"), v.literal("public")),
    readinessStatus: projectReadinessStatusValidator,
    readinessBlockers: v.array(projectReadinessBlockerValidator),
    readinessWarnings: v.array(projectReadinessBlockerValidator),
    completedRequirements: v.array(v.string()),
    location: saudiProjectLocationValidator,
    title: v.string(),
    summary: v.optional(v.string()),
    legacyPublicationState: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    migratedFromPropertyAt: v.optional(v.number()),
    adminBlockedReason: v.optional(v.string()),
    adminReviewedAt: v.optional(v.number()),
    lastReadinessComputedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_status", ["orgId", "status"])
    .index("propertyId", ["propertyId"])
    .index("tenantOrgId", ["tenantOrgId"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
    .index("ownerBrokerId", ["ownerBrokerId"])
    .index("ownerREDId", ["ownerREDId"])
    .index("readinessStatus", ["readinessStatus"])
    .index("requestedVisibility_readinessStatus", ["requestedVisibility", "readinessStatus"]),

  projectUnits: defineTable({
    ...transitionalGlobalSecurityFields,
    dossierId: v.id("projectDossiers"),
    propertyId: v.id("properties"),
    orgId: v.optional(v.id("organizations")),
    unitNumber: v.optional(v.string()),
    unitType: v.optional(v.union(
      v.literal("studio"),
      v.literal("1br"),
      v.literal("2br"),
      v.literal("3br"),
      v.literal("4br_plus"),
      v.literal("penthouse"),
    )),
    areaSqm: v.optional(v.number()),
    floorNumber: v.optional(v.number()),
    basePrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    label: v.string(),
    unitKind: v.union(v.literal("unit_type"), v.literal("unit")),
    status: v.union(v.literal("available"), v.literal("reserved"), v.literal("sold"), v.literal("draft")),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    sizeSqm: v.optional(v.number()),
    floor: v.optional(v.string()),
    view: v.optional(v.string()),
    price: v.optional(v.number()),
    handoverAt: v.optional(v.number()),
    location: v.optional(saudiProjectLocationValidator),
    floorPlanMedia: v.optional(uploadedFileReferenceListValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orgId_and_status", ["orgId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("dossierId_status", ["dossierId", "status"]),

    projectPaymentPlans: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    dossierId: v.id("projectDossiers"),
    propertyId: v.id("properties"),
    title: v.string(),
    cashPrice: v.optional(v.number()),
    startingPrice: v.optional(v.number()),
    downPayment: v.optional(v.number()),
    escrowReference: v.optional(v.string()),
    feesAndTaxNotes: v.optional(v.string()),
    bankAndSubsidyNotes: v.optional(v.string()),
    milestones: v.array(paymentMilestoneValidator),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("dossierId_status", ["dossierId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  projectComplianceDocuments: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    dossierId: v.id("projectDossiers"),
    propertyId: v.id("properties"),
    documentType: documentTypeValidator,
    status: documentStatusValidator,
    title: v.string(),
    licenseOrReferenceNumber: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    verificationRequestId: v.optional(v.id("verificationRequests")),
    files: uploadedFileReferenceListValidator,
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("dossierId_documentType", ["dossierId", "documentType"])
    .index("verificationRequestId", ["verificationRequestId"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  projectAdLicenses: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    dossierId: v.id("projectDossiers"),
    propertyId: v.id("properties"),
    licenseNumber: v.string(),
    countryCode: v.optional(v.string()),
    jurisdiction: v.optional(v.string()),
    permitType: v.optional(gccPermitTypeValidator),
    permitNumber: v.optional(v.string()),
    permitQrOrUrl: v.optional(v.string()),
    verificationStatus: v.optional(gccPermitVerificationStatusValidator),
    requiredForChannels: v.optional(v.array(v.string())),
    sourceAuthority: v.optional(gccSourceAuthorityValidator),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("expired")),
    purpose: v.optional(v.string()),
    channels: v.array(v.string()),
    brokerageContractNumber: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    evidenceFiles: v.optional(uploadedFileReferenceListValidator),
    verificationRequestId: v.optional(v.id("verificationRequests")),
    lastCheckedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("licenseNumber", ["licenseNumber"])
    .index("countryCode_verificationStatus", ["countryCode", "verificationStatus"])
    .index("sourceAuthority_verificationStatus", ["sourceAuthority", "verificationStatus"])
    .index("verificationRequestId", ["verificationRequestId"])
    .index("by_org_status_expiresAt", ["orgId", "status", "expiresAt"])
    .index("by_property_status", ["propertyId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  projectBrokerAuthorizations: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    brokerOrgId: v.optional(v.id("organizations")),
    dossierId: v.id("projectDossiers"),
    propertyId: v.id("properties"),
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
    contractNumber: v.optional(v.string()),
    marketingScope: v.optional(v.string()),
    channels: v.array(v.string()),
    commissionTerms: v.optional(v.string()),
    validFrom: v.optional(v.number()),
    validUntil: v.optional(v.number()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("expired"), v.literal("revoked")),
    evidenceFiles: v.optional(uploadedFileReferenceListValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("brokerId", ["brokerId"])
    .index("REDId", ["REDId"])
    .index("dossierId_status", ["dossierId", "status"])
    .index("by_brokerOrg_status", ["brokerOrgId", "status"])
    .index("by_property_broker_status", ["propertyId", "brokerOrgId", "status"])
    .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

  projectReadinessEvents: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    dossierId: v.optional(v.id("projectDossiers")),
    propertyId: v.optional(v.id("properties")),
    actorAuthUserId: v.optional(v.string()),
    actorRole: v.optional(v.string()),
    eventType: v.union(
      v.literal("dossier_created"),
      v.literal("dossier_saved"),
      v.literal("dossier_migrated"),
      v.literal("readiness_changed"),
      v.literal("publish_requested"),
      v.literal("publish_blocked"),
      v.literal("publish_approved"),
      v.literal("distribution_eligibility_changed"),
      v.literal("document_reviewed"),
      v.literal("ad_license_reviewed"),
      v.literal("admin_blocked"),
      v.literal("admin_unblocked"),
      v.literal("migration_preflight"),
      v.literal("migration_postflight")
    ),
    previousStatus: v.optional(projectReadinessStatusValidator),
    nextStatus: v.optional(projectReadinessStatusValidator),
    message: v.optional(v.string()),
    metadata: v.optional(unsafeDynamicPayloadValidator),
    createdAt: v.number(),
  })
    .index("dossierId", ["dossierId"])
    .index("propertyId", ["propertyId"])
    .index("eventType", ["eventType"])
    .index("createdAt", ["createdAt"])
    .index("by_org_createdAt", ["orgId", "createdAt"]),
};

export default projectsTables;
