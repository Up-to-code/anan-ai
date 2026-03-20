"use client";

import type { SourceDocumentUIPart } from "ai";
import { nanoid } from "nanoid";
import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InputGroup } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { AttachmentsContext } from "./controllerContext";
import { useOptionalPromptInputController } from "./controllerContext";
import { LocalAttachmentsContext } from "./attachments";
import {
  LocalReferencedSourcesContext,
  type ReferencedSourcesContext,
} from "./referencedSources";
import type { PromptInputProps } from "./promptInputTypes";
import { usePromptInputDropHandlers } from "./usePromptInputDropHandlers";
import {
  capAndValidateFiles,
  clearAndRevoke,
  convertFilesForSubmit,
  getTextFromForm,
  makeLocalFile,
  parseAcceptPatterns,
  removeByIdAndRevoke,
  revokeUrlIfPresent,
  runSubmit,
  type PromptInputLocalFile,
} from "./promptInputHelpers";

export type { PromptInputMessage, PromptInputProps } from "./promptInputTypes";

export const PromptInput = ({
  className,
  accept,
  multiple,
  globalDrop,
  syncHiddenInput,
  maxFiles,
  maxFileSize,
  onError,
  onSubmit,
  children,
  ...props
}: PromptInputProps) => {
  const controller = useOptionalPromptInputController();
  const usingProvider = Boolean(controller);

  const patterns = useMemo(() => parseAcceptPatterns(accept), [accept]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const [items, setItems] = useState<PromptInputLocalFile[]>([]);
  const files = usingProvider ? controller!.attachments.files : items;

  const [referencedSources, setReferencedSources] = useState<
    (SourceDocumentUIPart & { id: string })[]
  >([]);

  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  const openFileDialogLocal = useCallback(() => inputRef.current?.click(), []);

  const addLocal = useCallback(
    (fileList: File[] | FileList) => {
      const incoming = [...fileList];
      if (incoming.length === 0) {
        return;
      }
      setItems((prev) => {
        const capped = capAndValidateFiles({
          currentCount: prev.length,
          incoming,
          maxFileSize,
          maxFiles,
          onError,
          patterns,
        });
        return [...prev, ...capped.map(makeLocalFile)];
      });
    },
    [maxFiles, maxFileSize, onError, patterns]
  );

  const removeLocal = useCallback(
    (id: string) => setItems((prev) => removeByIdAndRevoke(prev, id)),
    []
  );

  const addWithProviderValidation = useCallback(
    (fileList: File[] | FileList) => {
      const incoming = [...fileList];
      if (incoming.length === 0) {
        return;
      }
      const capped = capAndValidateFiles({
        currentCount: files.length,
        incoming,
        maxFileSize,
        maxFiles,
        onError,
        patterns,
      });
      if (capped.length > 0) {
        controller?.attachments.add(capped);
      }
    },
    [controller, files.length, maxFileSize, maxFiles, onError, patterns]
  );

  const clearAttachments = useCallback(() => {
    if (usingProvider) {
      controller?.attachments.clear();
      return;
    }
    setItems((prev) => clearAndRevoke(prev));
  }, [usingProvider, controller]);

  const clearReferencedSources = useCallback(() => setReferencedSources([]), []);

  const add = usingProvider ? addWithProviderValidation : addLocal;
  const remove = usingProvider ? controller!.attachments.remove : removeLocal;
  const openFileDialog = usingProvider
    ? controller!.attachments.openFileDialog
    : openFileDialogLocal;

  const clear = useCallback(() => {
    clearAttachments();
    clearReferencedSources();
  }, [clearAttachments, clearReferencedSources]);

  useEffect(() => {
    if (!usingProvider) {
      return;
    }
    controller!.__registerFileInput(inputRef, () => inputRef.current?.click());
  }, [usingProvider, controller]);

  useEffect(() => {
    if (syncHiddenInput && inputRef.current && files.length === 0) {
      inputRef.current.value = "";
    }
  }, [files.length, syncHiddenInput]);

  const addFromDrop = useCallback((fileList: FileList) => add(fileList), [add]);
  usePromptInputDropHandlers({ add: addFromDrop, formRef, globalDrop });

  useEffect(
    () => () => {
      if (!usingProvider) {
        for (const file of filesRef.current) {
          revokeUrlIfPresent(file.url);
        }
      }
    },
    [usingProvider]
  );

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.currentTarget.files) {
        add(event.currentTarget.files);
      }
      event.currentTarget.value = "";
    },
    [add]
  );

  const attachmentsCtx = useMemo<AttachmentsContext>(
    () => ({
      add,
      clear: clearAttachments,
      fileInputRef: inputRef,
      files: files.map((item) => ({ ...item, id: item.id })),
      openFileDialog,
      remove,
    }),
    [files, add, remove, clearAttachments, openFileDialog]
  );

  const refsCtx = useMemo<ReferencedSourcesContext>(
    () => ({
      add: (incoming: SourceDocumentUIPart[] | SourceDocumentUIPart) => {
        const array = Array.isArray(incoming) ? incoming : [incoming];
        setReferencedSources((prev) => [
          ...prev,
          ...array.map((s) => ({ ...s, id: nanoid() })),
        ]);
      },
      clear: clearReferencedSources,
      remove: (id: string) =>
        setReferencedSources((prev) => prev.filter((s) => s.id !== id)),
      sources: referencedSources,
    }),
    [referencedSources, clearReferencedSources]
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      const text = getTextFromForm({
        controllerValue: controller?.textInput.value,
        form,
        usingProvider,
      });

      if (!usingProvider) {
        form.reset();
      }

      try {
        const convertedFiles = await convertFilesForSubmit(files);
        const ok = await runSubmit({
          event,
          message: { files: convertedFiles, text },
          onSubmit,
        });
        if (!ok) {
          return;
        }
        clear();
        if (usingProvider) {
          controller?.textInput.clear();
        }
      } catch {
        // Don't clear on error - user may want to retry.
      }
    },
    [usingProvider, controller, files, onSubmit, clear]
  );

  return (
    <LocalAttachmentsContext.Provider value={attachmentsCtx}>
      <LocalReferencedSourcesContext.Provider value={refsCtx}>
        <input
          accept={accept}
          aria-label="Upload files"
          className="hidden"
          multiple={multiple}
          onChange={handleChange}
          ref={inputRef}
          title="Upload files"
          type="file"
        />

        <form
          className={cn("w-full", className)}
          onSubmit={handleSubmit}
          ref={formRef}
          {...props}
        >
          <InputGroup className="overflow-hidden">{children}</InputGroup>
        </form>
      </LocalReferencedSourcesContext.Provider>
    </LocalAttachmentsContext.Provider>
  );
};

