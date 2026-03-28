import { ConvexError } from "convex/values";
import type { PaginationOptions } from "convex/server";
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { buildPropertySearchText } from "../../shared_logic/properties/searchText";
import type { Infer } from "convex/values";
import { uploadedFileReferenceValidator } from "../../shared_logic/files";

type PropertyStatus = "available" | "sold" | "reserved";
type PropertyPublicationState = "draft" | "published" | "archived";

type RedPropertyWriteFields = {
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  description: string;
  location?: string;
  area?: string;
  status?: PropertyStatus;
  publicationState?: PropertyPublicationState;
  bankId?: Id<"banks">;
  media?: Infer<typeof uploadedFileReferenceValidator>[];
  body?: unknown;
  adLicenseNumber?: string;
};

type RedPropertyCreateArgs = RedPropertyWriteFields & {
  REDId: Id<"RED">;
};

type RedPropertyUpdateArgs = Partial<RedPropertyWriteFields> & {
  id: Id<"properties">;
};

/**
 * WHY:   The Next.js developer server layer needs a low-level property listing primitive by RED owner id.
 * WHAT:  Lists RED-owned properties with optional status filtering and pagination.
 * HOW:   Queries the `properties` table by `REDId` and applies status filtering when requested.
 */
export async function listPropertiesByRedId(
  ctx: QueryCtx,
  {
    paginationOpts,
    status,
    REDId,
  }: {
    paginationOpts: PaginationOptions;
    status?: PropertyStatus;
    REDId: Id<"RED">;
  },
) {
  if (status) {
    return ctx.db
      .query("properties")
      .withIndex("REDId", (q) => q.eq("REDId", REDId))
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .paginate(paginationOpts);
  }
  return ctx.db
    .query("properties")
    .withIndex("REDId", (q) => q.eq("REDId", REDId))
    .order("desc")
    .paginate(paginationOpts);
}

/**
 * WHY:   Application services must be able to load a property record before doing ownership checks in Next.js.
 * WHAT:  Returns a property document by id without applying role or owner authorization.
 * HOW:   Reads the property directly from the database.
 */
export async function getRedPropertyById(ctx: QueryCtx, { id }: { id: Id<"properties"> }) {
  return ctx.db.get(id);
}

/**
 * WHY:   RED property creation should persist only the write-side data concerns inside Convex.
 * WHAT:  Inserts a new RED-owned property and computes its derived search text.
 * HOW:   Builds `searchText`, stamps `publicationState=draft`, and inserts the document.
 */
export async function createRedProperty(ctx: MutationCtx, args: RedPropertyCreateArgs) {
  const { REDId, ...rest } = args;
  const heroImage = rest.media?.[0];
  const searchText = buildPropertySearchText(rest);
  return ctx.db.insert("properties", {
    ...rest,
    heroImage,
    searchText,
    REDId,
    publicationState: rest.publicationState ?? "draft",
  });
}

/**
 * WHY:   RED property updates should remain a pure persistence concern once ownership is enforced upstream.
 * WHAT:  Patches a property by id and refreshes the derived search text.
 * HOW:   Loads the existing document, merges the patch, rebuilds `searchText`, and applies the patch.
 */
export async function updateRedProperty(ctx: MutationCtx, { id, ...patch }: RedPropertyUpdateArgs) {
  const existing = await ctx.db.get(id);
  if (!existing) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  const merged = { ...existing, ...patch, heroImage: patch.media?.[0] ?? existing.heroImage };
  const searchText = buildPropertySearchText(merged);
  await ctx.db.patch(id, { ...patch, heroImage: patch.media?.[0] ?? existing.heroImage, searchText });
}

/**
 * WHY:   RED property deletion should not duplicate upstream authorization logic.
 * WHAT:  Deletes a property by id.
 * HOW:   Confirms the property exists, then deletes it.
 */
export async function deleteRedProperty(ctx: MutationCtx, { id }: { id: Id<"properties"> }) {
  const existing = await ctx.db.get(id);
  if (!existing) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  await ctx.db.delete(id);
}

/**
 * WHY:   Publishing a RED property is still a data mutation, but policy enforcement belongs in Next.js.
 * WHAT:  Marks a property as published by id.
 * HOW:   Confirms the property exists, then patches `publicationState`.
 */
export async function publishRedProperty(
  ctx: MutationCtx,
  { id }: { id: Id<"properties"> },
) {
  const existing = await ctx.db.get(id);
  if (!existing) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  await ctx.db.patch(id, { publicationState: "published" });
  return { ok: true } as const;
}
