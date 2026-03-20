"use client";

import type { RefObject } from "react";
import { createContext, useContext } from "react";
import type { PromptInputFile } from "./types";

export interface AttachmentsContext {
  files: PromptInputFile[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export interface TextInputContext {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
}

export interface PromptInputControllerProps {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  /** INTERNAL: Allows PromptInput to register its file input + "open" callback */
  __registerFileInput: (
    ref: RefObject<HTMLInputElement | null>,
    open: () => void
  ) => void;
}

export const PromptInputControllerContext =
  createContext<PromptInputControllerProps | null>(null);

export const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(
  null
);

export function useOptionalPromptInputController() {
  return useContext(PromptInputControllerContext);
}

export function useOptionalProviderAttachments() {
  return useContext(ProviderAttachmentsContext);
}

