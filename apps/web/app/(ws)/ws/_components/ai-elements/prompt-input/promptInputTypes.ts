import type { FileUIPart } from "ai";
import type { FormEvent, HTMLAttributes } from "react";
import type { PromptInputFile } from "./types";
export type { PromptInputFile };

export interface PromptInputMessage {
  text: string;
  files: FileUIPart[];
  localFiles: PromptInputFile[];
}

export type PromptInputProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onError"
> & {
  accept?: string;
  multiple?: boolean;
  globalDrop?: boolean;
  syncHiddenInput?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onError?: (err: {
    code: "max_files" | "max_file_size" | "accept";
    message: string;
  }) => void;
  onSubmit: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
};
