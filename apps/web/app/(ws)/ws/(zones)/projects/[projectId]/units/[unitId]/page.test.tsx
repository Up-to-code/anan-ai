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

const { getProjectDossier } = vi.hoisted(() => ({
  getProjectDossier: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("../../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "broker",
    ownerContext: { ownerType: "broker", ownerId: "broker-1" },
  })),
}));

vi.mock("@/server/domains/workspace/properties/detail", () => ({
  resolveWorkspaceProjectDetail,
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceProjectZone: vi.fn(() => ({
    getProjectDossier,
  })),
}));

import WorkspaceUnitDetailRoute from "./page";

beforeEach(() => {
  notFound.mockClear();
  resolveWorkspaceProjectDetail.mockReset();
  getProjectDossier.mockReset();
});

it("renders a dossier-backed unit detail page", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض، العليا",
      description: "وصف المشروع",
      price: 2200000,
      beds: 4,
      baths: 4,
      sqft: 380,
      publicationState: "draft",
      projectReadinessStatus: "data_complete",
      media: [{ key: "cover-1", url: "https://images.example.com/cover.jpg", name: "cover.jpg" }],
    },
    accessMode: "owner",
  });
  getProjectDossier.mockResolvedValue({
    units: [
      {
        _id: "unit-1",
        dossierId: "dossier-1",
        propertyId: "property-1",
        label: "A-101",
        unitKind: "unit",
        status: "available",
        bedrooms: 3,
        bathrooms: 4,
        sizeSqm: 180,
        floor: "12",
        view: "شمال",
        price: 1500000,
        floorPlanMedia: [{ key: "plan-1", url: "https://images.example.com/plan.jpg", name: "plan.jpg" }],
        createdAt: 1,
        updatedAt: 1,
      },
    ],
    paymentPlans: [{ title: "خطة مرنة", downPayment: 150000, status: "active" }],
    documents: [{ status: "approved" }],
    adLicenses: [{ status: "pending" }],
    readiness: null,
  });

  const element = await WorkspaceUnitDetailRoute({
    params: Promise.resolve({ projectId: "property-1", unitId: "unit-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("A-101");
  expect(markup).toContain("1,500,000 ر.س");
  expect(markup).toContain("180 م²");
  expect(markup).toContain("الدور");
  expect(markup).toContain("شمال");
  expect(markup).toContain("خطة مرنة");
  expect(markup).toContain("/ws/projects/property-1");
});

it("returns not found when the unit is missing", async () => {
  resolveWorkspaceProjectDetail.mockResolvedValue({
    property: {
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      description: "وصف المشروع",
      price: 2200000,
      beds: 4,
      baths: 4,
      media: [],
    },
    accessMode: "owner",
  });
  getProjectDossier.mockResolvedValue({ units: [] });

  await expect(
    WorkspaceUnitDetailRoute({
      params: Promise.resolve({ projectId: "property-1", unitId: "missing-unit" }),
    }),
  ).rejects.toThrow("NEXT_NOT_FOUND");

  expect(notFound).toHaveBeenCalled();
});
