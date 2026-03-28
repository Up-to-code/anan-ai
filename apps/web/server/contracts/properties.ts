import type { PaginationResult } from "convex/server";
import { z } from "zod";
import { uploadedFileReferenceSchema } from "@/server/contracts/files";

export const propertyStatusSchema = z.enum(["available", "sold", "reserved"]);
export const publicationStateSchema = z.enum(["draft", "published", "archived"]);
export const buyerVisibilitySchema = z.enum(["private", "public"]);

export const paginationOptionsSchema = z.object({
  cursor: z.string().nullable(),
  numItems: z.number().int().positive(),
});

/**
 * WHY:   Broker and developer server functions share the same property list filter contract.
 * WHAT:  Validates pagination and optional status filters for owner-scoped property lists.
 * HOW:   Uses the same status enum as the Convex schema and a minimal pagination shape accepted by Convex.
 */
export const propertyListFiltersSchema = z.object({
  paginationOpts: paginationOptionsSchema,
  status: propertyStatusSchema.optional(),
});

export const propertyPresentationSchema = z.object({
  descriptionShort: z.string().trim().min(1).max(280).optional(),
  amenities: z.array(z.string().trim().min(1)).optional(),
  parkingSpaces: z.number().int().nonnegative().optional(),
  hasParking: z.boolean().optional(),
  slides: z.array(uploadedFileReferenceSchema).optional(),
  coverImageKey: z.string().trim().min(1).optional(),
  galleryDisplayMode: z.enum(["cover", "fit"]).optional(),
  galleryAspectRatio: z.enum(["auto", "landscape", "square", "portrait"]).optional(),
  privatePermitSummary: z.string().trim().min(1).optional(),
  privatePermitFiles: z.array(uploadedFileReferenceSchema).optional(),
  privatePermitVisibility: z.literal("conversation_only").optional(),
  privateViewerAuthUserIds: z.array(z.string().min(1)).optional(),
});

export const propertyBodySchema = z.object({
  presentation: propertyPresentationSchema.optional(),
});

/**
 * WHY:   Property writes from server functions need one shared input contract across Broker and RED zones.
 * WHAT:  Validates the create payload for properties managed by role-zoned server functions.
 * HOW:   Mirrors the current Convex property fields used by Broker and RED property creation flows.
 */
export const createPropertyInputSchema = z.object({
  title: z.string().min(1).max(200),
  address: z.string().min(1).max(200),
  price: z.number().finite(),
  beds: z.number().finite(),
  baths: z.number().finite(),
  sqft: z.number().finite().optional(),
  description: z.string().min(1),
  location: z.string().optional(),
  area: z.string().optional(),
  status: propertyStatusSchema.optional(),
  bankId: z.string().optional(),
  media: z.array(uploadedFileReferenceSchema).optional(),
  body: propertyBodySchema.optional(),
  adLicenseNumber: z.string().trim().optional(),
  publicationState: publicationStateSchema.optional(),
});

/**
 * WHY:   Property patch operations should allow partial updates while still sharing one validated contract.
 * WHAT:  Validates the mutable property fields for update operations.
 * HOW:   Makes each create-field optional and leaves immutable owner resolution to the server function layer.
 */
export const updatePropertyInputSchema = createPropertyInputSchema.partial();

export type PropertyListFilters = z.infer<typeof propertyListFiltersSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyInputSchema>;
export type PropertyPresentation = z.infer<typeof propertyPresentationSchema>;
export type PropertyBody = z.infer<typeof propertyBodySchema>;
export type BuyerVisibility = z.infer<typeof buyerVisibilitySchema>;

export type PropertyDetail = {
  _id: string;
  _creationTime?: number;
  title: string;
  address: string;
  REDId?: string;
  brokerId?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  description: string;
  location?: string;
  area?: string;
  status?: z.infer<typeof propertyStatusSchema>;
  publicationState?: z.infer<typeof publicationStateSchema>;
  searchText?: string;
  bankId?: string;
  heroImage?: import("@/server/contracts/files").UploadedFileReference | null;
  media?: import("@/server/contracts/files").UploadedFileReference[];
  body?: PropertyBody;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected";
  adLicenseVerificationRequestId?: string;
};

export const propertyViewerSummarySchema = z.object({
  authUserId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  accessSource: z.enum(["manual", "chat_share"]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
});
export type PropertyViewerSummary = z.infer<typeof propertyViewerSummarySchema>;

export const organizationAssetSchema = z.object({
  _id: z.string().min(1).optional(),
  tenantOrgId: z.string().min(1),
  uploaderAuthUserId: z.string().min(1),
  category: z.enum([
    "project_image",
    "project_document",
    "chat_attachment",
    "offer_attachment",
    "verification_document",
  ]),
  kind: z.enum(["image", "pdf"]),
  key: z.string().min(1),
  url: z.string().url(),
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  mime: z.string().min(1),
  lifecycleState: z.enum(["active", "archived", "pending_delete", "deleted"]),
  attachedEntityType: z.enum(["project", "conversation", "offer"]).nullable().optional(),
  attachedEntityId: z.string().nullable().optional(),
  visibilityScope: z.enum(["organization", "project_private_share", "public_project"]),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  scheduledDeletionAt: z.number().int().nonnegative().optional(),
  deletedAt: z.number().int().nonnegative().optional(),
  deletionReason: z.string().min(1).optional(),
});
export type OrganizationAsset = z.infer<typeof organizationAssetSchema>;

export type PropertyListItem = PropertyDetail;
export type PaginatedPropertiesResult = PaginationResult<PropertyListItem>;
export type PublishPropertyResult = { ok: true };
export type BrokerOverviewSummary = { properties: number };
export type DeveloperOverviewSummary = { properties: number };

export function parsePropertyBody(body: unknown): PropertyBody | null {
  const parsed = propertyBodySchema.safeParse(body);
  return parsed.success ? parsed.data : null;
}
