import { assertBrokerSession, requireBrokerSession } from "@/server/auth/guards";
import { type ResolvedSession, requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import {
  createOrganizationInviteInputSchema,
  type OrganizationInviteSummary,
  type OrganizationSummary,
  type OrganizationTeamMember,
} from "@/server/contracts/organizations";
import {
  convexOrganizationsRepository,
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizationsRepository";

type BrokerOrganizationsDependencies = {
  requireBroker: () => Promise<ResolvedSession>;
  requireSession: () => Promise<ResolvedSession>;
  repository: OrganizationsRepository;
};

const defaultDependencies: BrokerOrganizationsDependencies = {
  requireBroker: requireBrokerSession,
  requireSession: requireSessionContext,
  repository: convexOrganizationsRepository,
};

async function getBrokerOwnerContext(
  dependencies: Pick<BrokerOrganizationsDependencies, "requireBroker">,
) : Promise<{ session: ResolvedSession; ownerType: "broker"; ownerId: string }> {
  const session = assertBrokerSession(await dependencies.requireBroker());
  const ownerId = session.context.brokerId;
  if (!ownerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Broker profile required", status: 403 });
  }
  return { session, ownerType: "broker", ownerId };
}

/**
 * WHY:   Broker workspace flows should read organizations through a broker-owned server entrypoint.
 * WHAT:  Returns broker-linked organizations for the current authenticated broker.
 * HOW:   Requires a broker session, then lists organizations by current auth user id.
 */
export async function listBrokerOrganizations(
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<OrganizationSummary[]> {
  const { session } = await getBrokerOwnerContext(dependencies);
  return dependencies.repository.listForCurrentUser(session.token);
}

/**
 * WHY:   Broker organization creation should be explicit and server-owned.
 * WHAT:  Creates the current user's broker organization.
 * HOW:   Requires an authenticated session, then delegates a broker-typed create to the repository.
 */
export async function createBrokerOrganization(
  input: { name: string },
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<OrganizationSummary> {
  const session = await dependencies.requireSession();
  return dependencies.repository.createForCurrentUser(session.token, { name: input.name, type: "broker" });
}

export async function listBrokerTeamMembers(
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<OrganizationTeamMember[]> {
  const { session } = await getBrokerOwnerContext(dependencies);
  return dependencies.repository.listCurrentTeamMembers(session.token);
}

export async function listBrokerTeamInvites(
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<OrganizationInviteSummary[]> {
  const { session } = await getBrokerOwnerContext(dependencies);
  return dependencies.repository.listCurrentTeamInvites(session.token);
}

export async function createBrokerTeamInvite(
  input: unknown,
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<string> {
  const parsed = createOrganizationInviteInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid invite payload",
      status: 400,
    });
  }
  const { session } = await getBrokerOwnerContext(dependencies);
  return dependencies.repository.createCurrentTeamInvite(session.token, parsed.data);
}

export async function cancelBrokerTeamInvite(
  input: { inviteId: string },
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<void> {
  const { session } = await getBrokerOwnerContext(dependencies);
  await dependencies.repository.cancelCurrentTeamInvite(session.token, input.inviteId);
}

export async function acceptBrokerTeamInvite(
  input: { token: string },
  dependencies: BrokerOrganizationsDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireSession();
  await dependencies.repository.acceptCurrentTeamInvite(session.token, input.token);
}
