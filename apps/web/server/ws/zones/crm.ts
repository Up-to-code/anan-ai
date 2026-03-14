import {
  addBrokerDealDocument,
  createBrokerDeal,
  listBrokerDeals,
  updateBrokerDealNotes,
  updateBrokerDealStage,
} from "@/server/broker_zone/crm";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexBrokerZoneRepository } from "@/server/infrastructure/convex/brokerZoneRepository";
import { convexCrmRepository } from "@/server/infrastructure/convex/crmRepository";
import { convexRedZoneRepository } from "@/server/infrastructure/convex/redZoneRepository";
import {
  addRedDealDocument,
  createRedDeal,
  listRedDeals,
  updateRedDealNotes,
  updateRedDealStage,
} from "@/server/red_zone/crm";
import { createUnavailableZoneError } from "./errors";
import { buildWorkspaceScopedSessionResolver } from "./session";

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
      createDeal: (input: Parameters<typeof createBrokerDeal>[0]) =>
        createBrokerDeal(input, {
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
      addDealDocument: (input: Parameters<typeof addBrokerDealDocument>[0]) =>
        addBrokerDealDocument(input, {
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
      createDeal: (input: Parameters<typeof createRedDeal>[0]) =>
        createRedDeal(input, {
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
      addDealDocument: (input: Parameters<typeof addRedDealDocument>[0]) =>
        addRedDealDocument(input, {
          requireDeveloper: requireSession,
          crmRepository: convexCrmRepository,
          propertiesRepository: convexRedZoneRepository,
        }),
    };
  }

  throw createUnavailableZoneError("CRM");
}
