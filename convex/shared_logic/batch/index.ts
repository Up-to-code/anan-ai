import { BatchProcessor } from "convex-batch-processor";
import { components } from "../../_generated/api";

/**
 * WHY:   Shared workflows need one batch processor client instead of duplicating setup.
 * WHAT:  Exposes a reusable BatchProcessor instance for queued batch workloads.
 * HOW:   Wires the BatchProcessor to the registered Convex component.
 */
export const batchProcessor = new BatchProcessor(components.batchProcessor);
