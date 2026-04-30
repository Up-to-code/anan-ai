import { zid } from "convex-helpers/server/zod3";
import { z } from "zod/v3";

import type { Id } from "../_generated/dataModel";
import { uploadedFileReferenceListSchema } from "./files";

const optionalRequirementNumberSchema = z.number().finite().nonnegative().optional();

export const offerVisibilitySchema = z.enum(["public", "private"]);
export const offerCaseTypeSchema = z.enum([
  "open_offer",
  "private_offer",
  "collaboration_case",
]);
export const offerAllowedAudienceSchema = z.enum(["brokers", "developers", "both"]);
export const offerTerminalStatusSchema = z.enum(["accepted", "rejected"]);
export const offerStageActionSchema = z.enum(["mark_agreed", "close_won", "close_lost"]);

export const offerClientContextSchema = z.object({
  crmClientId: zid("crmClients").optional(),
  clientName: z.string().trim().min(1),
  clientPhone: z.string().trim().min(1).optional(),
  clientBudget: z.string().trim().min(1).optional(),
  clientNeed: z.string().trim().min(1),
  budgetMin: optionalRequirementNumberSchema,
  budgetMax: optionalRequirementNumberSchema,
  location: z.string().trim().min(1).optional(),
  area: z.string().trim().min(1).optional(),
  bedsMin: optionalRequirementNumberSchema,
  bathsMin: optionalRequirementNumberSchema,
  sqftMin: optionalRequirementNumberSchema,
  sqftMax: optionalRequirementNumberSchema,
});

export const createOfferInputSchema = {
  propertyId: zid("properties"),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  visibility: offerVisibilitySchema.optional(),
  caseType: offerCaseTypeSchema.optional(),
  allowedAudience: offerAllowedAudienceSchema.optional(),
  commissionText: z.string().trim().min(1).optional(),
  permitStatus: z.string().trim().min(1).optional(),
  productStatus: z.string().trim().min(1).optional(),
  toBrokerId: zid("brokers").optional(),
  toREDId: zid("RED").optional(),
  recipientAuthUserId: z.string().min(1).optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().trim().min(1).optional(),
  sourceConversationId: zid("inboxConversations").optional(),
  attachments: uploadedFileReferenceListSchema.optional(),
  clientContext: offerClientContextSchema.optional(),
};

export const updateOfferDraftInputSchema = {
  id: zid("offerCases"),
  conversationId: zid("inboxConversations").optional(),
  propertyId: zid("properties"),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  attachments: uploadedFileReferenceListSchema.optional(),
  commissionText: z.string().trim().min(1).optional(),
  permitStatus: z.string().trim().min(1).optional(),
  productStatus: z.string().trim().min(1).optional(),
  allowedAudience: offerAllowedAudienceSchema.optional(),
  clientContext: offerClientContextSchema.optional(),
};

export const offerIdInputSchema = {
  id: zid("offerCases"),
};

export const publishConversationOfferInputSchema = {
  id: zid("offerCases"),
  conversationId: zid("inboxConversations"),
};

export const updateOfferStatusInputSchema = {
  id: zid("offerCases"),
  status: offerTerminalStatusSchema,
};

export const applyToOfferInputSchema = {
  offerId: zid("offerCases"),
  message: z.string().trim().min(1).optional(),
};

export const advanceOfferCaseStageInputSchema = {
  id: zid("offerCases"),
  action: offerStageActionSchema,
};

export const conversationPrivateOfferDraftsInputSchema = {
  conversationId: zid("inboxConversations"),
};

export const offerLiveStateInputSchema = {
  offerId: z.union([zid("offerCases"), z.string().min(1)]),
};

export type OfferClientContextInput = {
  crmClientId?: Id<"crmClients">;
  clientName: string;
  clientPhone?: string;
  clientBudget?: string;
  clientNeed: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  area?: string;
  bedsMin?: number;
  bathsMin?: number;
  sqftMin?: number;
  sqftMax?: number;
};

export type CreateOfferInput = {
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  visibility?: z.infer<typeof offerVisibilitySchema>;
  caseType?: z.infer<typeof offerCaseTypeSchema>;
  allowedAudience?: z.infer<typeof offerAllowedAudienceSchema>;
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  recipientAuthUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sourceConversationId?: Id<"inboxConversations">;
  attachments?: z.infer<typeof uploadedFileReferenceListSchema>;
  clientContext?: OfferClientContextInput;
};

export type UpdateOfferDraftInput = Omit<CreateOfferInput, "caseType" | "visibility" | "toBrokerId" | "toREDId" | "recipientAuthUserId" | "recipientEmail" | "recipientPhone" | "sourceConversationId"> & {
  id: Id<"offerCases">;
  conversationId?: Id<"inboxConversations">;
};

export type OfferIdInput = {
  id: Id<"offerCases">;
};

export type PublishConversationOfferInput = OfferIdInput & {
  conversationId: Id<"inboxConversations">;
};

export type UpdateOfferStatusInput = OfferIdInput & {
  status: z.infer<typeof offerTerminalStatusSchema>;
};

export type ApplyToOfferInput = {
  offerId: Id<"offerCases">;
  message?: string;
};

export type AdvanceOfferCaseStageInput = OfferIdInput & {
  action: z.infer<typeof offerStageActionSchema>;
};

export type ConversationPrivateOfferDraftsInput = {
  conversationId: Id<"inboxConversations">;
};

export type OfferLiveStateInput = {
  offerId: Id<"offerCases"> | string;
};

