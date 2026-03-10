import { internalMutation } from "../../../_generated/server";
import { v } from "convex/values";
import { trackOrchestrationUsage } from "./orchestrationTracker";

export const trackOrchestrationUsageInternal = internalMutation({
  args: {
    orchestratorName: v.string(),
    role: v.string(),
    channel: v.optional(v.string()),
    userId: v.optional(v.string()),
    threadId: v.optional(v.string()),
    agentsDispatched: v.array(v.string()),
    successfulAgents: v.array(v.string()),
    failedAgents: v.array(v.string()),
    totalInputTokens: v.number(),
    totalOutputTokens: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await trackOrchestrationUsage(ctx, args);
    return null;
  },
});
