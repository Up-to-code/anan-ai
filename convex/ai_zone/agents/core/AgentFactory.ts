import { composeToolMap } from "./toolRegistry";
import { BaseConfiguredAgent } from "./BaseConfiguredAgent";
import type { AgentDefinition } from "./types";

/**
 * WHY:   Agent instances should be created through one shared path so global runtime changes stay centralized.
 * WHAT:  Creates runnable configured agents from declarative definitions.
 * HOW:   Merges tool bundles into the definition and returns shared runtime instances.
 */
export class AgentFactory {
  create(definition: AgentDefinition) {
    return new BaseConfiguredAgent({
      ...definition,
      tools: composeToolMap(definition.toolBundles, definition.tools),
    });
  }

  createMany(definitions: AgentDefinition[]) {
    return definitions.map((definition) => this.create(definition));
  }
}

export const agentFactory = new AgentFactory();
