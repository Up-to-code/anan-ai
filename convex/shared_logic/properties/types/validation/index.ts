import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "../../../files";

export const propertyStatusValidator = v.union(
  v.literal("available"),
  v.literal("sold"),
  v.literal("reserved"),
);

export const optionalPropertyStatusValidator = v.optional(propertyStatusValidator);

export const propertyPublicationStateValidator = v.union(
  v.literal("draft"),
  v.literal("published"),
  v.literal("archived"),
);

export const optionalPropertyPublicationStateValidator = v.optional(
  propertyPublicationStateValidator,
);

export const ownerScopedPropertyCreateFields = {
  title: v.string(),
  address: v.string(),
  price: v.number(),
  beds: v.number(),
  baths: v.number(),
  sqft: v.optional(v.number()),
  description: v.string(),
  location: v.optional(v.string()),
  area: v.optional(v.string()),
  status: optionalPropertyStatusValidator,
  bankId: v.optional(v.id("banks")),
  media: v.optional(uploadedFileReferenceListValidator),
  body: v.optional(v.any()),
  adLicenseNumber: v.optional(v.string()),
  publicationState: optionalPropertyPublicationStateValidator,
} as const;

export const ownerScopedPropertyUpdateFields = {
  id: v.id("properties"),
  title: v.optional(v.string()),
  address: v.optional(v.string()),
  price: v.optional(v.number()),
  beds: v.optional(v.number()),
  baths: v.optional(v.number()),
  sqft: v.optional(v.number()),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  area: v.optional(v.string()),
  status: optionalPropertyStatusValidator,
  bankId: v.optional(v.id("banks")),
  media: v.optional(uploadedFileReferenceListValidator),
  body: v.optional(v.any()),
  adLicenseNumber: v.optional(v.string()),
  publicationState: optionalPropertyPublicationStateValidator,
} as const;
