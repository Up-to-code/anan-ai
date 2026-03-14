import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerProperty,
  listBrokerProperties,
  publishBrokerProperty,
  updateBrokerProperty,
} from "@/server/broker_zone/properties";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexBrokerZoneRepository } from "@/server/infrastructure/convex/brokerZoneRepository";
import { convexRedZoneRepository } from "@/server/infrastructure/convex/redZoneRepository";
import {
  createRedProperty,
  deleteRedProperty,
  getRedProperty,
  listRedProperties,
  publishRedProperty,
  updateRedProperty,
} from "@/server/red_zone/properties";
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
        listBrokerProperties(input, { requireSession, repository: convexBrokerZoneRepository }),
      getProperty: (input: Parameters<typeof getBrokerProperty>[0]) =>
        getBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository }),
      createProperty: (input: Parameters<typeof createBrokerProperty>[0]) =>
        createBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository }),
      updateProperty: (input: Parameters<typeof updateBrokerProperty>[0]) =>
        updateBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository }),
      deleteProperty: (input: Parameters<typeof deleteBrokerProperty>[0]) =>
        deleteBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository }),
      publishProperty: (input: Parameters<typeof publishBrokerProperty>[0]) =>
        publishBrokerProperty(input, { requireSession, repository: convexBrokerZoneRepository }),
    };
  }

  if (audience === "developer") {
    return {
      listProperties: (input: Parameters<typeof listRedProperties>[0]) =>
        listRedProperties(input, { requireSession, repository: convexRedZoneRepository }),
      getProperty: (input: Parameters<typeof getRedProperty>[0]) =>
        getRedProperty(input, { requireSession, repository: convexRedZoneRepository }),
      createProperty: (input: Parameters<typeof createRedProperty>[0]) =>
        createRedProperty(input, { requireSession, repository: convexRedZoneRepository }),
      updateProperty: (input: Parameters<typeof updateRedProperty>[0]) =>
        updateRedProperty(input, { requireSession, repository: convexRedZoneRepository }),
      deleteProperty: (input: Parameters<typeof deleteRedProperty>[0]) =>
        deleteRedProperty(input, { requireSession, repository: convexRedZoneRepository }),
      publishProperty: (input: Parameters<typeof publishRedProperty>[0]) =>
        publishRedProperty(input, { requireSession, repository: convexRedZoneRepository }),
    };
  }

  throw createUnavailableZoneError("Projects");
}
