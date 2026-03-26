import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const { resolveWorkspaceProjectDetail } = vi.hoisted(() => ({
  resolveWorkspaceProjectDetail: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  })),
}));

vi.mock("@/server/domains/workspace/properties/detail", () => ({
  resolveWorkspaceProjectDetail,
}));

import WorkspaceProjectDetailRoute from "./page";

beforeEach(() => {
  resolveWorkspaceProjectDetail.mockReset();
  notFound.mockClear();
});

it("renders the owner project detail page", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      sqft: 380,
      body: {
        presentation: {
          descriptionShort: "واجهة سكنية هادئة",
          amenities: ["مواقف ضيوف", "نادي"],
          hasParking: true,
          parkingSpaces: 2,
          privatePermitSummary: "سري",
          privatePermitFiles: [{ key: "permit-1", url: "https://files.example.com/permit.pdf", name: "permit.pdf" }],
          privatePermitVisibility: "conversation_only",
        },
      },
      publicationState: "published",
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
    },
    accessMode: "owner",
    canEdit: true,
  });

  const element = await WorkspaceProjectDetailRoute({
    params: Promise.resolve({ projectId: "property-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("تعديل المشروع");
  expect(markup).toContain("حقائق المشروع");
  expect(markup).toContain("المزايا والخدمات");
  expect(markup).toContain("مواقف ضيوف");
  expect(markup).toContain("المستندات الخاصة لا تظهر هنا بشكل عام");
});

it("renders shared projects as read-only", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      sqft: 380,
      body: {
        presentation: {
          descriptionShort: "واجهة سكنية هادئة",
          amenities: ["مواقف ضيوف", "نادي"],
          hasParking: true,
          parkingSpaces: 2,
          privatePermitSummary: "هذا التصريح خاص بهذه المحادثة",
          privatePermitFiles: [{ key: "permit-1", url: "https://files.example.com/permit.pdf", name: "permit.pdf" }],
          privatePermitVisibility: "conversation_only",
        },
      },
      publicationState: "draft",
      media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
    },
    accessMode: "shared",
    canEdit: false,
  });

  const element = await WorkspaceProjectDetailRoute({
    params: Promise.resolve({ projectId: "property-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("مشاهدة مشتركة");
  expect(markup).not.toContain("تعديل المشروع");
  expect(markup).toContain("فتح المحادثات");
  expect(markup).toContain("تصريح خاص بهذه المحادثة");
  expect(markup).toContain("permit.pdf");
});

it("returns not found when the project is not accessible", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue(null);

  await expect(
    WorkspaceProjectDetailRoute({
      params: Promise.resolve({ projectId: "property-404" }),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");

  expect(notFound).toHaveBeenCalled();
});
