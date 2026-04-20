import {
  convexOrganizationsRepository,
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizations";

/**
 * WHY:   Better Auth Organizations are now the user-facing org authority, while Convex still owns Anan metadata.
 * WHAT:  Repository boundary used by web services during the fresh-auth reset migration.
 * HOW:   Delegates app-owned organization metadata and directory behavior to the existing Convex repository; client-side
 *        Better Auth organization actions create/switch active auth organizations before the Convex bridge sync runs.
 */
export const betterAuthOrganizationsRepository: OrganizationsRepository = {
  ...convexOrganizationsRepository,
};
