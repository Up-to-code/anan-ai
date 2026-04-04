import { assertBrokerSession, requireBrokerSession } from "@/server/auth/guards";
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
import { convexBrokerZoneRepository, type BrokerZoneRepository } from "@/server/infrastructure/convex/properties/brokerZone";
import { convexCrmRepository, type CrmRepository } from "@/server/infrastructure/convex/deals/crm";

type BrokerCrmDependencies = {
  requireBroker: () => Promise<ResolvedSession>;
  crmRepository: CrmRepository;
  propertiesRepository: Pick<BrokerZoneRepository, "getProperty">;
};

const defaultDependencies: BrokerCrmDependencies = {
  requireBroker: requireBrokerSession,
  crmRepository: convexCrmRepository,
  propertiesRepository: convexBrokerZoneRepository,
};

async function requireBrokerOwner(dependencies: Pick<BrokerCrmDependencies, "requireBroker">) {
  const session = assertBrokerSession(await dependencies.requireBroker());
  const brokerId = session.context.brokerId;
  if (!brokerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Broker profile required", status: 403 });
  }
  return { brokerId, authUserId: session.context.userId };
}

async function requireOwnedProperty(
  propertyId: string,
  dependencies: BrokerCrmDependencies,
) {
  const session = assertBrokerSession(await dependencies.requireBroker());
  const brokerId = session.context.brokerId;
  if (!brokerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Broker profile required", status: 403 });
  }
  const property = await dependencies.propertiesRepository.getProperty(session.token, propertyId);
  if (!property || property.brokerId !== brokerId) {
    throw new DomainError({
      code: "FORBIDDEN",
      message: "Cannot access this property",
      status: 403,
    });
  }
}

async function requireOwnedDeal(
  dealId: string,
  dependencies: BrokerCrmDependencies,
) {
  const { brokerId } = await requireBrokerOwner(dependencies);
  const deal = await dependencies.crmRepository.getById(dealId);
  if (!deal) {
    throw new DomainError({ code: "NOT_FOUND", message: "Deal not found", status: 404 });
  }
  if (deal.brokerId !== brokerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this deal", status: 403 });
  }
  return deal;
}

export async function listBrokerDeals(
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<DealSummary[]> {
  const { brokerId } = await requireBrokerOwner(dependencies);
  return dependencies.crmRepository.listByBrokerId(brokerId);
}

export async function listBrokerDealsPage(
  input: { paginationOpts: { cursor: string | null; numItems: number } },
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<PaginatedDealsResult> {
  const { brokerId } = await requireBrokerOwner(dependencies);
  return dependencies.crmRepository.listPageByBrokerId(brokerId, input.paginationOpts);
}

export async function listBrokerCrmClients(
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<DealSelectorClient[]> {
  const { brokerId } = await requireBrokerOwner(dependencies);
  return dependencies.crmRepository.listClientsByBrokerId(brokerId);
}

export async function listBrokerCrmBrokers(
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<DealSelectorBroker[]> {
  const { brokerId } = await requireBrokerOwner(dependencies);
  const brokers = await dependencies.crmRepository.listBrokerSelectorOptions();
  return brokers.filter((broker) => broker.id === brokerId);
}

export async function listBrokerDealsByProperty(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<DealSummary[]> {
  const parsed = propertyDealsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid property id", status: 400 });
  }
  await requireOwnedProperty(parsed.data.propertyId, dependencies);
  return dependencies.crmRepository.listByPropertyId(parsed.data.propertyId);
}

export async function createBrokerDeal(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<string> {
  const parsed = createDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid deal payload", status: 400 });
  }
  if (parsed.data.propertyId) {
    await requireOwnedProperty(parsed.data.propertyId, dependencies);
  }
  if (parsed.data.crmClientId) {
    const { brokerId } = await requireBrokerOwner(dependencies);
    const ownedClient = await dependencies.crmRepository.listClientsByBrokerId(brokerId);
    if (!ownedClient.some((entry) => entry.id === parsed.data.crmClientId)) {
      throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this client", status: 403 });
    }
  }
  const { brokerId, authUserId } = await requireBrokerOwner(dependencies);
  return dependencies.crmRepository.create({
    brokerId,
    lastUpdatedBy: authUserId,
    input: parsed.data,
  });
}

export async function updateBrokerDealStage(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealStageInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid stage payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.updateStage({ ...parsed.data, lastUpdatedBy: authUserId });
}

/**
 * WHY:   Broker CRM edit screens need one owner-checked path for full deal updates.
 * WHAT:  Updates the mutable fields of one broker-owned deal.
 * HOW:   Validates payload shape, confirms deal ownership, validates any linked property, then persists through the repository.
 */
export async function updateBrokerDeal(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
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
    const { brokerId } = await requireBrokerOwner(dependencies);
    const ownedClient = await dependencies.crmRepository.listClientsByBrokerId(brokerId);
    if (!ownedClient.some((entry) => entry.id === parsed.data.crmClientId)) {
      throw new DomainError({ code: "FORBIDDEN", message: "Cannot access this client", status: 403 });
    }
  }
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.update({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function updateBrokerDealNotes(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealNotesInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid notes payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.updateNotes({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function updateBrokerDealFollowUp(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = updateDealFollowUpInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid follow-up payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.updateFollowUp({ ...parsed.data, lastUpdatedBy: authUserId });
}

export async function addBrokerDealDocument(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = addDealDocumentInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid document payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.addDocument({ ...parsed.data, lastUpdatedBy: authUserId });
}

/**
 * WHY:   Broker CRM should archive deals without destructive deletes so historical reporting stays intact.
 * WHAT:  Soft-archives one broker-owned deal.
 * HOW:   Verifies ownership first, then stores archive metadata through the repository.
 */
export async function archiveBrokerDeal(
  input: unknown,
  dependencies: BrokerCrmDependencies = defaultDependencies,
): Promise<void> {
  const parsed = archiveDealInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({ code: "INVALID_ARGUMENT", message: parsed.error.issues[0]?.message ?? "Invalid archive payload", status: 400 });
  }
  await requireOwnedDeal(parsed.data.dealId, dependencies);
  const { authUserId } = await requireBrokerOwner(dependencies);
  await dependencies.crmRepository.archive({
    ...parsed.data,
    archivedAt: Date.now(),
    lastUpdatedBy: authUserId,
  });
}
