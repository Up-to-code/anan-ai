import { z } from "zod";
import type { AgUiConversationTurn } from "@/components/shared/ag-aui/sdk/types";

export const ananProMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  uiTurn: z.any().optional(),
  createdAt: z.number(),
});

export const ananProThreadSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  messages: z.array(ananProMessageSchema),
});

export const ananProThreadSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  updatedAt: z.number(),
});

export const sendAnanProMessageInputSchema = z.object({
  message: z.string().trim().min(1),
  threadId: z.string().min(1).optional(),
});

export type AnanProMessage = z.infer<typeof ananProMessageSchema>;
export type AnanProThread = z.infer<typeof ananProThreadSchema>;
export type AnanProThreadSummary = z.infer<typeof ananProThreadSummarySchema>;
export type SendAnanProMessageInput = z.infer<typeof sendAnanProMessageInputSchema>;

export type AnanProUiTurn = AgUiConversationTurn;
