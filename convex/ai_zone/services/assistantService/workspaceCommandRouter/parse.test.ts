import { describe, expect, it } from "vitest";
import {
  extractLimit,
  extractProjectId,
  extractSearchTerm,
  isConfirmationMessage,
  parseWorkspaceCommand,
} from "./parse";

describe("workspaceCommandRouter parse helpers", () => {
  it("normalizes Arabic digit limits", () => {
    expect(extractLimit("هات ٣٠ عميل")).toBe(30);
  });

  it("extracts quoted search terms before loose parsing", () => {
    expect(extractSearchTerm('ابحث في المشاريع عن "النرجس"')).toBe("النرجس");
  });

  it("extracts project ids from explicit delete requests", () => {
    expect(extractProjectId("احذف المشروع project_123")).toBe("project_123");
  });

  it("parses search project requests with limits", () => {
    expect(parseWorkspaceCommand('ابحث في المشاريع عن "الياسمين" 5')).toEqual({
      kind: "search_projects",
      limit: 5,
      searchTerm: "الياسمين",
    });
  });

  it("matches explicit confirmation messages", () => {
    expect(isConfirmationMessage("نعم أكد الحذف")).toBe(true);
  });
});
