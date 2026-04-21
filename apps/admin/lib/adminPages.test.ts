import { describe, expect, it } from "vitest";
import {
  getActiveAdminPage,
  getAdminPageOperationHref,
  getAdminPageTabs,
} from "./adminPages";

describe("adminPages registry", () => {
  it("resolves MVP operation hrefs", () => {
    expect(getAdminPageOperationHref("overview", "list")).toBe("/overview");
    expect(getAdminPageOperationHref("verifications", "detail", "request-7")).toBe("/verifications/request-7");
  });

  it("builds tabs from the registry ordering", () => {
    const tabs = getAdminPageTabs(["overview", "verifications"]);

    expect(tabs.map((tab) => tab.href)).toEqual(["/overview", "/verifications"]);
  });

  it("finds the active admin page from nested routes", () => {
    expect(getActiveAdminPage("/verifications/request-1").id).toBe("verifications");
    expect(getActiveAdminPage("/unknown").id).toBe("overview");
  });
});
