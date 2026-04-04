import { assertDeveloperSession, requireDeveloperSession } from "@/server/auth/guards";
import type { ResolvedSession } from "@/server/auth/session";
import {
  addDealDocumentInputSchema,
  archiveDealInputSchema,
  createDealInputSchema,
  type DealSelectorBroker,
  type DealSelectorClient,
  type DealSummary,
  type PaginatedDealsResult,
  propertyDealsInputSchema,
  updateDealInputSchema,
  updateDealFollowUpInputSchema,
  updateDealNotesInputSchema,
  updateDealStageInputSchema,
} from "@/server/contracts/deals";
import { DomainError } from "@/server/contracts/errors";
import { convexCrmRepository, type CrmRepository } from "@/server/infrastructure/convex/deals/crm";
import { convexRedZoneRepository, type RedZoneRepository } from "@/server/infrastructure/convex/properties/redZone";

type RedCrmDependencies = {
  requireDeveloper: () => Promise<ResolvedSession>;
  crmRepository: CrmRepository;
  propertiesRepository: Pick<RedZoneRepository, "getProperty">;
};

const defaultDependencies: RedCrmDependencies = {
  requireDeveloper: requireDeveloperSession,
  crmRepository: convexCrmRepository,
  propertiesRepository: convexRedZoneRepository,
};

async function requireRedOwner(dependencies: Pick<RedCrmDependencies, "requireDeveloper">) {
  const session = assertDeveloperSession(await dependencies.requireDeveloper());
  const redId = session.context.redId;
  if (!redId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Developer profile required", status: 403 });
  }
  return { redId, authUserId: session.context.userId };
}

async function requireOwnedProperty(propertyId: string, dependencies: RedCrmDependencies) {
  const session = assertDeveloperSession(await dependencies.requireDeveloper());
  const redId = session.context.redId;
  if (!redId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Developer profile required", status: 403 });
  }
  const property = await dependencies.propertiesRepository.getProperty(session.token, propertyId);
  if (!property || property.REDId !== redId) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Cannot access this property",
      status: 403,
    });
  }
}

async function requireOwnedDeal(dealId: string, dependencies: RedCrmDependencies) {
  const { redId } = await requireRedOwner(dependencies);
  const deal = await dependencies.crmRepository.getById(dealId);
  if (!deal) {
    throw new DomainError({ code: "NOT_FOUND", message: "Deal not found", status: 404 });
  }
  if (deal.redId !== redId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this deal", status: 403 });
  }
  return deal;
}

export async function listRedDeals(
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<DealSummary[]> {
  const { redId } = await requireRedOwner(dependencies);
  return dependencies.crmRepository.listByRedId(redId);
}

export async function listRedDealsPage(
  input: { paginationOpts: { cursor: string | null; numItems: number } },
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<PaginatedDealsResult> {
  const { redId } = await requireRedOwner(dependencies);
  return dependencies.crmRepository.listPageByRedId(redId, input.paginationOpts);
}

export async function listRedCrmClients(
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<DealSelectorClient[]> {
  const { redId } = await requireRedOwner(dependencies);
  return dependencies.crmRepository.listClientsByRedId(redId);
}

export async function listRedCrmBrokers(
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<DealSelectorBroker[]> {
  await requireRedOwner(dependencies);
  return dependencies.crmRepository.listBrokerSelectorOptions();
}

export async function listRedDealsByProperty(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<DealSummary[]> {
  const parsed = propertyDealsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid property id", status: 400 });
  }
  await requireOwnedProperty(parsed.data.propertyId, dependencies);
  return dependencies.crmRepository.listByPropertyId(parsed.data.propertyId);
}

export async function createRedDeal(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<string> {
  const parsed = createDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid deal payload", status: 400 });
  }
  if (parsed.data.propertyId) {
    await requireOwnedProperty(parsed.data.propertyId, dependencies);
  }
  if (parsed.data.crmClientId) {
    const client = await dependencies.crmRepository.getClientById(parsed.data.crmClientId);
    const { redId } = await requireRedOwner(dependencies);
    if (!client) {
      throw new DomainError({ code: "NOT_FOUND", message: "Client not found", status: 404 });
    }
    const ownedClient = await dependencies.crmRepository.listClientsByRedId(redId);
    if (!ownedClient.some((entry) => entry.id === parsed.data.crmClientId)) {
      throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this client", status: 403 });
    }
  }
  const { redId, authUserId } = await requireRedOwner(dependencies);
  return dependencies.crmRepository.create({
    redId,
    lastUpdatedBy: authUserId,
    input: parsed.data,
  });
}

export async function updateRedDealStage(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealStageInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid stage payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.updateStage({ ...parsed.data, lastUpdatedBy: authUserId });
}

/**
 * WHY:   Developer CRM edit screens need one owner-checked path for full deal updates.
 * WHAT:  Updates the mutable fields of one developer-owned deal.
 * HOW:   Validates payload shape, confirms deal ownership, validates any linked property, then persists through the repository.
 */
export async function updateRedDeal(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid deal payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  if (parsed.data.propertyId) {
    await requireOwnedProperty(parsed.data.propertyId, dependencies);
  }
  if (parsed.data.crmClientId) {
    const { redId } = await requireRedOwner(dependencies);
    const ownedClient = await dependencies.crmRepository.listClientsByRedId(redId);
    if (!ownedClient.some((entry) => entry.id === parsed.data.crmClientId)) {
      throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this client", status: 403 });
    }
  }
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.update({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function updateRedDealNotes(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealNotesInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid notes payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.updateNotes({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function updateRedDealFollowUp(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealFollowUpInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid follow-up payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.updateFollowUp({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function addRedDealDocument(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = addDealDocumentInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid document payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.addDocument({ ...parsed.data, lastUpdatedBy: authUserId });
}

/**
 * WHY:   Developer CRM should archive deals without destructive deletes so historical reporting stays intact.
 * WHAT:  Soft-archives one developer-owned deal.
 * HOW:   Verifies ownership first, then stores archive metadata through the repository.
 */
export async function archiveRedDeal(
  input: unknown,
  dependencies: RedCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = archiveDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid archive payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireRedOwner(dependencies);
  await dependencies.crmRepository.archive({
    ...parsed.data,
    archivedAt: Date.now(),
    lastUpdatedBy: authUserId,
  });
}
