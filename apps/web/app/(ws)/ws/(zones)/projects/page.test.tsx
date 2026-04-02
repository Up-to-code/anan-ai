import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
    replace: vi.fn(),
    push: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter,
}));

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
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("المشاريع");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("تحليل");
    expect(markup).toContain("فتح التفاصيل");
    expect(listProperties).toHaveBeenCalledWith({
      paginationOpts: { cursor: null, numItems: 100 },
    });
    expect(markup).toContain("https://images.unsplash.com/photo-1");
  });
});
