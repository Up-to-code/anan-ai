import { describe, expect, it } from "vitest";
import {
  formatWorkspaceOrganizationName,
  getWorkspaceOrganizationDisplay,
} from "./organizationDisplay";

describe("organizationDisplay", () => {
  it("strips brand fragments and repeated separators from organization names", () => {
    expect(formatWorkspaceOrganizationName("  ANAN | Alpha --- Dev  ")).toBe("Alpha Dev");
  });

  it("falls back to a safe label when the cleaned name is empty", () => {
    expect(formatWorkspaceOrganizationName("___ عنان ___")).toBe("مساحة العمل");
  });

  it("builds Arabic-only subtitles for sidebar and navbar chrome", () => {
    expect(
      getWorkspaceOrganizationDisplay({
        name: "Anan | Alpha Dev",
        type: "red",
        status: "active",
        zoneLabel: "المشاريع",
      }),
    ).toEqual({
      name: "Alpha Dev",
      sidebarSubtitle: "المشاريع",
      navbarSubtitle: "مطور · نشط",
    });
  });
});
