import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { requireRole } from "../_core/security/accessPolicy";
import { tenants } from "../tenants";
import {
  buildOwnerKeyFromEntity,
  createTenantOrgWithFallbackSlug,
  mapLinksByOwner,
  mapMembershipsByAuthUserId,
  mapMembershipsByOwner,
  mapProfilesByOwner,
  type OwnerKey,
  pickActorAuthUserId,
  resolveOwnerKeyFromInvite,
  resolveOwnerKeyFromMembership,
  resolveOwnerKeyFromProfile,
} from "./tenantsMigration/helpers";

/**
 * WHY:   The workspace is moving to convex-tenants as the primary org system.
 * WHAT:  Migrates legacy brokers/REDs, memberships, and invites into tenants + tenantOrgLinks.
 * HOW:   Creates tenant orgs, maps memberships/invites, and backfills currentTenantOrgId.
 */
export const migrateTenantsFromLegacy = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const dryRun = Boolean(args.dryRun);

    const [brokers, reds, profiles, memberships, invites, tenantOrgLinks] = await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("organizationMemberships").collect(),
      ctx.db.query("teamInvites").collect(),
      ctx.db.query("tenantOrgLinks").collect(),
    ]);

    const linksByOwner = mapLinksByOwner(tenantOrgLinks);
    const profilesByOwner = mapProfilesByOwner(profiles);
    const membershipsByOwner = mapMembershipsByOwner(memberships);

    const actorByOwner = new Map<OwnerKey, string>();
    for (const [ownerKey, ownerProfiles] of profilesByOwner.entries()) {
      const ownerMemberships = membershipsByOwner.get(ownerKey) ?? [];
      const actorId = pickActorAuthUserId({ ownerProfiles, ownerMemberships });
      if (actorId) actorByOwner.set(ownerKey, actorId);
    }
    for (const [ownerKey, ownerMemberships] of membershipsByOwner.entries()) {
      if (actorByOwner.has(ownerKey)) continue;
      const actorId = pickActorAuthUserId({ ownerProfiles: [], ownerMemberships });
      if (actorId) actorByOwner.set(ownerKey, actorId);
    }

    let createdTenantOrgs = 0;
    let skippedTenantOrgs = 0;
    const tenantOrgIdByOwner = new Map<OwnerKey, string>();

    for (const broker of brokers) {
      const ownerKey = buildOwnerKeyFromEntity("broker", String(broker._id));
      const existingLink = linksByOwner.get(ownerKey);
      if (existingLink?.tenantOrgId) {
        tenantOrgIdByOwner.set(ownerKey, existingLink.tenantOrgId);
        continue;
      }

      const actorAuthUserId = actorByOwner.get(ownerKey);
      if (!actorAuthUserId) {
        skippedTenantOrgs += 1;
        continue;
      }

      const tenantOrgId = await createTenantOrgWithFallbackSlug({
        ctx,
        actorAuthUserId,
        name: broker.name,
        slug: broker.slug,
        metadata: {
          ownerType: "broker",
          ownerBrokerId: String(broker._id),
        },
        dryRun,
      });

      if (!dryRun) {
        await ctx.db.insert("tenantOrgLinks", {
          tenantOrgId,
          ownerType: "broker",
          ownerBrokerId: broker._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      createdTenantOrgs += 1;
      tenantOrgIdByOwner.set(ownerKey, tenantOrgId);
    }

    for (const red of reds) {
      const ownerKey = buildOwnerKeyFromEntity("red", String(red._id));
      const existingLink = linksByOwner.get(ownerKey);
      if (existingLink?.tenantOrgId) {
        tenantOrgIdByOwner.set(ownerKey, existingLink.tenantOrgId);
        continue;
      }

      const actorAuthUserId = actorByOwner.get(ownerKey);
      if (!actorAuthUserId) {
        skippedTenantOrgs += 1;
        continue;
      }

      const tenantOrgId = await createTenantOrgWithFallbackSlug({
        ctx,
        actorAuthUserId,
        name: red.name,
        slug: red.slug,
        metadata: {
          ownerType: "RED",
          ownerREDId: String(red._id),
        },
        dryRun,
      });

      if (!dryRun) {
        await ctx.db.insert("tenantOrgLinks", {
          tenantOrgId,
          ownerType: "RED",
          ownerREDId: red._id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      createdTenantOrgs += 1;
      tenantOrgIdByOwner.set(ownerKey, tenantOrgId);
    }

    let migratedMemberships = 0;
    let updatedMembershipRoles = 0;
    let suspendedMemberships = 0;
    let skippedMemberships = 0;

    for (const membership of memberships) {
      const ownerKey = resolveOwnerKeyFromMembership(membership);
      if (!ownerKey) {
        skippedMemberships += 1;
        continue;
      }

      const tenantOrgId = tenantOrgIdByOwner.get(ownerKey) ?? linksByOwner.get(ownerKey)?.tenantOrgId;
      if (!tenantOrgId) {
        skippedMemberships += 1;
        continue;
      }

      const actorAuthUserId = actorByOwner.get(ownerKey) ?? membership.invitedBy ?? membership.authUserId;
      if (!actorAuthUserId) {
        skippedMemberships += 1;
        continue;
      }

      const existingMember = await tenants.getMember(ctx as never, tenantOrgId, membership.authUserId);
      if (!existingMember) {
        if (!dryRun) {
          await tenants.addMember(ctx as never, actorAuthUserId, tenantOrgId, membership.authUserId, membership.role);
        }
        migratedMemberships += 1;
      } else if (existingMember.role !== membership.role && existingMember.role !== "owner") {
        if (!dryRun) {
          await tenants.updateMemberRole(ctx as never, actorAuthUserId, tenantOrgId, membership.authUserId, membership.role);
        }
        updatedMembershipRoles += 1;
      }

      if (membership.status === "inactive" && (!existingMember || (existingMember.status ?? "active") !== "suspended")) {
        if (!dryRun) {
          await tenants.suspendMember(ctx as never, actorAuthUserId, tenantOrgId, membership.authUserId);
        }
        suspendedMemberships += 1;
      }
    }

    let migratedInvites = 0;
    let skippedInvites = 0;
    const invitesByOrg = new Map<string, Awaited<ReturnType<typeof tenants.listInvitations>>>();

    for (const invite of invites) {
      const ownerKey = resolveOwnerKeyFromInvite(invite);
      if (!ownerKey) {
        skippedInvites += 1;
        continue;
      }

      if (invite.status !== "pending" || invite.expiresAt < Date.now()) {
        skippedInvites += 1;
        continue;
      }

      const tenantOrgId = tenantOrgIdByOwner.get(ownerKey) ?? linksByOwner.get(ownerKey)?.tenantOrgId;
      if (!tenantOrgId) {
        skippedInvites += 1;
        continue;
      }

      const actorAuthUserId = actorByOwner.get(ownerKey) ?? invite.invitedBy;
      if (!actorAuthUserId) {
        skippedInvites += 1;
        continue;
      }

      const orgInvites = invitesByOrg.get(tenantOrgId) ?? await tenants.listInvitations(ctx as never, tenantOrgId);
      invitesByOrg.set(tenantOrgId, orgInvites);

      const normalizedEmail = invite.email.trim().toLowerCase();
      const existingPending = orgInvites.find(
        (existing) => existing.status === "pending" && existing.inviteeIdentifier.toLowerCase() === normalizedEmail,
      );
      if (existingPending) {
        skippedInvites += 1;
        continue;
      }

      if (!dryRun) {
        const result = await tenants.inviteMember(ctx as never, actorAuthUserId, tenantOrgId, normalizedEmail, invite.role, {
          expiresAt: invite.expiresAt,
        });
        orgInvites.push({
          _id: result.invitationId,
          organizationId: tenantOrgId,
          inviteeIdentifier: normalizedEmail,
          role: invite.role,
          status: "pending",
          expiresAt: invite.expiresAt,
        } as typeof orgInvites[number]);
      }

      migratedInvites += 1;
    }

    let updatedProfiles = 0;
    const membershipsByAuthUserId = mapMembershipsByAuthUserId(memberships);

    for (const profile of profiles) {
      if (profile.currentTenantOrgId) continue;

      const ownerKey = resolveOwnerKeyFromProfile(profile);
      const tenantOrgId = ownerKey
        ? tenantOrgIdByOwner.get(ownerKey) ?? linksByOwner.get(ownerKey)?.tenantOrgId
        : null;

      let resolvedTenantOrgId = tenantOrgId;
      if (!resolvedTenantOrgId) {
        const memberList = membershipsByAuthUserId.get(profile.authUserId) ?? [];
        const candidate = memberList.find((member) => member.status === "active") ?? memberList[0];
        if (candidate) {
          const candidateOwnerKey = resolveOwnerKeyFromMembership(candidate);
          resolvedTenantOrgId = candidateOwnerKey
            ? tenantOrgIdByOwner.get(candidateOwnerKey) ?? linksByOwner.get(candidateOwnerKey)?.tenantOrgId ?? null
            : null;
        }
      }

      if (!resolvedTenantOrgId) continue;
      updatedProfiles += 1;
      if (!dryRun) {
        await ctx.db.patch(profile._id, {
          currentTenantOrgId: resolvedTenantOrgId,
          updatedAt: Date.now(),
        });
      }
    }

    return {
      dryRun,
      createdTenantOrgs,
      skippedTenantOrgs,
      migratedMemberships,
      updatedMembershipRoles,
      suspendedMemberships,
      skippedMemberships,
      migratedInvites,
      skippedInvites,
      updatedProfiles,
    } as const;
  },
});
