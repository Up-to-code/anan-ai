import { tenants } from "../../tenants";

export type TenantMembershipRow = {
  tenantOrgId: string;
  ownerType: "broker" | "red";
  ownerId: string;
  member: {
    _id: string;
    _creationTime: number;
    userId: string;
    role: string;
    status?: string;
    joinedAt?: number;
  };
};

export async function buildTenantMembershipRows(
  ctx: Parameters<typeof tenants.listMembers>[0],
  tenantLinks: Array<{
    tenantOrgId: string;
    ownerType: "broker" | "RED";
    ownerBrokerId?: unknown;
    ownerREDId?: unknown;
  }>
): Promise<TenantMembershipRow[]> {
  const rows = await Promise.all(
    tenantLinks.map(async (link) => {
      const ownerType: TenantMembershipRow["ownerType"] =
        link.ownerType === "broker" ? "broker" : "red";
      const ownerId = link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId;
      if (!ownerId) return [];

      const members = await tenants.listMembers(ctx as never, link.tenantOrgId);
      return members.map((member) => ({
        tenantOrgId: link.tenantOrgId,
        ownerType,
        ownerId: String(ownerId),
        member: {
          _id: member._id,
          _creationTime: member._creationTime,
          userId: member.userId,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
        },
      }));
    })
  );

  return rows.flat();
}

