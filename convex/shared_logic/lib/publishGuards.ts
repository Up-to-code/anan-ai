import type { MutationCtx } from "../../_generated/server";
import { brokerChecker } from "./brokerChecker";
import { REDChecker } from "./REDChecker";

export async function requireVerifiedForPublishBroker(ctx: MutationCtx) {
  return brokerChecker(ctx, { requireVerified: true });
}

export async function requireVerifiedForPublishRED(ctx: MutationCtx) {
  return REDChecker(ctx, { requireVerified: true });
}
