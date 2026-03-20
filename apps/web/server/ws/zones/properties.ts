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
} from "@/server/red_zone/properties";
import { createUnavailableZoneError } from "./errors";
import { buildWorkspaceScopedSessionResolver } from "./session";

type WorkspaceRequireSession = ReturnType<typeof buildWorkspaceScopedSessionResolver>;

const sharedZoneRepositories = {
  complianceRepository: convexComplianceRepository,
  organizationsRepository: convexOrganizationsRepository,
} as const;

function buildBrokerPropertyZone(requireSession: WorkspaceRequireSession) {
  const dependencies = { requireSession, repository: convexBrokerZoneRepository, ...sharedZoneRepositories };
  return {
    listProperties: (input: Parameters<typeof listBrokerProperties>[0]) => listBrokerProperties(input, dependencies),
    getProperty: (input: Parameters<typeof getBrokerProperty>[0]) => getBrokerProperty(input, dependencies),
    createProperty: (input: Parameters<typeof createBrokerProperty>[0]) => createBrokerProperty(input, dependencies),
    updateProperty: (input: Parameters<typeof updateBrokerProperty>[0]) => updateBrokerProperty(input, dependencies),
    deleteProperty: (input: Parameters<typeof deleteBrokerProperty>[0]) => deleteBrokerProperty(input, dependencies),
    publishProperty: (input: Parameters<typeof publishBrokerProperty>[0]) => publishBrokerProperty(input, dependencies),
  };
}

function buildDeveloperPropertyZone(requireSession: WorkspaceRequireSession) {
  const dependencies = { requireSession, repository: convexRedZoneRepository, ...sharedZoneRepositories };
  return {
    listProperties: (input: Parameters<typeof listRedProperties>[0]) => listRedProperties(input, dependencies),
    getProperty: (input: Parameters<typeof getRedProperty>[0]) => getRedProperty(input, dependencies),
    createProperty: (input: Parameters<typeof createRedProperty>[0]) => createRedProperty(input, dependencies),
    updateProperty: (input: Parameters<typeof updateRedProperty>[0]) => updateRedProperty(input, dependencies),
    deleteProperty: (input: Parameters<typeof deleteRedProperty>[0]) => deleteRedProperty(input, dependencies),
    publishProperty: (input: Parameters<typeof publishRedProperty>[0]) => publishRedProperty(input, dependencies),
  };
}

export function getWorkspacePropertyZone(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
) {
  const requireSession = buildWorkspaceScopedSessionResolver(audience, ownerContext);
  if (audience === "broker") {
    return buildBrokerPropertyZone(requireSession);
  }
  if (audience === "developer") {
    return buildDeveloperPropertyZone(requireSession);
  }
  throw createUnavailableZoneError("Projects");
}
