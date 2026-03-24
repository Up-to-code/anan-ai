import { requireRole } from "../../_core/security/accessPolicy";
import { tenants } from "../../tenants";
import { buildBrokerSummary, buildTenantMap } from "./listOrganizationSummaries";

export const listBrokerOrganizationsArgs = {};

/**
 * WHY:   The organizations section needs a broker-focused list with verification, membership, and inventory summaries.
 * WHAT:  Returns broker organizations enriched with linked profiles, team members, inventory totals, and verification counts.
 * HOW:   Joins brokers against profiles, memberships, properties, and verification requests in memory.
 */
export async function listBrokerOrganizationsHandler(ctx: any) {
  await requireRole(ctx, ["admin"]);

  const [brokers, profiles, tenantLinks, properties, verificationRequests] = await Promise.all([
    ctx.db.query("brokers").collect(),
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("properties").collect(),
    ctx.db.query("verificationRequests").collect(),
  ]);

  const tenantOrgIdByBrokerId = buildTenantMap(tenantLinks, "ownerBrokerId");

  return Promise.all(
    brokers.map(async (broker: any) => {
      const tenantOrgId = tenantOrgIdByBrokerId.get(String(broker._id));
      const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];
      return buildBrokerSummary({
        broker,
        profiles,
        properties,
        verificationRequests,
        members,
      });
    })
  );
}
