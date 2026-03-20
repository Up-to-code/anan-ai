import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { createTenantOrgWithFallbackSlug, mapMembershipsByOwner, mapProfilesByOwner, pickActorAuthUserId, type OwnerKey } from "./helpers";
import { backfillCurrentTenantOrg, migrateInvites, migrateMemberships } from "./memberInviteProfileSteps";
import { buildOwnerKeyFromEntity } from "./helpers";

type LegacySnapshot = {
  brokers: Doc<"brokers">[];
  reds: Doc<"RED">[];
  profiles: Doc<"userProfiles">[];
  memberships: Doc<"organizationMemberships">[];
  invites: Doc<"teamInvites">[];
};

type MigrationStats = {
  createdTenantOrgs: number;
  skippedTenantOrgs: number;
  migratedMemberships: number;
  updatedMembershipRoles: number;
  suspendedMemberships: number;
  skippedMemberships: number;
  migratedInvites: number;
  skippedInvites: number;
  updatedProfiles: number;
};

async function loadLegacySnapshot(ctx: MutationCtx): Promise<LegacySnapshot> {
  const [brokers, reds, profiles, memberships, invites] = await Promise.all([
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("organizationMemberships").collect(),
    ctx.db.query("teamInvites").collect(),
  ]);
  return { brokers, reds, profiles, memberships, invites };
}

function buildActorByOwner(snapshot: LegacySnapshot) {
  const profilesByOwner = mapProfilesByOwner(snapshot.profiles);
  const membershipsByOwner = mapMembershipsByOwner(snapshot.memberships);
  const actorByOwner = new Map<OwnerKey, string>();
  for (const [ownerKey, ownerProfiles] of profilesByOwner.entries()) {
    const actorId = pickActorAuthUserId({ ownerProfiles, ownerMemberships: membershipsByOwner.get(ownerKey) ?? [] });
    if (actorId) actorByOwner.set(ownerKey, actorId);
  }
  for (const [ownerKey, ownerMemberships] of membershipsByOwner.entries()) {
    if (actorByOwner.has(ownerKey)) continue;
    const actorId = pickActorAuthUserId({ ownerProfiles: [], ownerMemberships });
    if (actorId) actorByOwner.set(ownerKey, actorId);
  }
  return actorByOwner;
}

function resolveExistingTenantOrgId(args: {
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  ownerKey: OwnerKey;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  return args.linksByOwner.get(args.ownerKey)?.tenantOrgId ?? args.tenantOrgIdByOwner.get(args.ownerKey);
}

async function createBrokerTenantOrgs(args: {
  actorByOwner: Map<OwnerKey, string>;
  brokers: Doc<"brokers">[];
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  let created = 0;
  let skipped = 0;
  for (const broker of args.brokers) {
    const ownerKey = buildOwnerKeyFromEntity("broker", String(broker._id));
    const existingTenantOrgId = resolveExistingTenantOrgId({ ownerKey, linksByOwner: args.linksByOwner, tenantOrgIdByOwner: args.tenantOrgIdByOwner });
    if (existingTenantOrgId) {
      args.tenantOrgIdByOwner.set(ownerKey, existingTenantOrgId);
      continue;
    }
    const actorAuthUserId = args.actorByOwner.get(ownerKey);
    if (!actorAuthUserId) {
      skipped += 1;
      continue;
    }
    const tenantOrgId = await createTenantOrgWithFallbackSlug({
      ctx: args.ctx,
      actorAuthUserId,
      name: broker.name,
      slug: broker.slug,
      metadata: { ownerType: "broker", ownerBrokerId: String(broker._id) },
      dryRun: args.dryRun,
    });
    if (!args.dryRun) {
      await args.ctx.db.insert("tenantOrgLinks", { tenantOrgId, ownerType: "broker", ownerBrokerId: broker._id, createdAt: Date.now(), updatedAt: Date.now() });
    }
    created += 1;
    args.tenantOrgIdByOwner.set(ownerKey, tenantOrgId);
  }
  return { created, skipped };
}

async function createRedTenantOrgs(args: {
  actorByOwner: Map<OwnerKey, string>;
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
  reds: Doc<"RED">[];
  tenantOrgIdByOwner: Map<OwnerKey, string>;
}) {
  let created = 0;
  let skipped = 0;
  for (const red of args.reds) {
    const ownerKey = buildOwnerKeyFromEntity("red", String(red._id));
    const existingTenantOrgId = resolveExistingTenantOrgId({ ownerKey, linksByOwner: args.linksByOwner, tenantOrgIdByOwner: args.tenantOrgIdByOwner });
    if (existingTenantOrgId) {
      args.tenantOrgIdByOwner.set(ownerKey, existingTenantOrgId);
      continue;
    }
    const actorAuthUserId = args.actorByOwner.get(ownerKey);
    if (!actorAuthUserId) {
      skipped += 1;
      continue;
    }
    const tenantOrgId = await createTenantOrgWithFallbackSlug({
      ctx: args.ctx,
      actorAuthUserId,
      name: red.name,
      slug: red.slug,
      metadata: { ownerType: "RED", ownerREDId: String(red._id) },
      dryRun: args.dryRun,
    });
    if (!args.dryRun) {
      await args.ctx.db.insert("tenantOrgLinks", { tenantOrgId, ownerType: "RED", ownerREDId: red._id, createdAt: Date.now(), updatedAt: Date.now() });
    }
    created += 1;
    args.tenantOrgIdByOwner.set(ownerKey, tenantOrgId);
  }
  return { created, skipped };
}

export async function executeTenantMigrationFromLegacy(args: {
  ctx: MutationCtx;
  dryRun: boolean;
  linksByOwner: Map<OwnerKey, Doc<"tenantOrgLinks">>;
}) {
  const snapshot = await loadLegacySnapshot(args.ctx);
  const actorByOwner = buildActorByOwner(snapshot);
  const tenantOrgIdByOwner = new Map<OwnerKey, string>();

  const brokerResult = await createBrokerTenantOrgs({ ...args, ...snapshot, actorByOwner, tenantOrgIdByOwner });
  const redResult = await createRedTenantOrgs({ ...args, ...snapshot, actorByOwner, tenantOrgIdByOwner });
  const membershipsResult = await migrateMemberships({ ...args, ...snapshot, actorByOwner, tenantOrgIdByOwner });
  const invitesResult = await migrateInvites({ ...args, ...snapshot, actorByOwner, tenantOrgIdByOwner });
  const updatedProfiles = await backfillCurrentTenantOrg({ ...args, ...snapshot, tenantOrgIdByOwner });

  return {
    createdTenantOrgs: brokerResult.created + redResult.created,
    skippedTenantOrgs: brokerResult.skipped + redResult.skipped,
    migratedMemberships: membershipsResult.migrated,
    updatedMembershipRoles: membershipsResult.updatedRoles,
    suspendedMemberships: membershipsResult.suspended,
    skippedMemberships: membershipsResult.skipped,
    migratedInvites: invitesResult.migrated,
    skippedInvites: invitesResult.skipped,
    updatedProfiles,
  } as MigrationStats;
}
