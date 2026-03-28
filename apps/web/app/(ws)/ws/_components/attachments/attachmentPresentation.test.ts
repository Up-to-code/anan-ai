import { expect, it } from "vitest";
import {
  formatAttachmentSize,
  getAttachmentPresentationMeta,
  validateSupportedAttachmentFiles,
} from "./attachmentPresentation";

it("classifies image and pdf attachments consistently", () => {
  expect(getAttachmentPresentationMeta({ name: "tower.webp", mime: "image/webp" })).toEqual({
    kind: "image",
    label: "صورة",
  });

  expect(getAttachmentPresentationMeta({ name: "brochure.pdf", mime: "application/pdf" })).toEqual({
    kind: "pdf",
    label: "PDF",
  });
});

it("validates supported attachment files and size limits", () => {
  const validImage = new File(["img"], "tower.png", { type: "image/png" });
  const validPdf = new File(["pdf"], "brochure.pdf", { type: "application/pdf" });
  const invalid = new File(["zip"], "archive.zip", { type: "application/zip" });

  expect(validateSupportedAttachmentFiles([validImage, validPdf])).toBeNull();
  expect(validateSupportedAttachmentFiles([invalid])).toContain("PDF");
});

it("formats attachment sizes for compact previews", () => {
  expect(formatAttachmentSize(2048)).toBe("2 KB");
  expect(formatAttachmentSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
});
