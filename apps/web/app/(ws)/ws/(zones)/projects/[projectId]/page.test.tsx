import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { beforeEach, expect, it, vi } from "vitest";

const { notFound, redirect } = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  }),
}));

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(() => "/ws/projects/project-1"),
}));

const { resolveWorkspaceProjectDetail } = vi.hoisted(() => ({
  resolveWorkspaceProjectDetail: vi.fn(),
}));

const {
  getProjectWorkspaceDetail,
  getProjectDossier,
  listProjectAssetsForViewer,
  listPropertyViewers,
} = vi.hoisted(() => ({
  getProjectWorkspaceDetail: vi.fn(),
  getProjectDossier: vi.fn(async () => null),
  listProjectAssetsForViewer: vi.fn(async () => []),
  listPropertyViewers: vi.fn(async () => []),
}));

vi.mock("next/navigation", () => ({
  notFound,
  redirect,
  usePathname,
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useQuery: () => undefined,
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

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceProjectZone: vi.fn(() => ({
    getProjectWorkspaceDetail,
    getProjectDossier,
  })),
}));

const baseProperty = {
  _id: "property-1",
  title: "برج الاختبار",
  address: "الرياض",
  location: "الرياض",
  description: "وصف",
  price: 2200000,
  beds: 4,
  baths: 4,
  sqft: 380,
  projectReadinessStatus: "data_complete",
  publicationState: "draft",
  media: [{ key: "file-1", url: "https://images.unsplash.com/photo-1", name: "cover.jpg" }],
  body: {
    presentation: {
      descriptionShort: "واجهة سكنية هادئة",
      amenities: ["مواقف ضيوف", "نادي"],
      hasParking: true,
      parkingSpaces: 2,
    },
  },
};

function buildDossierDetail(title = "برج الاختبار") {
  return {
    property: baseProperty,
    dossier: {
      _id: "project-1",
      title,
      summary: "ملف مشروع متكامل",
      expectedUnitCountLabel: "24 وحدة",
      unitTypeMix: ["شقق", "دوبلكس"],
      primaryUnitType: "شقق",
      targetAudience: "عائلات",
      services: ["مواقف", "نادي"],
      projectType: "ready_property",
      salesMode: "developer_direct",
      requestedVisibility: "private",
    },
    units: [
      {
        _id: "unit-1",
        label: "A-101",
        unitKind: "unit",
        status: "available",
        bedrooms: 3,
        bathrooms: 2,
        sizeSqm: 145,
        floor: "5",
        view: "حديقة",
        price: 1250000,
        floorPlanMedia: [],
      },
    ],
    documents: [{ status: "approved" }],
    paymentPlans: [],
    adLicenses: [],
    brokerAuthorizations: [],
  };
}

import ProjectDetailLayout from "./layout";
import WorkspaceProjectDetailRoute from "./page";
import WorkspaceProjectUnitsRoute from "./units/page";

async function renderWithLayout(children: ReactNode, projectId = "project-1") {
  const element = await ProjectDetailLayout({
    params: Promise.resolve({ projectId }),
    children,
  });
  return renderToStaticMarkup(element);
}

beforeEach(() => {
  getProjectWorkspaceDetail.mockResolvedValue(buildDossierDetail());
  getProjectDossier.mockResolvedValue(null);
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: baseProperty,
    accessMode: "owner",
    canEdit: true,
  });
  listProjectAssetsForViewer.mockClear();
  listPropertyViewers.mockClear();
  notFound.mockClear();
  redirect.mockClear();
  usePathname.mockReturnValue("/ws/projects/project-1");
});

it("renders the project layout chrome and overview content", async () => {
  const page = await WorkspaceProjectDetailRoute({
    params: Promise.resolve({ projectId: "project-1" }),
  });
  const markup = await renderWithLayout(page);

  expect(markup).toContain("تحليل المشروع");
  expect(markup).toContain("تعديل المشروع");
  expect(markup).toContain("نشر المشروع");
  expect(markup).toContain("حذف المشروع");
  expect(markup).toContain("نظرة عامة");
  expect(markup).toContain("الوحدات");
  expect(markup).toContain("التحليلات");
  expect(markup).toContain("/ws/projects/project-1/units");
  expect(markup).toContain("/ws/projects/project-1/analytics");
  expect(markup).toContain("data-slot=\"project-detail-hero\"");
});

it("renders shared projects as read-only in the layout", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: baseProperty,
    accessMode: "shared",
    canEdit: false,
  });
  const page = await WorkspaceProjectDetailRoute({
    params: Promise.resolve({ projectId: "project-1" }),
  });
  const markup = await renderWithLayout(page);

  expect(markup).toContain("مشاهدة فقط");
  expect(markup).toContain("تحليل المشروع");
  expect(markup).not.toContain("تعديل المشروع");
  expect(markup).not.toContain("نشر المشروع");
  expect(markup).not.toContain("حذف المشروع");
});

it("renders nested units content without overview content", async () => {
  usePathname.mockReturnValue("/ws/projects/project-1/units");
  const page = await WorkspaceProjectUnitsRoute({
    params: Promise.resolve({ projectId: "project-1" }),
  });
  const markup = await renderWithLayout(page);

  expect(markup).toContain("data-slot=\"project-detail-units\"");
  expect(markup).toContain("A-101");
  expect(markup).not.toContain("data-slot=\"project-detail-main\"");
});

it("lets child routes render when project chrome cannot resolve", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue(null);

  const markup = await renderWithLayout(<div data-slot="child-create-route">create unit</div>, "missing-project");

  expect(markup).toContain("data-slot=\"child-create-route\"");
  expect(markup).not.toContain("نظرة عامة");
});

it("normalizes query tab URLs to nested routes and returns not found for inaccessible projects", async () => {
  await expect(
    WorkspaceProjectDetailRoute({
      params: Promise.resolve({ projectId: "project-1" }),
      searchParams: Promise.resolve({ tab: "units" }),
    }),
  ).rejects.toThrow("NEXT_REDIRECT:/ws/projects/project-1/units");

  resolveWorkspaceProjectDetail.mockResolvedValue(null);
  await expect(
    WorkspaceProjectDetailRoute({
      params: Promise.resolve({ projectId: "missing" }),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
});
