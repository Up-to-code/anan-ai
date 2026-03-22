"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

function useFormDropHandlers(options: {
  formRef: RefObject<HTMLFormElement | null>;
  enabled: boolean;
  add: (files: FileList) => void;
}) {
  const { formRef, enabled, add } = options;

  useEffect(() => {
    const form = formRef.current;
    if (!enabled || !form) {
      return;
    }

    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
      }
    };
    const onDrop = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
      }
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        add(event.dataTransfer.files);
      }
    };

    form.addEventListener("dragover", onDragOver);
    form.addEventListener("drop", onDrop);
    return () => {
      form.removeEventListener("dragover", onDragOver);
      form.removeEventListener("drop", onDrop);
    };
  }, [enabled, formRef, add]);
}

function useDocumentDropHandlers(options: {
  enabled: boolean;
  add: (files: FileList) => void;
}) {
  const { enabled, add } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
      }
    };
    const onDrop = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes("Files")) {
        event.preventDefault();
      }
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        add(event.dataTransfer.files);
      }
    };

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [enabled, add]);
}

export function usePromptInputDropHandlers(options: {
  formRef: RefObject<HTMLFormElement | null>;
  globalDrop: boolean | undefined;
  add: (files: FileList) => void;
}) {
  const { formRef, globalDrop, add } = options;
  useFormDropHandlers({ add, enabled: !globalDrop, formRef });
  useDocumentDropHandlers({ add, enabled: Boolean(globalDrop) });
}
