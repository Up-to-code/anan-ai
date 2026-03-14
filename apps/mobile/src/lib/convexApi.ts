const functionName = Symbol.for("functionName");

function createApi(pathParts: string[] = []): any {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop === "string") {
          return createApi([...pathParts, prop]);
        }

        if (prop === functionName) {
          if (pathParts.length < 2) {
            throw new Error(
              `Convex API path must look like api.module.function. Received: ${pathParts.join(".")}`,
            );
          }

          const path = pathParts.slice(0, -1).join("/");
          const exportName = pathParts[pathParts.length - 1];
          return exportName === "default" ? path : `${path}:${exportName}`;
        }

        if (prop === Symbol.toStringTag) {
          return "FunctionReference";
        }

        return undefined;
      },
    },
  );
}

/**
 * WHY:   Expo cannot reliably import the repo-level generated Convex API file, and `convex/browser` does not expose `anyApi`.
 * WHAT:  Provides a local function-reference proxy compatible with Convex React hooks.
 * HOW:   Recreates the minimal `anyApi` behavior used by generated Convex clients.
 */
export const api = createApi();
