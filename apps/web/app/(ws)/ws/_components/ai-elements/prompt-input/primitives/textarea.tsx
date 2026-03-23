"use client";

import type {
  ChangeEvent,
  ClipboardEventHandler,
  ComponentProps,
  KeyboardEventHandler,
} from "react";
import { useCallback, useState } from "react";
import { InputGroupTextarea } from "../../ui/input-group";
import { cn } from "@/lib/utils";
import { useOptionalPromptInputController } from "../controllerContext";
import { usePromptInputAttachments } from "../attachments";

export type PromptInputTextareaProps = ComponentProps<typeof InputGroupTextarea>;

function collectClipboardFiles(items: DataTransferItemList | undefined | null) {
  if (!items) return [];
  const files: File[] = [];
  for (const item of items) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (!file) continue;
    files.push(file);
  }
  return files;
}

export const PromptInputTextarea = ({
  onChange,
  onKeyDown,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputTextareaProps) => {
  const controller = useOptionalPromptInputController();
  const attachments = usePromptInputAttachments();
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === "Enter") {
        if (isComposing || event.nativeEvent.isComposing) {
          return;
        }
        if (event.shiftKey) {
          return;
        }
        event.preventDefault();

        const { form } = event.currentTarget;
        const submitButton = form?.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement | null;
        if (submitButton?.disabled) {
          return;
        }

        form?.requestSubmit();
      }

      if (
        event.key === "Backspace" &&
        event.currentTarget.value === "" &&
        attachments.files.length > 0
      ) {
        event.preventDefault();
        const lastAttachment = attachments.files.at(-1);
        if (lastAttachment) {
          attachments.remove(lastAttachment.id);
        }
      }
    },
    [onKeyDown, isComposing, attachments]
  );

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      const files = collectClipboardFiles(event.clipboardData?.items);
      if (files.length > 0) {
        event.preventDefault();
        attachments.add(files);
      }
    },
    [attachments]
  );

  const handleCompositionEnd = useCallback(() => setIsComposing(false), []);
  const handleCompositionStart = useCallback(() => setIsComposing(true), []);

  const controlledProps = controller
    ? {
        onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
          controller.textInput.setInput(event.currentTarget.value);
          onChange?.(event);
        },
        value: controller.textInput.value,
      }
    : { onChange };

  return (
    <InputGroupTextarea
      className={cn(
        "max-h-48 min-h-16 overflow-x-hidden overflow-y-auto [field-sizing:fixed]",
        className,
      )}
      name="message"
      onCompositionEnd={handleCompositionEnd}
      onCompositionStart={handleCompositionStart}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      wrap="soft"
      {...props}
      {...controlledProps}
    />
  );
};
