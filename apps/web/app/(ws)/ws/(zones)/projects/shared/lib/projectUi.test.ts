import { describe, expect, it } from "vitest";
import {
  formatProjectHeaderTitle,
  getAvailableProjectDetailModes,
  normalizeProjectDetailMode,
  PROJECT_HEADER_TITLE_MAX_CHARS,
  unitStatusLabels,
  unitStatusTone,
} from "./projectUi";
import type { WorkspaceProject } from "../../types/projectTypes";

const baseProject = {
  inventoryKind: "project",
  units: [],
  canEdit: false,
} as WorkspaceProject;

describe("project UI helpers", () => {
  it("truncates long header titles and preserves short titles", () => {
    expect(formatProjectHeaderTitle("مشروع قصير")).toBe("مشروع قصير");
    const longTitle = "x".repeat(PROJECT_HEADER_TITLE_MAX_CHARS + 4);
    expect(formatProjectHeaderTitle(longTitle)).toBe(`${"x".repeat(PROJECT_HEADER_TITLE_MAX_CHARS)}...`);
  });

  it("normalizes project detail tabs against available modes", () => {
    expect(normalizeProjectDetailMode("units", ["overview", "units"])).toBe("units");
    expect(normalizeProjectDetailMode("analytics", ["overview", "units"])).toBe("overview");
    expect(normalizeProjectDetailMode("bad", ["overview", "analytics"])).toBe("overview");
  });

  it("includes unit mode for projects, unit-bearing records, and editable records", () => {
    expect(getAvailableProjectDetailModes(baseProject)).toEqual(["overview", "units", "analytics"]);
    expect(getAvailableProjectDetailModes({ ...baseProject, inventoryKind: "standalone_unit" })).toEqual([
      "overview",
      "analytics",
    ]);
    expect(getAvailableProjectDetailModes({ ...baseProject, inventoryKind: "standalone_unit", canEdit: true })).toEqual([
      "overview",
      "units",
      "analytics",
    ]);
  });

  it("keeps unit status labels and fallback tone available", () => {
    expect(unitStatusLabels.available).toBe("متاحة");
    expect(unitStatusTone.draft).toContain("workspace-elevated");
  });
});
