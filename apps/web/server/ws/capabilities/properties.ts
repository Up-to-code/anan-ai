import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerProperty,
  listBrokerProperties,
  publishBrokerProperty,
  updateBrokerProperty,
} from "@/server/domains/workspace/properties/broker";
import {
  getWorkspaceProjectAnalytics,
  recordWorkspaceProjectAnalyticsEvent,
} from "@/server/domains/workspace/properties/analytics";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexBrokerZoneRepository } from "@/server/infrastructure/convex/properties/brokerZone";
import { convexComplianceRepository } from "@/server/infrastructure/convex/compliance";
import { convexOrganizationsRepository } from "@/server/infrastructure/convex/organizations";
import { convexProjectAnalyticsRepository } from "@/server/infrastructure/convex/properties/analytics";
import { convexRedZoneRepository } from "@/server/infrastructure/convex/properties/redZone";
import {
  createRedProperty,
  deleteRedProperty,
  getRedProperty,
  listRedProperties,
  publishRedProperty,
  updateRedProperty,
} from "@/server/domains/workspace/properties/developer";
import { createUnavailableZoneError } from "../shared/errors";
import { buildWorkspaceScopedSessionResolver } from "../session";

type WorkspaceRequireSession = ReturnType<typeof buildWorkspaceScopedSessionResolver>;

const sharedZoneRepositories = {
  complianceRepository: convexComplianceRepository,
  organizationsRepository: convexOrganizationsRepository,
  projectAnalyticsRepository: convexProjectAnalyticsRepository,
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
    getProjectAnalytics: (input: Parameters<typeof getWorkspaceProjectAnalytics>[0]) =>
      getWorkspaceProjectAnalytics(input, {
        requireSession,
        repository: convexProjectAnalyticsRepository,
      }),
    recordProjectAnalyticsEvent: (input: Parameters<typeof recordWorkspaceProjectAnalyticsEvent>[0]) =>
      recordWorkspaceProjectAnalyticsEvent(input, {
        requireSession,
        repository: convexProjectAnalyticsRepository,
      }),
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
    getProjectAnalytics: (input: Parameters<typeof getWorkspaceProjectAnalytics>[0]) =>
      getWorkspaceProjectAnalytics(input, {
        requireSession,
        repository: convexProjectAnalyticsRepository,
      }),
    recordProjectAnalyticsEvent: (input: Parameters<typeof recordWorkspaceProjectAnalyticsEvent>[0]) =>
      recordWorkspaceProjectAnalyticsEvent(input, {
        requireSession,
        repository: convexProjectAnalyticsRepository,
      }),
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
