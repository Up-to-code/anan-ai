import { api, internal } from "@convex/api";

export { api, internal };

// The web server repository layer intentionally erases generated API types at the transport boundary.
export const apiUnsafe = api as unknown as Record<string, unknown>;
export const internalUnsafe = internal as unknown as Record<string, unknown>;
