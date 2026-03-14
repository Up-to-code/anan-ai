import { z } from "zod";
import { uploadedFileReferenceSchema, type UploadedFileReference } from "@/server/contracts/files";

export const offerStatusSchema = z.enum(["pending", "accepted", "rejected"]);
export const offerPublicationStateSchema = z.enum(["draft", "published", "archived"]);
export const offerVisibilitySchema = z.enum(["public", "private"]);

export const createOfferInputSchema = z.object({
  propertyId: z.string().min(1),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  visibility: offerVisibilitySchema.optional(),
  toBrokerId: z.string().optional(),
  toREDId: z.string().optional(),
  recipientAuthUserId: z.string().min(1).optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().trim().min(1).optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
});

export const publishOfferInputSchema = z.object({
  id: z.string().min(1),
});

export const respondToOfferInputSchema = z.object({
  id: z.string().min(1),
  status: offerStatusSchema.exclude(["pending"]),
});

export const applyToOfferInputSchema = z.object({
  offerId: z.string().min(1),
  message: z.string().trim().min(1).optional(),
});

export const offerPushStatusSchema = z.enum(["pending", "sent", "failed", "skipped"]);

export type OfferPropertySummary = {
  id: string;
  title: string;
  address: string;
  price?: number;
  imageUrl?: string;
};

export type OfferSummary = {
  id: string;
  propertyId: string;
  price: number;
  status: z.infer<typeof offerStatusSchema>;
  publicationState?: z.infer<typeof offerPublicationStateSchema>;
  visibility?: z.infer<typeof offerVisibilitySchema>;
  recipientAuthUserId?: string;
  message?: string;
  description?: string;
  senderName?: string;
  attachments?: UploadedFileReference[];
  property?: OfferPropertySummary | null;
};

export type OfferNotificationDelivery = {
  notificationId: string;
  targetUserId: string;
  targetName: string;
  organizationName: string;
  href: string;
  pushStatus: z.infer<typeof offerPushStatusSchema>;
};

export type OfferActionResult = {
  offerId: string;
  conversationId: string | null;
  starterMessageCreated: boolean;
  notification: OfferNotificationDelivery | null;
};

export type OffersSnapshot = {
  sent: OfferSummary[];
  received: OfferSummary[];
  marketplace: OfferSummary[];
};

export type CreateOfferInput = z.infer<typeof createOfferInputSchema>;
export type PublishOfferInput = z.infer<typeof publishOfferInputSchema>;
export type RespondToOfferInput = z.infer<typeof respondToOfferInputSchema>;
export type ApplyToOfferInput = z.infer<typeof applyToOfferInputSchema>;
