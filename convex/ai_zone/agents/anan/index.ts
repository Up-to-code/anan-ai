/**
 * index.ts — Public API for the Anan Orchestrator
 *
 * WHY:   External code (assistantService.ts) should import from "anan/"
 *        without knowing the internal file structure.
 * WHAT:  Re-exports the orchestrate function and types.
 * HOW:   Simple barrel exports.
 *
 * USAGE:
 *   import { orchestrate } from "../agents/anan";
 *   const result = await orchestrate({ prompt, role, userId });
 */

export { orchestrate } from "./orchestrate";
export type { OrchestrateInput, OrchestrateOutput } from "./types";
