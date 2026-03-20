"use client";

import { createContext, useContext } from "react";
import type { SourceDocumentUIPart } from "ai";
import type { PromptInputReferencedSource } from "./types";

export interface ReferencedSourcesContext {
  sources: PromptInputReferencedSource[];
  add: (sources: SourceDocumentUIPart[] | SourceDocumentUIPart) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const LocalReferencedSourcesContext =
  createContext<ReferencedSourcesContext | null>(null);

export const usePromptInputReferencedSources = (): ReferencedSourcesContext => {
  const ctx = useContext(LocalReferencedSourcesContext);
  if (!ctx) {
    throw new Error(
      "usePromptInputReferencedSources must be used within a LocalReferencedSourcesContext.Provider"
    );
  }
  return ctx;
};
