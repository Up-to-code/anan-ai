import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({ audience: "broker" })),
}));

const listProperties = vi.fn(async () => ({
  page: [
    {
      _id: "property-1",
      title: "مالقا ريزيدنس",
      address: "الرياض",
      location: "الملقا، الرياض",
      description: "مشروع سكني فاخر",
      price: 2100000,
      beds: 4,
      baths: 5,
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
      publicationState: "published",
    },
  ],
  isDone: true,
  continueCursor: "",
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    listProperties,
  })),
}));

import WorkspaceProjectsRoute from "./page";

describe("/ws/projects page", () => {
  it("renders the broker/developer-backed projects workspace", async () => {
    const element = await WorkspaceProjectsRoute();
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("محفظة المشاريع");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(listProperties).toHaveBeenCalledWith({
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(markup).toContain("https://images.unsplash.com/photo-1");
  });
});
