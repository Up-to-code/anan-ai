import { api, internal } from "../../../convex/_generated/api";

export { api, internal };

function createUnsafeApiProxy(source: unknown) {
  return new Proxy({} as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== "string") {
        return undefined;
      }
      return (source as Record<string, unknown> | undefined)?.[property];
    },
  });
}

// The web server repository layer intentionally erases generated API types at the transport boundary.
export const apiUnsafe = createUnsafeApiProxy(api);
export const internalUnsafe = createUnsafeApiProxy(internal);
