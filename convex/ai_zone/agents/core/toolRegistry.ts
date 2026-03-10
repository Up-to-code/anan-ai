import type { ActionCtx } from "../../../_generated/server";
import type { AgentRuntimeContext, ToolFactoryMap, ResolvedToolSet } from "../types";
import type { ToolBundleDefinition } from "./types";

/**
 * WHY:   Multiple agents reuse the same tools, and those tools should only be defined once.
 * WHAT:  Provides helpers to compose direct tools with reusable tool bundles.
 * HOW:   Merges bundle entries first, then agent-local overrides, and resolves factories at runtime.
 */
export function composeToolMap(
  bundles: ToolBundleDefinition[] = [],
  directTools: ToolFactoryMap = {},
): ToolFactoryMap {
  return bundles.reduce<ToolFactoryMap>(
    (acc, bundle) => ({ ...acc, ...bundle.tools }),
    { ...directTools },
  );
}

export function defineToolBundle(bundle: ToolBundleDefinition): ToolBundleDefinition {
  return bundle;
}

export function resolveTools(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  tools: ToolFactoryMap,
): ResolvedToolSet {
  const resolved: ResolvedToolSet = {};
  for (const [key, entry] of Object.entries(tools ?? {})) {
    resolved[key] = typeof entry === "function" ? entry(ctx, runtime) : entry;
  }
  return resolved;
}
