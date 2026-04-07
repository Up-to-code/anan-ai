import { describe, expect, it } from "vitest";
import {
  adminDomainTabs,
  getActiveAdminPage,
  getAdminCreateRouteTabs,
  getAdminEntityRouteTabs,
  getAdminPageOperationHref,
  getAdminPageTabs,
} from "./adminPages";

describe("adminPages registry", () => {
  it("resolves CRUD operation hrefs for partner ops entities", () => {
    expect(getAdminPageOperationHref("organizations", "create")).toBe("/organizations/new");
    expect(getAdminPageOperationHref("organizations", "detail", "org-7")).toBe("/organizations/org-7");
    expect(getAdminPageOperationHref("users", "edit", "user-2")).toBe("/users/user-2/edit");
    expect(getAdminPageOperationHref("offers", "delete", "offer-8")).toBe("/offers/offer-8/delete");
  });

  it("builds tabs from the registry ordering", () => {
    const tabs = getAdminPageTabs(adminDomainTabs.partnerOps);

    expect(tabs.map((tab) => tab.href)).toEqual([
      "/organizations",
      "/users",
      "/verifications",
      "/offers",
    ]);
  });

  it("builds entity lifecycle tabs from the registry", () => {
    expect(getAdminEntityRouteTabs("organizations", "org-7").map((tab) => tab.href)).toEqual([
      "/organizations",
      "/organizations/org-7",
      "/organizations/org-7/edit",
      "/organizations/org-7/delete",
    ]);

    expect(getAdminCreateRouteTabs("users").map((tab) => tab.href)).toEqual([
      "/users",
      "/users/new",
    ]);
  });

  it("finds the active admin page from nested routes", () => {
    expect(getActiveAdminPage("/verifications/request-1").id).toBe("verifications");
    expect(getActiveAdminPage("/ai-settings/models/model-1/edit").id).toBe("ai-models");
  });
});
