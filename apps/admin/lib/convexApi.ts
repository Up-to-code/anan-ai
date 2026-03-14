import { api, internal } from "../../convex/_generated/api";

export { api, internal };

// The web server repository layer intentionally erases generated API types at the transport boundary.
// @ts-expect-error Generated Convex API types are intentionally erased for the repository boundary.
export const apiUnsafe = api as unknown as Record<string, unknown>;
// @ts-expect-error Generated Convex API types are intentionally erased for the repository boundary.
export const internalUnsafe = internal as unknown as Record<string, unknown>;
