import { revalidatePath } from "next/cache";
import { requireAdminPageSession } from "@/lib/serverSession";
import { requireAdminSession } from "@/server/auth/guards";
import { convexAdminComplianceRepository } from "@/server/infrastructure/convex/adminComplianceRepository";

/**
 * WHY:   The admin compliance page needs rulesets plus an optional selected record.
 * WHAT:  Loads rulesets, selected ruleset, and ensures defaults are seeded.
 * HOW:   Requires an admin page session, runs seed, then queries the repository.
 */
export async function getComplianceRulesetsPageData(selectedId?: string) {
  const session = await requireAdminPageSession("/compliance");
  await convexAdminComplianceRepository.seedDefaults(session.token);
  const rulesets = await convexAdminComplianceRepository.list(session.token);
  const selected = selectedId
    ? await convexAdminComplianceRepository.get(session.token, selectedId)
    : null;

  return { session, rulesets, selected };
}

/**
 * WHY:   Admin edits should persist to Convex and refresh the compliance page.
 * WHAT:  Saves a ruleset payload and revalidates the compliance route.
 * HOW:   Requires admin session, saves via repository, then revalidates Next.js cache.
 */
export async function saveComplianceRuleset(input: Record<string, unknown>) {
  "use server";
  const session = await requireAdminSession();
  await convexAdminComplianceRepository.save(session.token, input);
  revalidatePath("/compliance");
}
