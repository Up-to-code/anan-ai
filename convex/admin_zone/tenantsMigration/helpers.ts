import type { Doc } from "../../_generated/dataModel";
import { tenants } from "../../tenants";

export type OwnerKey = `broker:${string}` | `red:${string}`;

function buildOwnerKey(ownerType: "broker" | "red", ownerId: string): OwnerKey {
  return `${ownerType}:${ownerId}` as OwnerKey;
}

export function resolveOwnerKeyFromMembership(
  membership: Doc<"organizationMemberships">,
): OwnerKey | null {
  if (membership.ownerBrokerId) return buildOwnerKey("broker", String(membership.ownerBrokerId));
  if (membership.ownerREDId) return buildOwnerKey("red", String(membership.ownerREDId));
  return null;
}

export function resolveOwnerKeyFromInvite(invite: Doc<"teamInvites">): OwnerKey | null {
  if (invite.ownerBrokerId) return buildOwnerKey("broker", String(invite.ownerBrokerId));
  if (invite.ownerREDId) return buildOwnerKey("red", String(invite.ownerREDId));
  return null;
}

export function resolveOwnerKeyFromProfile(profile: Doc<"userProfiles">): OwnerKey | null {
  if (profile.brokerId) return buildOwnerKey("broker", String(profile.brokerId));
  if (profile.REDId) return buildOwnerKey("red", String(profile.REDId));
  return null;
}

export function pickActorAuthUserId(options: {
  ownerProfiles: Doc<"userProfiles">[];
  ownerMemberships: Doc<"organizationMemberships">[];
}) {
  const ownerProfile = options.ownerProfiles.find((profile) => profile.isActive !== false);
  if (ownerProfile?.authUserId) return ownerProfile.authUserId;

  const managerMembership = options.ownerMemberships.find(
    (membership) => membership.role === "manager",
  );
  if (managerMembership?.authUserId) return managerMembership.authUserId;

  return options.ownerMemberships[0]?.authUserId ?? null;
}

export async function createTenantOrgWithFallbackSlug(args: {
  ctx: Parameters<typeof tenants.createOrganization>[0];
  actorAuthUserId: string;
  name: string;
  slug: string;
  metadata: Record<string, string>;
  dryRun: boolean;
}) {
  if (args.dryRun) {
    return `dryrun-${crypto.randomUUID()}`;
  }

  try {
    return await tenants.createOrganization(args.ctx as never, args.actorAuthUserId, args.name, {
      slug: args.slug,
      metadata: args.metadata,
    });
  } catch {
    return await tenants.createOrganization(args.ctx as never, args.actorAuthUserId, args.name, {
      slug: `${args.slug}-${crypto.randomUUID().slice(0, 6)}`,
      metadata: args.metadata,
    });
  }
}

export function buildOwnerKeyFromEntity(ownerType: "broker" | "red", ownerId: string): OwnerKey {
  return buildOwnerKey(ownerType, ownerId);
}

export function mapLinksByOwner(links: Doc<"tenantOrgLinks">[]) {
  const linksByOwner = new Map<OwnerKey, Doc<"tenantOrgLinks">>();
  for (const link of links) {
    if (link.ownerBrokerId) {
      linksByOwner.set(buildOwnerKey("broker", String(link.ownerBrokerId)), link);
      continue;
    }
    if (link.ownerREDId) {
      linksByOwner.set(buildOwnerKey("red", String(link.ownerREDId)), link);
    }
  }
  return linksByOwner;
}

export function mapProfilesByOwner(profiles: Doc<"userProfiles">[]) {
  const profilesByOwner = new Map<OwnerKey, Doc<"userProfiles">[]>();
  for (const profile of profiles) {
    const ownerKey = resolveOwnerKeyFromProfile(profile);
    if (!ownerKey) continue;
    const list = profilesByOwner.get(ownerKey) ?? [];
    list.push(profile);
    profilesByOwner.set(ownerKey, list);
  }
  return profilesByOwner;
}

export function mapMembershipsByOwner(memberships: Doc<"organizationMemberships">[]) {
  const membershipsByOwner = new Map<OwnerKey, Doc<"organizationMemberships">[]>();
  for (const membership of memberships) {
    const ownerKey = resolveOwnerKeyFromMembership(membership);
    if (!ownerKey) continue;
    const list = membershipsByOwner.get(ownerKey) ?? [];
    list.push(membership);
    membershipsByOwner.set(ownerKey, list);
  }
  return membershipsByOwner;
}

export function mapMembershipsByAuthUserId(memberships: Doc<"organizationMemberships">[]) {
  const membershipsByAuthUserId = new Map<string, Doc<"organizationMemberships">[]>();
  for (const membership of memberships) {
    const list = membershipsByAuthUserId.get(membership.authUserId) ?? [];
    list.push(membership);
    membershipsByAuthUserId.set(membership.authUserId, list);
  }
  return membershipsByAuthUserId;
}
