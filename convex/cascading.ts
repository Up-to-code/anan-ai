import { CascadingDelete, defineCascadeRules, makeBatchDeleteHandler } from "@00akshatsinha00/convex-cascading-delete";
import { internalMutation } from "./_generated/server";
import { components } from "./_generated/api";

/**
 * WHY:   Organization deletions must clean related records without manual multi-step scripts.
 * WHAT:  Declares cascade rules for brokers and RED organizations.
 * HOW:   Uses indexed relationships on subscriptions and tenantOrgLinks.
 */
export const cascadeRules = defineCascadeRules({
  brokers: [
    { to: "subscriptions", via: "ownerBrokerId", field: "ownerBrokerId" },
    { to: "tenantOrgLinks", via: "ownerBrokerId", field: "ownerBrokerId" },
  ],
  RED: [
    { to: "subscriptions", via: "ownerREDId", field: "ownerREDId" },
    { to: "tenantOrgLinks", via: "ownerREDId", field: "ownerREDId" },
  ],
});

/**
 * WHY:   Centralizes cascading deletion operations for reuse in admin mutations.
 * WHAT:  Configured CascadingDelete client for broker/RED trees.
 * HOW:   Instantiates the component with the shared cascade rules.
 */
export const cascadingDelete = new CascadingDelete(components.cascadingDelete, {
  rules: cascadeRules,
});

/**
 * WHY:   Batched cascade deletes require an internal handler for background work.
 * WHAT:  Internal mutation handler used by deleteWithCascadeBatched.
 * HOW:   Uses the component-provided batch handler factory.
 */
export const _cascadeBatchHandler = makeBatchDeleteHandler(
  internalMutation,
  components.cascadingDelete,
);
