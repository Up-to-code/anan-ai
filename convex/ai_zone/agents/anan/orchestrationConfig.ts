import { buildAgentRegistry, buildTeamRegistry, defineTeamConfig } from "../core/registry";

import {
  ananBanksDefinition,
  ananFinanceDefinition,
  ananPropertyDefinition,
  ananRecommenderDefinition,
  ananSearchDefinition,
  ananWebDefinition,
} from "./orchestrationAgentsSearchFinance";
import {
  ananKnowledgeDefinition,
  ananMemoryDefinition,
  ananPlatformDocsDefinition,
} from "./orchestrationAgentsKnowledge";

export { MODEL_CATALOG, TOOL_CATALOG } from "./orchestrationCatalog";
export {
  ananBanksDefinition,
  ananFinanceDefinition,
  ananPropertyDefinition,
  ananRecommenderDefinition,
  ananSearchDefinition,
  ananWebDefinition,
} from "./orchestrationAgentsSearchFinance";
export {
  ananKnowledgeDefinition,
  ananMemoryDefinition,
  ananPlatformDocsDefinition,
} from "./orchestrationAgentsKnowledge";

export const AGENT_REGISTRY = buildAgentRegistry([
  ananSearchDefinition,
  ananWebDefinition,
  ananPropertyDefinition,
  ananRecommenderDefinition,
  ananFinanceDefinition,
  ananBanksDefinition,
  ananKnowledgeDefinition,
  ananMemoryDefinition,
  ananPlatformDocsDefinition,
]);

export const TEAM_REGISTRY = buildTeamRegistry([
  defineTeamConfig({
    id: "team_search",
    allowedRoles: ["user", "broker", "admin"],
    failureMode: "soft",
    agents: [ananSearchDefinition, ananWebDefinition],
  }),
  defineTeamConfig({
    id: "team_property",
    allowedRoles: ["user", "broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananPropertyDefinition, ananRecommenderDefinition],
  }),
  defineTeamConfig({
    id: "team_finance",
    allowedRoles: ["user", "admin"],
    failureMode: "soft",
    agents: [ananFinanceDefinition, ananBanksDefinition],
  }),
  defineTeamConfig({
    id: "team_knowledge",
    allowedRoles: ["user", "broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananKnowledgeDefinition, ananMemoryDefinition],
  }),
  defineTeamConfig({
    id: "team_platform",
    allowedRoles: ["broker", "RED", "admin"],
    failureMode: "soft",
    agents: [ananPlatformDocsDefinition],
  }),
]);
