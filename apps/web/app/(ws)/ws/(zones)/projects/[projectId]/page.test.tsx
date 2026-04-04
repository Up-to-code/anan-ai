import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { notFound } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

const { resolveWorkspaceProjectDetail } = vi.hoisted(() => ({
  resolveWorkspaceProjectDetail: vi.fn(),
}));

const { listProjectAssetsForViewer, listPropertyViewers } = vi.hoisted(() => ({
  listProjectAssetsForViewer: vi.fn(async () => []),
  listPropertyViewers: vi.fn(async () => []),
}));

vi.mock("next/navigation", () => ({
  notFound,
  useRouter,
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

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
    profile: null,
  })),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    listProjectAssetsForViewer,
  },
}));

vi.mock("@/server/infrastructure/convex/properties/access", () => ({
  convexProjectAccessRepository: {
    listPropertyViewers,
  },
}));

import WorkspaceProjectDetailRoute from "./page";

beforeEach(() => {
  resolveWorkspaceProjectDetail.mockReset();
  listProjectAssetsForViewer.mockClear();
  listPropertyViewers.mockClear();
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

  expect(markup).toContain("تحليل المشروع");
  expect(markup).toContain("تعديل المشروع");
  expect(markup).toContain("إنشاء عرض");
  expect(markup).toContain("لوحة المشروع");
  expect(markup).toContain("بيانات المشروع الأساسية");
  expect(markup).toContain("المزايا والخدمات");
  expect(markup).toContain("مواقف ضيوف");
  expect(markup).toContain("الحالة الحالية");
  expect(markup).toContain("data-slot=\"project-detail-hero\"");
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

  expect(markup).toContain("مشاهدة فقط");
  expect(markup).not.toContain("تعديل المشروع");
  expect(markup).toContain("فتح المحادثات");
  expect(markup).toContain("تصريح خاص بهذه المحادثة");
  expect(markup).toContain("permit.pdf");
  expect(markup).toContain("الملفات والوصول");
  expect(markup).toContain("data-slot=\"project-detail-main\"");
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
