import { describe, expect, it } from "vitest";
import { adminNavGroups } from "@/lib/adminNavigation";
import { resolveAdminSidebarGroupState } from "./sidebarState";

describe("resolveAdminSidebarGroupState", () => {
  it("opens the active group even when stored state says closed", () => {
    const state = resolveAdminSidebarGroupState(adminNavGroups, "/verifications/request-1", {
      partner_ops: false,
    });

    expect(state.partner_ops).toBe(true);
  });

  it("falls back to the group default when no stored state exists", () => {
    const state = resolveAdminSidebarGroupState(adminNavGroups, "/settings/team");

    expect(state.command_center).toBe(true);
    expect(state.settings).toBe(true);
  });
});
