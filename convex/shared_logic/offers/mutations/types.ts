import type { Infer } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import { uploadedFileReferenceValidator } from "../../files";

/**
 * WHY:   Offer mutation flows share the same create payload shape across the public Convex entrypoint and internal services.
 * WHAT:  Defines the validated arguments accepted by offer creation.
 * HOW:   Reuses the uploaded file validator so attachments stay aligned with the shared file contract.
 */
export type CreateOfferArgs = {
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  visibility?: "public" | "private";
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  recipientAuthUserId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  sourceConversationId?: Id<"inboxConversations">;
  attachments?: Infer<typeof uploadedFileReferenceValidator>[];
};
