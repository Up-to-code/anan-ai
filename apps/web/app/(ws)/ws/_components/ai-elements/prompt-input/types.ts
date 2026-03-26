import type { FileUIPart, SourceDocumentUIPart } from "ai";

export type PromptInputFile = FileUIPart & {
  id: string;
  file?: File;
  size?: number;
};
export type PromptInputReferencedSource = SourceDocumentUIPart & { id: string };
