import type { PaginationResult } from "convex/server";
import { z } from "zod";
import { uploadedFileReferenceSchema } from "@/server/contracts/files";

export const propertyStatusSchema = z.enum(["available", "sold", "reserved"]);
export const publicationStateSchema = z.enum(["draft", "published", "archived"]);

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
  body?: unknown;
};

export type PropertyListItem = PropertyDetail;
export type PaginatedPropertiesResult = PaginationResult<PropertyListItem>;
export type PublishPropertyResult = { ok: true };
export type BrokerOverviewSummary = { properties: number };
export type DeveloperOverviewSummary = { properties: number };
