import { z } from "zod";

export const mainAssistantInputModeSchema = z.enum(["text", "voice"]);

export const mainAssistantMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  inputMode: mainAssistantInputModeSchema.optional(),
  createdAt: z.number(),
  audioUrl: z.string().min(1).optional(),
  audioStatus: z.enum(["idle", "loading", "ready", "error"]).optional(),
});

export const mainAssistantThreadSchema = z.object({
  id: z.string().min(1),
  title: z.string().nullable().optional(),
  messages: z.array(mainAssistantMessageSchema),
});

export const sendMainAssistantMessageInputSchema = z.object({
  message: z.string().trim().min(1),
  threadId: z.string().min(1).optional(),
  inputMode: mainAssistantInputModeSchema.optional(),
});

export const transcribeVoiceFromStorageInputSchema = z.object({
  storageId: z.string().min(1),
});

export const synthesizeAssistantVoiceInputSchema = z.object({
  messageId: z.string().min(1),
  text: z.string().trim().min(1),
});

export const synthesizeAssistantVoiceResultSchema = z.object({
  audioUrl: z.string().min(1).optional(),
  voiceUnavailableReason: z.string().min(1).optional(),
});

export type MainAssistantInputMode = z.infer<typeof mainAssistantInputModeSchema>;
export type MainAssistantMessage = z.infer<typeof mainAssistantMessageSchema>;
export type MainAssistantThread = z.infer<typeof mainAssistantThreadSchema>;
export type SendMainAssistantMessageInput = z.infer<typeof sendMainAssistantMessageInputSchema>;
export type TranscribeVoiceFromStorageInput = z.infer<typeof transcribeVoiceFromStorageInputSchema>;
export type SynthesizeAssistantVoiceInput = z.infer<typeof synthesizeAssistantVoiceInputSchema>;
export type SynthesizeAssistantVoiceResult = z.infer<typeof synthesizeAssistantVoiceResultSchema>;
