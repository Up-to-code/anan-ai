import { expect, it } from "vitest";
import {
  getAttachmentValidationMessage,
  getQuickActionUnavailableMessage,
} from "./attachmentCopy";

it("returns localized attachment validation messages", () => {
  expect(getAttachmentValidationMessage("unsupported_type", "ar")).toContain("PDF");
  expect(getAttachmentValidationMessage("unsupported_type", "en")).toContain("supported");
});

it("returns localized quick action disabled guidance", () => {
  expect(getQuickActionUnavailableMessage("offer", "ar")).toContain("عرض خاص");
  expect(getQuickActionUnavailableMessage("project", "en")).toContain("project");
});
