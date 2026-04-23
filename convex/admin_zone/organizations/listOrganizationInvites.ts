import { requireAdminAccess } from "../../_core/security/accessPolicy";
import { tenants } from "../../tenants";
import { buildOrganizationKey } from "./helpers";

export const listOrganizationInvitesArgs = {};

export async function listOrganizationInvitesHandler(ctx: any) {
  await requireAdminAccess(ctx);
  const [tenantLinks, brokers, developers] = await Promise.all([
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
  ]);
  const rows = await Promise.all(
    tenantLinks.map(async (link: any) => {
      const ownerType = link.ownerType === "broker" ? "broker" : "red";
      const ownerId = link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId;
      if (!ownerId) return [];

      const ownerRecord =
        ownerType === "broker"
          ? brokers.find((item: any) => item._id === ownerId)
          : developers.find((item: any) => item._id === ownerId);

      const invitations = await tenants.listInvitations(ctx as never, link.tenantOrgId);
      return invitations.map((invite) => ({
        id: String(invite._id),
        organizationKey: buildOrganizationKey(ownerType, String(ownerId)),
        organizationName: ownerRecord?.name ?? "منظمة غير معروفة",
        ownerType,
        email: invite.inviteeIdentifier,
        role: invite.role,
        status: invite.status === "cancelled" ? "canceled" : invite.status,
        invitedBy: invite.inviterId ?? "",
        expiresAt: invite.expiresAt,
      }));
    })
  );
  return rows.flat();
}
