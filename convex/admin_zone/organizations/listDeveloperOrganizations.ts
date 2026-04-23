import { requireAdminAccess } from "../../_core/security/accessPolicy";
import { tenants } from "../../tenants";
import { buildDeveloperSummary, buildTenantMap } from "./listOrganizationSummaries";

export const listDeveloperOrganizationsArgs = {};

/**
 * WHY:   The organizations section also needs a RED/developer list using the same admin read model style.
 * WHAT:  Returns developer organizations enriched with linked profiles, team members, inventory totals, and verification counts.
 * HOW:   Joins RED organizations against profiles, memberships, properties, and verification requests in memory.
 */
export async function listDeveloperOrganizationsHandler(ctx: any) {
  await requireAdminAccess(ctx);

  const [developers, profiles, tenantLinks, properties, verificationRequests] = await Promise.all([
    ctx.db.query("RED").collect(),
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("properties").collect(),
    ctx.db.query("verificationRequests").collect(),
  ]);

  const tenantOrgIdByRedId = buildTenantMap(tenantLinks, "ownerREDId");

  return Promise.all(
    developers.map(async (developer: any) => {
      const tenantOrgId = tenantOrgIdByRedId.get(String(developer._id));
      const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];
      return buildDeveloperSummary({
        developer,
        profiles,
        properties,
        verificationRequests,
        members,
      });
    })
  );
}
