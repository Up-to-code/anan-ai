"use client";

import { createContext, useContext } from "react";
import {
  useOptionalProviderAttachments,
  type AttachmentsContext,
} from "./controllerContext";

export const LocalAttachmentsContext = createContext<AttachmentsContext | null>(
  null
);

export const usePromptInputAttachments = (): AttachmentsContext => {
  // Prefer local context (inside PromptInput) as it has validation, fall back to provider.
  const provider = useOptionalProviderAttachments();
  const local = useContext(LocalAttachmentsContext);
  const context = local ?? provider;
  if (!context) {
    throw new Error(
      "usePromptInputAttachments must be used within a PromptInput or PromptInputProvider"
    );
  }
  return context;
};

