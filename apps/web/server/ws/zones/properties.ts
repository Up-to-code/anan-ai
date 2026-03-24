import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerProperty,
  listBrokerProperties,
  publishBrokerProperty,
  updateBrokerProperty,
} from "@/server/broker_zone";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexBrokerZoneRepository } from "@/server/infrastructure/convex/brokerZoneRepository";
import { convexComplianceRepository } from "@/server/infrastructure/convex/complianceRepository";
import { convexOrganizationsRepository } from "@/server/infrastructure/convex/organizationsRepository";
import { convexRedZoneRepository } from "@/server/infrastructure/convex/redZoneRepository";
import {
  createRedProperty,
  deleteRedProperty,
  getRedProperty,
  listRedProperties,
  publishRedProperty,
  updateRedProperty,
} from "@/server/red_zone";
import { createUnavailableZoneError } from "./errors";
import { buildWorkspaceScopedSessionResolver } from "./session";

/**
 * WHY:   `/ws` property routes should resolve broker-vs-developer behavior once instead of duplicating branching in pages.
 * WHAT:  Returns the current audience's property read/write handlers with the proper repository and session resolver wired in.
 * HOW:   Builds a workspace-scoped session resolver, then dispatches to the broker or developer property service module.
 */
export function getWorkspacePropertyZone(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
) {
  const requireSession = buildWorkspaceScopedSessionResolver(audience, ownerContext);

  if (audience === "broker") {
    return {
      listProperties: (input: Parameters<typeof listBrokerProperties>[0]) =>
        listBrokerProperties(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      getProperty: (input: Parameters<typeof getBrokerProperty>[0]) =>
        getBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      createProperty: (input: Parameters<typeof createBrokerProperty>[0]) =>
        createBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      updateProperty: (input: Parameters<typeof updateBrokerProperty>[0]) =>
        updateBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      deleteProperty: (input: Parameters<typeof deleteBrokerProperty>[0]) =>
        deleteBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      publishProperty: (input: Parameters<typeof publishBrokerProperty>[0]) =>
        publishBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
    };
  }

  if (audience === "developer") {
    return {
      listProperties: (input: Parameters<typeof listRedProperties>[0]) =>
        listRedProperties(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      getProperty: (input: Parameters<typeof getRedProperty>[0]) =>
        getRedProperty(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      createProperty: (input: Parameters<typeof createRedProperty>[0]) =>
        createRedProperty(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      updateProperty: (input: Parameters<typeof updateRedProperty>[0]) =>
        updateRedProperty(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      deleteProperty: (input: Parameters<typeof deleteRedProperty>[0]) =>
        deleteRedProperty(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
      publishProperty: (input: Parameters<typeof publishRedProperty>[0]) =>
        publishRedProperty(input, { requireSession, repository: convexRedZoneRepository, complianceRepository: convexComplianceRepository, organizationsRepository: convexOrganizationsRepository }),
    };
  }

  throw createUnavailableZoneError("Projects");
}
