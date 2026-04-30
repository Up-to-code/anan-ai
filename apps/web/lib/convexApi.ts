import { createUnsafeApiProxy } from "@anan/convex-adapters/api";
import { api, internal } from "../../../convex/_generated/api";

export { api, internal };

// The web server repository layer intentionally erases generated API types at the transport boundary.
export const apiUnsafe = createUnsafeApiProxy(api);
export const internalUnsafe = createUnsafeApiProxy(internal);
