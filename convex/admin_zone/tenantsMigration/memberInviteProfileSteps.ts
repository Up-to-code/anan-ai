import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { tenants } from "../../tenants";
import {
  resolveOwnerKeyFromInvite,
  resolveOwnerKeyFromMembership,
  resolveOwnerKeyFromProfile,
  type OwnerKey,
} from "./helpers";

function resolveTenantOrgId(args: {
  ownerKey: OwnerKey;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  return args.tenantOrgIdByOwner.get(args.ownerKey) ?? args.linksByOwner.get(args.ownerKey)?.tenantOrgId;
}

async function runWhenNotDryRun(dryRun: boolean, run: () => Promise<void>) {
  if (!dryRun) await run();
}

type MembershipCounts = {
  migrated: number;
  updatedRoles: number;
  suspended: number;
  skipped: number;
};

async function migrateSingleMembership(args: {
  actorByOwner: Map<OwnerKey, string>;
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  membership: Doc<"organizationMemberships">;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}): Promise<MembershipCounts> {
  const ownerKey = resolveOwnerKeyFromMembership(args.membership);
  if (!ownerKey) return { migrated: 0, updatedRoles: 0, suspended: 0, skipped: 1 };
  const tenantOrgId = resolveTenantOrgId({ ownerKey, ...args });
  const actorAuthUserId = args.actorByOwner.get(ownerKey) ?? args.membership.invitedBy ?? args.membership.authUserId;
  if (!tenantOrgId || !actorAuthUserId) return { migrated: 0, updatedRoles: 0, suspended: 0, skipped: 1 };

  const counts = { migrated: 0, updatedRoles: 0, suspended: 0, skipped: 0 };
  const existingMember = await tenants.getMember(args.ctx as never, tenantOrgId, args.membership.authUserId);
  if (!existingMember) {
    await runWhenNotDryRun(args.dryRun, () => tenants.addMember(args.ctx as never, actorAuthUserId, tenantOrgId, args.membership.authUserId, args.membership.role));
    counts.migrated = 1;
  }
  if (existingMember && existingMember.role !== args.membership.role && existingMember.role !== "owner") {
    await runWhenNotDryRun(args.dryRun, () => tenants.updateMemberRole(args.ctx as never, actorAuthUserId, tenantOrgId, args.membership.authUserId, args.membership.role));
    counts.updatedRoles = 1;
  }
  const shouldSuspend = args.membership.status === "inactive" && (!existingMember || (existingMember.status ?? "active") !== "suspended");
  if (shouldSuspend) {
    await runWhenNotDryRun(args.dryRun, () => tenants.suspendMember(args.ctx as never, actorAuthUserId, tenantOrgId, args.membership.authUserId));
    counts.suspended = 1;
  }
  return counts;
}

function mergeMembershipCounts(target: MembershipCounts, delta: MembershipCounts) {
  target.migrated += delta.migrated;
  target.updatedRoles += delta.updatedRoles;
  target.suspended += delta.suspended;
  target.skipped += delta.skipped;
}

export async function migrateMemberships(args: {
  actorByOwner: Map<OwnerKey, string>;
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  memberships: Doc<"organizationMemberships">[];
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  const counts = { migrated: 0, updatedRoles: 0, suspended: 0, skipped: 0 };
  for (const membership of args.memberships) {
    mergeMembershipCounts(counts, await migrateSingleMembership({ ...args, membership }));
  }
  return counts;
}

export async function migrateInvites(args: {
  actorByOwner: Map<OwnerKey, string>;
  ctx: MutationCtx;
  dryRun: boolean;
  invites: Doc<"teamInvites">[];
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  let migrated = 0;
  let skipped = 0;
  const invitesByOrg = new Map<string, Awaited<ReturnType<typeof tenants.listInvitations>>>();
  for (const invite of args.invites) {
    const ownerKey = resolveOwnerKeyFromInvite(invite);
    if (!ownerKey || invite.status !== "pending" || invite.expiresAt < Date.now()) {
      skipped += 1;
      continue;
    }
    const tenantOrgId = resolveTenantOrgId({ ownerKey, ...args });
    const actorAuthUserId = args.actorByOwner.get(ownerKey) ?? invite.invitedBy;
    if (!tenantOrgId || !actorAuthUserId) {
      skipped += 1;
      continue;
    }
    const orgInvites = invitesByOrg.get(tenantOrgId) ?? (await tenants.listInvitations(args.ctx as never, tenantOrgId));
    invitesByOrg.set(tenantOrgId, orgInvites);
    const normalizedEmail = invite.email.trim().toLowerCase();
    const existingPending = orgInvites.find((item) => item.status === "pending" && item.inviteeIdentifier.toLowerCase() === normalizedEmail);
    if (existingPending) {
      skipped += 1;
      continue;
    }
    await runWhenNotDryRun(args.dryRun, async () => {
      const result = await tenants.inviteMember(args.ctx as never, actorAuthUserId, tenantOrgId, normalizedEmail, invite.role, { expiresAt: invite.expiresAt });
      orgInvites.push({ _id: result.invitationId, organizationId: tenantOrgId, inviteeIdentifier: normalizedEmail, role: invite.role, status: "pending", expiresAt: invite.expiresAt } as typeof orgInvites[number]);
    });
    migrated += 1;
  }
  return { migrated, skipped };
}

function resolveProfileTenantOrgId(args: {
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  membershipsByAuthUserId: Map<string, Doc<"organizationMemberships">[]>;
  profile: Doc<"userProfiles">;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  const ownerKey = resolveOwnerKeyFromProfile(args.profile);
  if (ownerKey) {
    const directTenantOrgId = resolveTenantOrgId({ ownerKey, ...args });
    if (directTenantOrgId) return directTenantOrgId;
  }
  const memberList = args.membershipsByAuthUserId.get(args.profile.authUserId) ?? [];
  const candidate = memberList.find((item) => item.status === "active") ?? memberList[0];
  if (!candidate) return null;
  const candidateOwnerKey = resolveOwnerKeyFromMembership(candidate);
  if (!candidateOwnerKey) return null;
  return resolveTenantOrgId({ ownerKey: candidateOwnerKey, ...args }) ?? null;
}

export async function backfillCurrentTenantOrg(args: {
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  memberships: Doc<"organizationMemberships">[];
  profiles: Doc<"userProfiles">[];
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  let updatedProfiles = 0;
  const membershipsByAuthUserId = new Map<string, Doc<"organizationMemberships">[]>();
  for (const membership of args.memberships) {
    const list = membershipsByAuthUserId.get(membership.authUserId) ?? [];
    list.push(membership);
    membershipsByAuthUserId.set(membership.authUserId, list);
  }
  for (const profile of args.profiles) {
    if (profile.currentTenantOrgId) continue;
    const resolvedTenantOrgId = resolveProfileTenantOrgId({
      linksByOwner: args.linksByOwner,
      membershipsByAuthUserId,
      profile,
      tenantOrgIdByOwner: args.tenantOrgIdByOwner,
    });
    if (!resolvedTenantOrgId) continue;
    updatedProfiles += 1;
    await runWhenNotDryRun(args.dryRun, () => args.ctx.db.patch(profile._id, { currentTenantOrgId: resolvedTenantOrgId, updatedAt: Date.now() }));
  }
  return updatedProfiles;
}
