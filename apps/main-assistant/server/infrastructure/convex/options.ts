import type { NextjsOptions } from "convex/nextjs";
import { resolveConvexDeploymentUrl } from "@/server/infrastructure/convex/deploymentUrl";

/**
 * WHY:   Domain repositories should not duplicate Convex deployment URL resolution logic.
 * WHAT:  Returns standard `convex/nextjs` options with a validated deployment URL.
 * HOW:   Delegates URL resolution to the shared runtime resolver.
 */
export function getConvexNextOptions(): NextjsOptions {
  const deployment = resolveConvexDeploymentUrl();
  return {
    url: deployment.url,
  };
}
