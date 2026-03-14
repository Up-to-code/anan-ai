import { z } from "zod";
import { uploadedFileReferenceSchema, type UploadedFileReference } from "@/server/contracts/files";

export const dealStageSchema = z.enum(["new", "contacted", "negotiation", "won", "lost"]);

/**
 * WHY:   CRM server functions need one validated payload shape across broker and developer flows.
 * WHAT:  CreateDealInput validates the mutable deal fields accepted from the web layer.
 * HOW:   It mirrors the currently supported CRM write fields while leaving ownership resolution to the server layer.
 */
export const createDealInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  value: z.number().finite().optional(),
  stage: dealStageSchema,
  contactName: z.string().trim().min(1).max(120).optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  propertyId: z.string().optional(),
});

export const updateDealStageInputSchema = z.object({
  dealId: z.string(),
  stage: dealStageSchema,
});

export const updateDealNotesInputSchema = z.object({
  dealId: z.string(),
  notes: z.string(),
});

export const addDealDocumentInputSchema = z.object({
  dealId: z.string(),
  document: uploadedFileReferenceSchema,
});

export const propertyDealsInputSchema = z.object({
  propertyId: z.string(),
});

export type CreateDealInput = z.infer<typeof createDealInputSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageInputSchema>;
export type UpdateDealNotesInput = z.infer<typeof updateDealNotesInputSchema>;
export type AddDealDocumentInput = z.infer<typeof addDealDocumentInputSchema>;
export type PropertyDealsInput = z.infer<typeof propertyDealsInputSchema>;

export type DealSummary = {
  id: string;
  title: string;
  description?: string;
  value?: number;
  stage: z.infer<typeof dealStageSchema>;
  brokerId?: string;
  redId?: string;
  propertyId?: string;
  offerId?: string;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  lastUpdatedBy?: string;
  brokerName?: string | null;
  redName?: string | null;
  documents?: UploadedFileReference[];
};

export type DealDetail = DealSummary;
