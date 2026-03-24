import { describe, expect, it } from "vitest";
import {
  docsNavGroups,
  docsPageOrder,
  getDocsPage,
  getDocsPageBySlug,
  getDocsPageSiblings,
  getDocsPageSlug,
} from "./registry";

describe("private docs registry", () => {
  it("keeps the expected handbook page order for previous/next navigation", () => {
    expect(docsPageOrder).toEqual([
      "overview",
      "architecture",
      "zones",
      "data-and-contracts",
      "security",
      "convex",
      "web",
      "admin",
      "mobile",
      "ai-and-channels",
      "workflow",
      "add-table",
      "add-web-domain",
      "add-channel",
      "add-agent",
      "audit-overview",
      "convex-review",
      "web-review",
      "documentation-gaps",
      "remediation-roadmap",
    ]);
    expect(getDocsPageSiblings("audit-overview")).toEqual({
      previousPageKey: "add-agent",
      nextPageKey: "convex-review",
    });
  });

  it("exposes the handbook groups and resolves pages by slug", () => {
    expect(docsNavGroups[0]?.items).toContain("overview");
    expect(docsNavGroups[1]?.items).toContain("web");
    expect(docsNavGroups[2]?.items).toContain("add-agent");
    expect(docsNavGroups[3]?.items).toContain("remediation-roadmap");
    expect(getDocsPage("documentation-gaps").href).toBe("/docs/documentation-gaps");
    expect(getDocsPage("overview").deepSources?.[0]?.path).toBe("docs/handbook/README.md");
    expect(getDocsPageSlug("ai-and-channels")).toBe("ai-and-channels");
    expect(getDocsPageBySlug("add-web-domain")?.key).toBe("add-web-domain");
  });
});
