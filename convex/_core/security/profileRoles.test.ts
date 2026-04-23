import { describe, expect, it } from "vitest";
import { normalizeUserProfileRoleState } from "./profileRoles";

describe("profileRoles", () => {
  it("normalizes legacy RED values into canonical developer fields", () => {
    const result = normalizeUserProfileRoleState({
      role: "RED",
      requestedRole: "RED",
      roleStatus: "approved",
      REDId: "red-1" as never,
    });

    expect(result).toEqual({
      role: "developer",
      requestedRole: undefined,
      roleApprovalStatus: "approved",
      brokerId: undefined,
      developerId: "red-1",
    });
  });

  it("maps legacy admin roles into business user state", () => {
    const result = normalizeUserProfileRoleState({
      role: "admin",
      roleApprovalStatus: "approved",
      brokerId: "broker-1" as never,
      developerId: "red-1" as never,
    });

    expect(result.role).toBe("user");
    expect(result.brokerId).toBeUndefined();
    expect(result.developerId).toBeUndefined();
  });
});
