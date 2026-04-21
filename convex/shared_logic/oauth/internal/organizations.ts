import { ConvexError, type GenericId } from "convex/values";
import { tenants } from "../../../tenants";
import {
  findProfileByAuthUserId,
  findTenantOrgLinkByTenantOrgId,
  getOrganizationRecord,
  resolveOwnerContextFromProfile,
  type AgenciesRepositoryCtx,
  type OwnerContext,
} from "../../agencies/repositories/core";

export type OAuthEligibleOrganization = {
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  ownerId: string;
  organizationType: "broker" | "red";
  organizationName: string;
  organizationSlug?: string;
  role: "manager" | "member" | "viewer";
};

function normalizeTenantRole(role?: string): OAuthEligibleOrganization["role"] {
  if (role === "owner" || role === "admin" || role === "manager") return "manager";
  if (role === "viewer") return "viewer";
  return "member";
}

function buildTargetFromOwner(args: {
  owner: OwnerContext;
  ownerRecord: { name?: string; slug?: string } | null;
  role: OAuthEligibleOrganization["role"];
}): OAuthEligibleOrganization {
  return {
    tenantOrgId: args.owner.tenantOrgId ?? "",
    ownerType: args.owner.ownerType,
    ownerBrokerId: args.owner.ownerType === "broker" ? args.owner.ownerBrokerId : undefined,
    ownerREDId: args.owner.ownerType === "RED" ? args.owner.ownerREDId : undefined,
    ownerId: String(args.owner.ownerType === "broker" ? args.owner.ownerBrokerId : args.owner.ownerREDId),
    organizationType: args.owner.ownerType === "broker" ? "broker" : "red",
    organizationName: args.ownerRecord?.name ?? "Organization",
    organizationSlug: args.ownerRecord?.slug,
    role: args.role,
  };
}

async function buildTargetFromTenantOrganization(
  ctx: AgenciesRepositoryCtx,
  authUserId: string,
  tenantOrg: { _id: string },
): Promise<OAuthEligibleOrganization | null> {
  const link = await findTenantOrgLinkByTenantOrgId(ctx, tenantOrg._id);
  if (!link) return null;

  const owner =
    link.ownerType === "broker"
      ? {
          ownerType: "broker" as const,
          ownerBrokerId: link.ownerBrokerId!,
          authUserId,
          tenantOrgId: link.tenantOrgId,
        }
      : {
          ownerType: "RED" as const,
          ownerREDId: link.ownerREDId!,
          authUserId,
          tenantOrgId: link.tenantOrgId,
        };

  const [ownerRecord, member] = await Promise.all([
    getOrganizationRecord(ctx, owner),
    tenants.getMember(ctx as never, tenantOrg._id, authUserId),
  ]);
  if (!member || (member.status ?? "active") !== "active") {
    return null;
  }

  return buildTargetFromOwner({
    owner,
    ownerRecord,
    role: normalizeTenantRole(member.role),
  });
}

/**
 * WHY:   Organization-owned OAuth approval needs the caller's tenant-backed org choices instead of a single user profile.
 * WHAT:  Lists all active organizations the current auth user can use for OAuth consent.
 * HOW:   Reads tenant memberships first, then falls back to the profile-linked owner context during migration.
 */
export async function listOAuthEligibleOrganizationsForAuthUser(
  ctx: AgenciesRepositoryCtx,
  authUserId: string,
): Promise<OAuthEligibleOrganization[]> {
  const profile = await findProfileByAuthUserId(ctx, authUserId);
  if (!profile || profile.isActive === false) {
    return [];
  }

  const tenantOrganizations = await tenants.listOrganizations(ctx as never, authUserId);
  const tenantTargets = await Promise.all(
    tenantOrganizations.map((organization) => buildTargetFromTenantOrganization(ctx, authUserId, organization)),
  );
  const hydratedTargets = tenantTargets.filter(
    (target): target is NonNullable<typeof target> => Boolean(target?.tenantOrgId),
  );
  if (hydratedTargets.length > 0) {
    return hydratedTargets;
  }

  try {
    const owner = await resolveOwnerContextFromProfile(ctx, profile);
    if (!owner.tenantOrgId) return [];
    const [ownerRecord, member] = await Promise.all([
      getOrganizationRecord(ctx, owner),
      tenants.getMember(ctx as never, owner.tenantOrgId, authUserId),
    ]);
    if (!member || (member.status ?? "active") !== "active") {
      return [];
    }
    return [
      buildTargetFromOwner({
        owner,
        ownerRecord,
        role: normalizeTenantRole(member.role),
      }),
    ];
  } catch {
    return [];
  }
}

/**
 * WHY:   Consent prompts and approval actions must resolve one explicit org target before checking grant state.
 * WHAT:  Returns the selected org target or the only available org when the caller has exactly one option.
 * HOW:   Loads the current auth user's eligible org list and matches by tenant org id.
 */
export async function resolveSelectedOAuthOrganization(
  ctx: AgenciesRepositoryCtx,
  authUserId: string,
  selectedTenantOrgId?: string,
): Promise<{
  organizations: OAuthEligibleOrganization[];
  selectedOrganization: OAuthEligibleOrganization | null;
}> {
  const organizations = await listOAuthEligibleOrganizationsForAuthUser(ctx, authUserId);
  const selectedOrganization = selectedTenantOrgId
    ? organizations.find((organization) => organization.tenantOrgId === selectedTenantOrgId) ?? null
    : organizations.length === 1
      ? organizations[0]!
      : null;
  return { organizations, selectedOrganization };
}

/**
 * WHY:   Approval writes must fail loudly when the submitted target org is not one of the caller's active memberships.
 * WHAT:  Returns the requested target org for the current auth user.
 * HOW:   Resolves the caller's eligible org list and throws when the tenant org id is missing or invalid.
 */
export async function requireSelectedOAuthOrganization(
  ctx: AgenciesRepositoryCtx,
  authUserId: string,
  selectedTenantOrgId: string,
): Promise<OAuthEligibleOrganization> {
  const { selectedOrganization } = await resolveSelectedOAuthOrganization(ctx, authUserId, selectedTenantOrgId);
  if (!selectedOrganization) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Organization selection is required" });
  }
  return selectedOrganization;
}
