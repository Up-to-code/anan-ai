import { v } from "convex/values";
import {
  gccPermitTypeValidator,
  gccPermitVerificationStatusValidator,
  gccSourceAuthorityValidator,
} from "../../_core/schema/gccCompliance";
import { uploadedFileReferenceListValidator } from "../../_core/schema/uploadedFiles";

export const projectReadinessStatusValidator = v.union(
  v.literal("draft"),
  v.literal("incomplete"),
  v.literal("data_complete"),
  v.literal("compliance_pending"),
  v.literal("approved"),
  v.literal("blocked"),
  v.literal("published_ready"),
);

export const projectLocationInputValidator = v.object({
  countryCode: v.optional(v.string()),
  city: v.optional(v.string()),
  district: v.optional(v.string()),
  neighborhood: v.optional(v.string()),
  street: v.optional(v.string()),
  nationalAddress: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
});

export const projectDossierDraftInputValidator = v.object({
  propertyId: v.id("properties"),
  projectType: v.optional(v.union(v.literal("ready_property"), v.literal("off_plan"), v.literal("land"), v.literal("mixed_use"))),
  salesMode: v.optional(v.union(v.literal("developer_direct"), v.literal("broker_mediated"), v.literal("broker_owned"))),
  requestedVisibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  lifecycleStage: v.optional(v.union(v.literal("rough_draft"), v.literal("draft"), v.literal("review"), v.literal("active"), v.literal("suspended"), v.literal("archived"))),
  title: v.optional(v.string()),
  summary: v.optional(v.string()),
  location: v.optional(projectLocationInputValidator),
});

export const projectUnitInputValidator = v.object({
  dossierId: v.optional(v.string()),
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
  floorPlanMedia: v.optional(uploadedFileReferenceListValidator),
});

export const paymentMilestoneInputValidator = v.object({
  label: v.string(),
  amount: v.optional(v.number()),
  percentage: v.optional(v.number()),
  dueType: v.optional(v.union(v.literal("booking"), v.literal("contract"), v.literal("construction"), v.literal("handover"), v.literal("custom"))),
  dueDate: v.optional(v.number()),
});

export const projectPaymentPlanInputValidator = v.object({
  dossierId: v.optional(v.string()),
  title: v.string(),
  cashPrice: v.optional(v.number()),
  startingPrice: v.optional(v.number()),
  downPayment: v.optional(v.number()),
  escrowReference: v.optional(v.string()),
  feesAndTaxNotes: v.optional(v.string()),
  bankAndSubsidyNotes: v.optional(v.string()),
  milestones: v.optional(v.array(paymentMilestoneInputValidator)),
  status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
});

export const projectComplianceDocumentInputValidator = v.object({
  dossierId: v.optional(v.string()),
  documentType: v.union(
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
  ),
  status: v.optional(v.union(v.literal("missing"), v.literal("submitted"), v.literal("in_review"), v.literal("approved"), v.literal("rejected"), v.literal("expired"))),
  title: v.string(),
  licenseOrReferenceNumber: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  verificationRequestId: v.optional(v.id("verificationRequests")),
  files: uploadedFileReferenceListValidator,
  notes: v.optional(v.string()),
});

export const projectAdLicenseInputValidator = v.object({
  dossierId: v.optional(v.string()),
  licenseNumber: v.string(),
  countryCode: v.optional(v.string()),
  jurisdiction: v.optional(v.string()),
  permitType: v.optional(gccPermitTypeValidator),
  permitNumber: v.optional(v.string()),
  permitQrOrUrl: v.optional(v.string()),
  verificationStatus: v.optional(gccPermitVerificationStatusValidator),
  requiredForChannels: v.optional(v.array(v.string())),
  sourceAuthority: v.optional(gccSourceAuthorityValidator),
  status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("expired"))),
  purpose: v.optional(v.string()),
  channels: v.optional(v.array(v.string())),
  brokerageContractNumber: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  evidenceFiles: v.optional(uploadedFileReferenceListValidator),
  verificationRequestId: v.optional(v.id("verificationRequests")),
});

export const projectBrokerAuthorizationInputValidator = v.object({
  dossierId: v.optional(v.string()),
  brokerId: v.optional(v.id("brokers")),
  REDId: v.optional(v.id("RED")),
  contractNumber: v.optional(v.string()),
  marketingScope: v.optional(v.string()),
  channels: v.optional(v.array(v.string())),
  commissionTerms: v.optional(v.string()),
  validFrom: v.optional(v.number()),
  validUntil: v.optional(v.number()),
  status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("expired"), v.literal("revoked"))),
  evidenceFiles: v.optional(uploadedFileReferenceListValidator),
});

export const projectUnitBulkActionValidator = v.union(
  v.object({
    type: v.literal("create"),
    unit: projectUnitInputValidator,
  }),
  v.object({
    type: v.literal("update"),
    unitId: v.id("projectUnits"),
    patch: v.object({
      label: v.optional(v.string()),
      unitKind: v.optional(v.union(v.literal("unit_type"), v.literal("unit"))),
      status: v.optional(v.union(v.literal("available"), v.literal("reserved"), v.literal("sold"), v.literal("draft"))),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      sizeSqm: v.optional(v.number()),
      floor: v.optional(v.string()),
      view: v.optional(v.string()),
      price: v.optional(v.number()),
      handoverAt: v.optional(v.number()),
      floorPlanMedia: v.optional(uploadedFileReferenceListValidator),
    }),
  }),
  v.object({
    type: v.literal("delete"),
    unitId: v.id("projectUnits"),
  }),
  v.object({
    type: v.literal("duplicate"),
    unitId: v.id("projectUnits"),
    label: v.optional(v.string()),
  }),
  v.object({
    type: v.literal("mark_status"),
    unitIds: v.array(v.id("projectUnits")),
    status: v.union(v.literal("available"), v.literal("reserved"), v.literal("sold"), v.literal("draft")),
  }),
  v.object({
    type: v.literal("import"),
    units: v.array(projectUnitInputValidator),
  }),
);
