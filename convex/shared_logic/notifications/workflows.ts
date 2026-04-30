import { WorkflowManager } from "@convex-dev/workflow";
import type { WorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { api, components, internal } from "../../_generated/api";
import { WORKFLOW_RETRY_POLICY } from "../lib/retry";

export const workspaceWorkflow = new WorkflowManager(components.workflow as never, {
  workpoolOptions: {
    defaultRetryBehavior: {
      maxAttempts: WORKFLOW_RETRY_POLICY.maxAttempts,
      initialBackoffMs: WORKFLOW_RETRY_POLICY.initialBackoffMs,
      base: WORKFLOW_RETRY_POLICY.base,
    },
    retryActionsByDefault: false,
    maxParallelism: 30,
  },
});

export const notificationWorkflow = workspaceWorkflow.define({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  returns: v.null(),
  handler: async (step, { notificationId }) => {
    const result = await step.runAction(
      api.shared_logic.notificationsNode.sendBrowserPush,
      { notificationId },
      { name: "browserPush" },
    );

    await step.runMutation(internal.shared_logic.notifications._markNotificationDelivered, {
      notificationId,
      status: result.status,
      error: result.reason,
    });

    return null;
  },
});

export const startNotificationWorkflow = internalAction({
  args: {
    notificationId: v.id("workspaceNotifications"),
  },
  handler: async (ctx, args): Promise<WorkflowId> => {
    return workspaceWorkflow.start(
      ctx,
      internal.shared_logic.workspaceWorkflows.notificationWorkflow as never,
      args as never,
    );
  },
});
