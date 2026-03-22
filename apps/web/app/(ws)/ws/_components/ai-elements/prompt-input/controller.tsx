"use client";

import { useContext } from "react";
import {
  PromptInputControllerContext,
  ProviderAttachmentsContext,
  type AttachmentsContext,
  type PromptInputControllerProps,
} from "./controllerContext";

export type {
  AttachmentsContext,
  PromptInputControllerProps,
  TextInputContext,
} from "./controllerContext";

export const usePromptInputController = (): PromptInputControllerProps => {
  const ctx = useContext(PromptInputControllerContext);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use usePromptInputController()."
    );
  }
  return ctx;
};

export const useProviderAttachments = (): AttachmentsContext => {
  const ctx = useContext(ProviderAttachmentsContext);
  if (!ctx) {
    throw new Error(
      "Wrap your component inside <PromptInputProvider> to use useProviderAttachments()."
    );
  }
  return ctx;
};

