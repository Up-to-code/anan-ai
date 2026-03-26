"use client";

import { nanoid } from "nanoid";
import type { PropsWithChildren, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PromptInputControllerContext,
  ProviderAttachmentsContext,
  type AttachmentsContext,
  type PromptInputControllerProps,
} from "./controllerContext";
import type { PromptInputFile } from "./types";

export type PromptInputProviderProps = PropsWithChildren<{
  initialInput?: string;
}>;

function toPromptInputFile(file: File): PromptInputFile {
  return {
    filename: file.name,
    file,
    id: nanoid(),
    mediaType: file.type,
    size: file.size,
    type: "file" as const,
    url: URL.createObjectURL(file),
  };
}

function revokeUrlIfPresent(url: string | undefined) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function revokeAllUrls(files: PromptInputFile[]) {
  for (const file of files) {
    revokeUrlIfPresent(file.url);
  }
}

function removeByIdAndRevoke(
  files: PromptInputFile[],
  id: string
): PromptInputFile[] {
  const found = files.find((f) => f.id === id);
  revokeUrlIfPresent(found?.url);
  return files.filter((f) => f.id !== id);
}

function useTextInputState(initialText: string) {
  const [value, setInput] = useState(initialText);
  const clear = useCallback(() => setInput(""), []);
  return useMemo(() => ({ clear, setInput, value }), [clear, value]);
}

function useFileDialogRegistration() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // oxlint-disable-next-line eslint(no-empty-function)
  const openRef = useRef<() => void>(() => {});

  const openFileDialog = useCallback(() => {
    openRef.current?.();
  }, []);

  const __registerFileInput = useCallback(
    (ref: RefObject<HTMLInputElement | null>, open: () => void) => {
      fileInputRef.current = ref.current;
      openRef.current = open;
    },
    []
  );

  return useMemo(
    () => ({ __registerFileInput, fileInputRef, openFileDialog }),
    [__registerFileInput, openFileDialog]
  );
}

function useAttachmentFilesState() {
  const [files, setFiles] = useState<PromptInputFile[]>([]);
  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(
    () => () => {
      revokeAllUrls(filesRef.current);
    },
    []
  );

  const add = useCallback((incoming: File[] | FileList) => {
    const array = [...incoming];
    if (array.length === 0) {
      return;
    }
    setFiles((prev) => [...prev, ...array.map(toPromptInputFile)]);
  }, []);

  const remove = useCallback(
    (id: string) => setFiles((prev) => removeByIdAndRevoke(prev, id)),
    []
  );

  const clear = useCallback(() => {
    setFiles((prev) => {
      revokeAllUrls(prev);
      return [];
    });
  }, []);

  return useMemo(() => ({ add, clear, files, remove }), [add, clear, files, remove]);
}

/**
 * Optional global provider that lifts PromptInput state outside of PromptInput.
 * If you don't use it, PromptInput stays fully self-managed.
 */
export const PromptInputProvider = ({
  initialInput: initialTextInput = "",
  children,
}: PromptInputProviderProps) => {
  const textInput = useTextInputState(initialTextInput);
  const attachmentState = useAttachmentFilesState();
  const dialog = useFileDialogRegistration();

  const attachments = useMemo<AttachmentsContext>(
    () => ({
      ...attachmentState,
      fileInputRef: dialog.fileInputRef,
      openFileDialog: dialog.openFileDialog,
    }),
    [attachmentState, dialog.fileInputRef, dialog.openFileDialog]
  );

  const controller = useMemo<PromptInputControllerProps>(
    () => ({
      __registerFileInput: dialog.__registerFileInput,
      attachments,
      textInput,
    }),
    [attachments, dialog.__registerFileInput, textInput]
  );

  return (
    <PromptInputControllerContext.Provider value={controller}>
      <ProviderAttachmentsContext.Provider value={attachments}>
        {children}
      </ProviderAttachmentsContext.Provider>
    </PromptInputControllerContext.Provider>
  );
};
