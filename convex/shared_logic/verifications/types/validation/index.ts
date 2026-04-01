import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "../../../files";

export const verificationStatusValidator = v.union(
  v.literal("new"),
  v.literal("in_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("closed"),
);

export const optionalVerificationStatusValidator = v.optional(
  verificationStatusValidator,
);

export const reviewStatusValidator = v.union(
  v.literal("in_review"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("closed"),
);

export const verificationOrganizationTypeValidator = v.union(
  v.literal("broker"),
  v.literal("red"),
);

export const organizationVerificationRequestFields = {
  documents: uploadedFileReferenceListValidator,
  proofDocuments: v.optional(uploadedFileReferenceListValidator),
  requirements: v.optional(v.array(v.string())),
  sourceUrls: v.optional(v.array(v.string())),
  notes: v.optional(v.string()),
  organizationType: v.optional(verificationOrganizationTypeValidator),
} as const;

export const propertyVerificationRequestFields = {
  propertyId: v.id("properties"),
  adLicenseNumber: v.string(),
  documents: uploadedFileReferenceListValidator,
  proofDocuments: v.optional(uploadedFileReferenceListValidator),
  notes: v.optional(v.string()),
} as const;
