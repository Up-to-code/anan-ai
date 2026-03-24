import { v } from "convex/values";
import {
  mobileAssistantResultCardValidator,
  mobilePropertyFeedItemValidator,
  mobileQualificationContextValidator,
} from "../mobile/contracts";

/**
 * WHY:   The client web assistant needs an explicit locale contract for bilingual replies.
 * WHAT:  Validates the supported assistant locales.
 * HOW:   Restricts the assistant surface to Arabic or English until wider locale coverage exists.
 */
export const clientWebLocaleValidator = v.union(v.literal("ar"), v.literal("en"));

/**
 * WHY:   The client assistant needs one stable response envelope for cards, property results, and next prompts.
 * WHAT:  Validates deterministic assistant responses returned to the web app.
 * HOW:   Reuses the shared mobile property/card contracts so web and mobile stay aligned on result shapes.
 */
export const clientWebAssistantResponseValidator = v.object({
  message: v.string(),
  properties: v.array(mobilePropertyFeedItemValidator),
  cards: v.array(mobileAssistantResultCardValidator),
  suggestedPrompts: v.array(v.string()),
  activePropertyId: v.optional(v.id("properties")),
  requiresAuthForHandoff: v.boolean(),
});

export {
  mobileAssistantResultCardValidator,
  mobilePropertyFeedItemValidator,
  mobileQualificationContextValidator,
};
