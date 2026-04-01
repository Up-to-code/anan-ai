import { QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { countOwnerScopedProperties } from "../../shared_logic/properties/ownerScoped";

/**
 * WHY:   Developer server functions still need one low-level way to count properties for a RED owner id.
 * WHAT:  Returns the current property totals for the provided RED id.
 * HOW:   Reads directly from the `properties` table without role or session orchestration.
 */
export async function countRedOverviewStats(
  ctx: QueryCtx,
  { REDId }: { REDId: Id<"RED"> },
) {
  return countOwnerScopedProperties(ctx, {
    ownerField: "REDId",
    ownerId: REDId,
  });
}
