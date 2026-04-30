import { v } from "convex/values";

export const trustedUploadUrlValidator = v.string();
export const sha256HexValidator = v.string();
export const positiveFileSizeValidator = v.number();
export const tenantOrgIdValidator = v.string();
export const redirectUriValidator = v.string();
export const tokenHashValidator = v.string();

export const verifiedUploadMimeValidator = v.union(
  v.literal("image/jpeg"),
  v.literal("image/png"),
  v.literal("image/webp"),
  v.literal("application/pdf"),
);

export const imageUploadMimeValidator = v.union(
  v.literal("image/jpeg"),
  v.literal("image/png"),
  v.literal("image/webp"),
);

// Scope allowlisting is enforced by the OAuth registry in write paths. Convex schema
// keeps this as a named string to avoid duplicating package-level scope catalogs.
export const oauthScopeValidator = v.string();

export const jsonPrimitiveValidator = v.union(
  v.null(),
  v.boolean(),
  v.number(),
  v.string(),
);

export const boundedJsonValueValidator = v.union(
  jsonPrimitiveValidator,
  v.array(jsonPrimitiveValidator),
  v.record(v.string(), jsonPrimitiveValidator),
);

export const boundedMetadataValidator = v.record(v.string(), boundedJsonValueValidator);

// Named escape hatch for intentionally dynamic AI/rules payloads. New security-sensitive
// schemas should use boundedMetadataValidator or a domain-specific object instead.
export const unsafeDynamicPayloadValidator = v.any();
