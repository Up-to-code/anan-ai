import type { FileUIPart } from "ai";
import { nanoid } from "nanoid";
import type { FormEvent } from "react";
import { convertBlobUrlToDataUrl } from "./blob";
import type { PromptInputProps, PromptInputMessage } from "./promptInputTypes";

export type PromptInputLocalFile = FileUIPart & { id: string };

export function makeLocalFile(file: File): PromptInputLocalFile {
  return {
    filename: file.name,
    id: nanoid(),
    mediaType: file.type,
    type: "file",
    url: URL.createObjectURL(file),
  };
}

export function revokeUrlIfPresent(url: string | undefined) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function parseAcceptPatterns(accept: string | undefined): string[] {
  if (!accept || accept.trim() === "") {
    return [];
  }
  return accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function matchesAcceptPatterns(file: File, patterns: string[]): boolean {
  if (patterns.length === 0) {
    return true;
  }
  return patterns.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return file.type.startsWith(prefix);
    }
    return file.type === pattern;
  });
}

export function capAndValidateFiles(options: {
  incoming: File[];
  patterns: string[];
  maxFileSize: number | undefined;
  maxFiles: number | undefined;
  currentCount: number;
  onError: PromptInputProps["onError"] | undefined;
}): File[] {
  const { incoming, patterns, maxFileSize, maxFiles, currentCount, onError } =
    options;
  const accepted = incoming.filter((f) => matchesAcceptPatterns(f, patterns));
  if (incoming.length && accepted.length === 0) {
    onError?.({ code: "accept", message: "No files match the accepted types." });
    return [];
  }

  const sized = maxFileSize
    ? accepted.filter((f) => f.size <= maxFileSize)
    : accepted;
  if (accepted.length && sized.length === 0) {
    onError?.({
      code: "max_file_size",
      message: "All files exceed the maximum size.",
    });
    return [];
  }

  const capacity =
    typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : undefined;
  const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
  if (typeof capacity === "number" && sized.length > capacity) {
    onError?.({
      code: "max_files",
      message: "Too many files. Some were not added.",
    });
  }
  return capped;
}

export function removeByIdAndRevoke(
  files: PromptInputLocalFile[],
  id: string
): PromptInputLocalFile[] {
  const found = files.find((f) => f.id === id);
  revokeUrlIfPresent(found?.url);
  return files.filter((f) => f.id !== id);
}

export function clearAndRevoke(files: PromptInputLocalFile[]): PromptInputLocalFile[] {
  for (const file of files) {
    revokeUrlIfPresent(file.url);
  }
  return [];
}

export async function convertFilesForSubmit(
  files: PromptInputLocalFile[]
): Promise<FileUIPart[]> {
  return await Promise.all(
    files.map(async ({ id: _id, ...item }) => {
      if (item.url?.startsWith("blob:")) {
        const dataUrl = await convertBlobUrlToDataUrl(item.url);
        return { ...item, url: dataUrl ?? item.url };
      }
      return item;
    })
  );
}

export function getTextFromForm(options: {
  usingProvider: boolean;
  controllerValue: string | undefined;
  form: HTMLFormElement;
}): string {
  const { usingProvider, controllerValue, form } = options;
  if (usingProvider) {
    return controllerValue ?? "";
  }
  const formData = new FormData(form);
  return (formData.get("message") as string) || "";
}

export async function runSubmit(options: {
  onSubmit: PromptInputProps["onSubmit"];
  message: PromptInputMessage;
  event: FormEvent<HTMLFormElement>;
}): Promise<boolean> {
  try {
    await options.onSubmit(options.message, options.event);
    return true;
  } catch {
    return false;
  }
}

