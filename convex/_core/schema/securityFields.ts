import { v } from "convex/values";

/**
 * WHY:   Enterprise readiness requires every retained table to carry write attribution,
 *        soft-delete state, and a machine-readable encryption marker.
 * WHAT:  Canonical required field groups plus transitional optional groups for the
 *        live hybrid schema while backfills and write-path cutovers land.
 * HOW:   Existing tables use the transitional group first so current required
 *        createdAt/updatedAt definitions keep their stricter validators.
 */
export const globalSecurityFields = {
  createdBy: v.id("authUsers"),
  updatedBy: v.id("authUsers"),
  deletedAt: v.optional(v.number()),
  encryptedFields: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const tenantSecurityFields = {
  orgId: v.id("organizations"),
  ...globalSecurityFields,
};

export const transitionalGlobalSecurityFields = {
  createdBy: v.optional(v.id("authUsers")),
  updatedBy: v.optional(v.id("authUsers")),
  deletedAt: v.optional(v.number()),
  encryptedFields: v.optional(v.array(v.string())),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
};

export const transitionalTenantSecurityFields = {
  orgId: v.optional(v.id("organizations")),
  ...transitionalGlobalSecurityFields,
};
