import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const { requireWorkspaceData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
}));

const { getWorkspacePropertyZone, getWorkspaceProjectZone } = vi.hoisted(() => ({
  getWorkspacePropertyZone: vi.fn(),
  getWorkspaceProjectZone: vi.fn(),
}));

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

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useQuery: () => undefined,
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData,
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
const getProjectDossier = vi.fn(async () => null);
const getProjectsWorkspace = vi.fn(async () => ({
  page: [
    {
      property: {
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
      dossier: null,
      units: [],
      paymentPlans: [],
      documents: [],
      adLicenses: [],
      brokerAuthorizations: [],
    },
  ],
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: getWorkspacePropertyZone.mockImplementation(() => ({
    listProperties,
  })),
  getWorkspaceProjectZone: getWorkspaceProjectZone.mockImplementation(() => ({
    getProjectDossier,
    getProjectsWorkspace,
  })),
}));

import WorkspaceProjectsRoute from "./page";

describe("/ws/projects page", () => {
  it("renders the broker/developer-backed projects workspace", async () => {
    requireWorkspaceData.mockResolvedValue({ audience: "broker", ownerContext: { ownerType: "broker", ownerId: "broker-1" } });
    const element = await WorkspaceProjectsRoute();
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("المشاريع");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(getWorkspaceProjectZone).toHaveBeenCalledWith("broker", {
      ownerType: "broker",
      ownerId: "broker-1",
    });
    expect(getProjectsWorkspace).toHaveBeenCalled();
    expect(markup).toContain("https://images.unsplash.com/photo-1");
  });

  it("still renders when ownerContext is missing and the workspace audience remains broker", async () => {
    requireWorkspaceData.mockResolvedValue({ audience: "broker", ownerContext: null });
    const element = await WorkspaceProjectsRoute();
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("المشاريع");
    expect(getWorkspaceProjectZone).toHaveBeenCalledWith("broker", null);
    expect(getProjectsWorkspace).toHaveBeenCalled();
  });
});
