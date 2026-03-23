"use client";

import type { ComponentProps } from "react";
import { useCallback } from "react";
import { ImageIcon, Monitor } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { usePromptInputAttachments } from "./attachments";
import { captureScreenshot } from "./screenshot";

type DropdownMenuSelectEvent = Parameters<
  NonNullable<ComponentProps<typeof DropdownMenuItem>["onSelect"]>
>[0];

export type PromptInputActionAddAttachmentsProps = ComponentProps<
  typeof DropdownMenuItem
> & {
  label?: string;
};

export const PromptInputActionAddAttachments = ({
  label = "Add photos or files",
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  const handleSelect = useCallback(
    (event: DropdownMenuSelectEvent) => {
      event.preventDefault();
      attachments.openFileDialog();
    },
    [attachments]
  );

  return (
    <DropdownMenuItem {...props} onSelect={handleSelect}>
      <ImageIcon className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};

export type PromptInputActionAddScreenshotProps = ComponentProps<
  typeof DropdownMenuItem
> & {
  label?: string;
};

export const PromptInputActionAddScreenshot = ({
  label = "Take screenshot",
  onSelect,
  ...props
}: PromptInputActionAddScreenshotProps) => {
  const attachments = usePromptInputAttachments();

  const handleSelect = useCallback(
    async (event: DropdownMenuSelectEvent) => {
      onSelect?.(event);
      if (event.defaultPrevented) {
        return;
      }

      try {
        const screenshot = await captureScreenshot();
        if (screenshot) {
          attachments.add([screenshot]);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "AbortError")
        ) {
          return;
        }
        throw error;
      }
    },
    [onSelect, attachments]
  );

  return (
    <DropdownMenuItem {...props} onSelect={handleSelect}>
      <Monitor className="mr-2 size-4" />
      {label}
    </DropdownMenuItem>
  );
};
