import {
  addBrokerDealDocument,
  archiveBrokerDeal,
  createBrokerDeal,
  listBrokerCrmBrokers,
  listBrokerCrmClients,
  listBrokerDeals,
  listBrokerDealsPage,
  updateBrokerDeal,
  updateBrokerDealFollowUp,
  updateBrokerDealNotes,
  updateBrokerDealStage,
} from "@/server/domains/workspace/crm/broker";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexBrokerZoneRepository } from "@/server/infrastructure/convex/properties/brokerZone";
import { convexCrmRepository } from "@/server/infrastructure/convex/deals/crm";
import { convexRedZoneRepository } from "@/server/infrastructure/convex/properties/redZone";
import {
  addRedDealDocument,
  archiveRedDeal,
  createRedDeal,
  listRedCrmBrokers,
  listRedCrmClients,
  listRedDeals,
  listRedDealsPage,
  updateRedDeal,
  updateRedDealFollowUp,
  updateRedDealNotes,
  updateRedDealStage,
} from "@/server/domains/workspace/crm/developer";
import { createUnavailableZoneError } from "../shared/errors";
import { buildWorkspaceScopedSessionResolver } from "../session";

/**
 * WHY:   CRM routes should delegate audience-specific deal behavior from one workspace-owned orchestration layer.
 * WHAT:  Returns the current audience's deal read/write handlers.
 * HOW:   Builds a workspace-scoped session resolver, then wires the broker or developer CRM service dependencies.
 */
export function getWorkspaceCrmZone(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
) {
  const requireSession = buildWorkspaceScopedSessionResolver(audience, ownerContext);

  if (audience === "broker") {
    return {
      listDeals: () =>
        listBrokerDeals({
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      listDealsPage: (input: Parameters<typeof listBrokerDealsPage>[0]) =>
        listBrokerDealsPage(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      listClients: () =>
        listBrokerCrmClients({
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      listBrokers: () =>
        listBrokerCrmBrokers({
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      createDeal: (input: Parameters<typeof createBrokerDeal>[0]) =>
        createBrokerDeal(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      updateDeal: (input: Parameters<typeof updateBrokerDeal>[0]) =>
        updateBrokerDeal(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      updateDealStage: (input: Parameters<typeof updateBrokerDealStage>[0]) =>
        updateBrokerDealStage(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      updateDealNotes: (input: Parameters<typeof updateBrokerDealNotes>[0]) =>
        updateBrokerDealNotes(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      updateDealFollowUp: (input: Parameters<typeof updateBrokerDealFollowUp>[0]) =>
        updateBrokerDealFollowUp(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      addDealDocument: (input: Parameters<typeof addBrokerDealDocument>[0]) =>
        addBrokerDealDocument(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
      archiveDeal: (input: Parameters<typeof archiveBrokerDeal>[0]) =>
        archiveBrokerDeal(input, {
          requireBroker: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexBrokerZoneRepository,
        }),
    };
  }

  if (audience === "developer") {
    return {
      listDeals: () =>
        listRedDeals({
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      listDealsPage: (input: Parameters<typeof listRedDealsPage>[0]) =>
        listRedDealsPage(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      listClients: () =>
        listRedCrmClients({
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      listBrokers: () =>
        listRedCrmBrokers({
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      createDeal: (input: Parameters<typeof createRedDeal>[0]) =>
        createRedDeal(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      updateDeal: (input: Parameters<typeof updateRedDeal>[0]) =>
        updateRedDeal(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      updateDealStage: (input: Parameters<typeof updateRedDealStage>[0]) =>
        updateRedDealStage(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      updateDealNotes: (input: Parameters<typeof updateRedDealNotes>[0]) =>
        updateRedDealNotes(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      updateDealFollowUp: (input: Parameters<typeof updateRedDealFollowUp>[0]) =>
        updateRedDealFollowUp(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      addDealDocument: (input: Parameters<typeof addRedDealDocument>[0]) =>
        addRedDealDocument(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
      archiveDeal: (input: Parameters<typeof archiveRedDeal>[0]) =>
        archiveRedDeal(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
    };
  }

  throw createUnavailableZoneError("CRM");
}
