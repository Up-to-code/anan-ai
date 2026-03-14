import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminPropertiesRepository, type PropertyMutationInput } from "@/server/infrastructure/convex/adminPropertiesRepository";

/**
 * WHY:   The properties page combines list, filters, RED lookup, and optional edit loading.
 * WHAT:  Returns the current page of properties, all RED options, and the selected property when requested.
 * HOW:   Resolves the admin session once, then loads the required datasets in parallel.
 */
export async function getAdminPropertiesPageData(input: {
  status?: "available" | "sold" | "reserved";
  REDId?: string;
  cursor?: string | null;
  selectedId?: string | null;
}) {
  const session = await requireAdminPageSession("/properties");
  const [properties, reds, selectedProperty] = await Promise.all([
    convexAdminPropertiesRepository.list(session.token, {
      status: input.status,
      REDId: input.REDId,
      paginationOpts: {
        numItems: 20,
        cursor: input.cursor ?? null,
      },
    }),
    convexAdminPropertiesRepository.listReds(session.token),
    input.selectedId ? convexAdminPropertiesRepository.get(session.token, input.selectedId) : Promise.resolve(null),
  ]);

  return { session, properties, reds, selectedProperty };
}

/**
 * WHY:   Property creation should stay behind one admin-scoped server API.
 * WHAT:  Creates a property record using the existing admin Convex mutation.
 * HOW:   Requires an admin session, then forwards the parsed form payload to the repository.
 */
export async function createAdminProperty(input: PropertyMutationInput) {
  const session = await requireAdminSession();
  await convexAdminPropertiesRepository.create(session.token, input);
}

/**
 * WHY:   Property edits should reuse the same auth and repository plumbing as other admin writes.
 * WHAT:  Updates one property record.
 * HOW:   Requires an admin session, then delegates to the properties repository.
 */
export async function updateAdminProperty(input: Partial<PropertyMutationInput> & { id: string }) {
  const session = await requireAdminSession();
  await convexAdminPropertiesRepository.update(session.token, input);
}

/**
 * WHY:   Property deletion is destructive and must stay inside an explicit admin-only boundary.
 * WHAT:  Deletes one property by id.
 * HOW:   Requires an admin session, then calls the delete mutation in the repository.
 */
export async function deleteAdminProperty(id: string) {
  const session = await requireAdminSession();
  await convexAdminPropertiesRepository.remove(session.token, id);
}
