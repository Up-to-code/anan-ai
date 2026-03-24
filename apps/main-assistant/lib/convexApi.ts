import { anyApi } from "convex/server";

export const api = anyApi;
export const internal = anyApi;

/**
 * WHY:   The app server layer should keep Convex transport boundaries simple and untyped.
 * WHAT:  Re-exports generated Convex handles plus unsafe maps for dynamic endpoint lookup.
 * HOW:   Casts generated refs to indexable records used by repository-style services.
 */
export const apiUnsafe = api as unknown as Record<string, unknown>;
export const internalUnsafe = internal as unknown as Record<string, unknown>;
