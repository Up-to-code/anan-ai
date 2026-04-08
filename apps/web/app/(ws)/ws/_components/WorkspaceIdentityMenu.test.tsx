import { describe, expect, it } from "vitest";
import { getWorkspaceIdentityActions } from "./WorkspaceIdentityMenu";

describe("getWorkspaceIdentityActions", () => {
  it("routes the account action to the personal workspace area", () => {
    const actions = getWorkspaceIdentityActions({
      accountLabel: "الحساب والأمان",
    });

    expect(actions).toEqual([
      expect.objectContaining({
        key: "account",
        href: "/ws/me",
        label: "الحساب والأمان",
      }),
    ]);
  });
});
