import { describe, expect, it } from "vitest";
import { buildPresetPermissions, permissionLabel } from "./catalog";

describe("ApiKeysWorkspace catalog helpers", () => {
  it("builds read preset permissions from the centralized catalog", () => {
    const permissions = buildPresetPermissions("read");

    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions.every((permission) => permission.action === "read")).toBe(true);
  });

  it("builds localized permission labels", () => {
    expect(permissionLabel({ resource: "clients", action: "read" })).toContain("العملاء");
    expect(permissionLabel({ resource: "clients", action: "read" })).toContain("قراءة");
  });
});
