import type { MutationCtx, QueryCtx, ActionCtx } from "../../../_generated/server";
import { ConvexError } from "convex/values";
import { requireZoneRole, type AccessContext, type AdminAccessContext } from "../../../_core/security/accessPolicy";

type AnyHandler<Args, Return> = (ctx: any, args: Args) => Promise<Return>;

/**
 * WHY:   DRY wrapper to apply zone-specific role enforcement on handlers.
 * WHAT:  Executes `requireZoneRole` then injects accessContext into the handler.
 * HOW:   Keeps handler bodies thin; returns standardized ConvexError on auth failures.
 */
export function withZoneGuard<Args, Return>(
  zone:
    | "admin_zone"
    | "broker_zone"
    | "red_zone"
    | "shared_logic"
    | "ai_zone",
  handler: (
    ctx: (QueryCtx | MutationCtx | ActionCtx) & { access: AccessContext | AdminAccessContext },
    args: Args,
  ) => Promise<Return>,
): AnyHandler<Args, Return> {
  return async (ctx, args) => {
    try {
      const access = await requireZoneRole(ctx as any, zone);
      return handler({ ...(ctx as any), access }, args);
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized" });
    }
  };
}
