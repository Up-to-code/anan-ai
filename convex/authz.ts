import { Authz, definePermissions, defineRoles } from "@djpanda/convex-authz";
import { TENANTS_PERMISSIONS, TENANTS_ROLES } from "@djpanda/convex-tenants";
import { components } from "./_generated/api";

const permissions = definePermissions(TENANTS_PERMISSIONS);

const roles = defineRoles(permissions, TENANTS_ROLES, {
  manager: {
    organizations: ["read", "update"],
    members: ["add", "remove", "updateRole", "suspend", "unsuspend", "list"],
    teams: [
      "create",
      "update",
      "delete",
      "addMember",
      "updateMemberRole",
      "removeMember",
      "list",
    ],
    invitations: ["create", "cancel", "resend", "list"],
    permissions: ["grant", "deny"],
  },
  viewer: {
    organizations: ["read"],
    members: ["list"],
    teams: ["list"],
    invitations: ["list"],
  },
});

/**
 * WHY:   Tenants role-based access must be centralized for consistent org security.
 * WHAT:  Configures the Convex Authz component with tenant permissions and roles.
 * HOW:   Defines role/permission mappings then instantiates the Authz client.
 */
export const authz = new Authz(components.authz, { permissions, roles });
export type TenantsRole = keyof typeof roles;
