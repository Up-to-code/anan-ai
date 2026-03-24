import type { FileUIPart, SourceDocumentUIPart } from "ai";

export type PromptInputFile = FileUIPart & { id: string };
export type PromptInputReferencedSource = SourceDocumentUIPart & { id: string };

