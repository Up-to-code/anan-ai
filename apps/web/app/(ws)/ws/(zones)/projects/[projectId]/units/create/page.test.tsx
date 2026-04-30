import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { UnitCreateFormData } from "@/app/(ws)/ws/public";

const {
  applyProjectUnitBulkActions,
  attachOrganizationAssets,
  getCapturedProps,
  getProjectDossier,
  getProjectDossierByProjectId,
  getProjectWorkspaceDetail,
  notFound,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    applyProjectUnitBulkActions: vi.fn(async () => ({ ok: true, createdUnitIds: ["unit-1"] })),
    attachOrganizationAssets: vi.fn(async () => undefined),
    getProjectDossier: vi.fn(async () => null),
    getProjectDossierByProjectId: vi.fn(async () => ({
      property: {
        _id: "property-1",
        title: "Project Tower",
        address: "Riyadh, Al Malqa",
        location: "Riyadh",
        description: "Property fallback description",
      },
      dossier: {
        _id: "project-1",
        propertyId: "property-1",
        title: "Project Tower",
        summary: "Project summary used as the unit description default.",
        primaryUnitType: "apartment",
        averagePrice: 880000,
        services: ["Parking", "Security"],
        location: {
          countryCode: "SA",
          city: "Riyadh",
          district: "Al Malqa",
        },
      },
      units: [],
      paymentPlans: [{ title: "Developer payment plan", downPayment: 100000 }],
    })),
    notFound: vi.fn(() => {
      throw new Error("notFound");
    }),
    getProjectWorkspaceDetail: vi.fn(async () => null),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("next/navigation", () => ({
  notFound,
}));

vi.mock("../../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("../../../../../_lib/workspaceLocale", () => ({
  getWorkspaceLocale: vi.fn(async () => "en"),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceProjectZone: vi.fn(() => ({
    applyProjectUnitBulkActions,
    getProjectDossier,
    getProjectDossierByProjectId,
    getProjectWorkspaceDetail,
  })),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(async () => ({
    token: "token",
  })),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    attachOrganizationAssets,
  },
}));

vi.mock("@/app/(ws)/ws/_components/AgUi/AgUnitCreateForm", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>AgUnitCreateFormMock</div>;
  },
}));

import CreateProjectUnitPage from "./page";

const unitInput: UnitCreateFormData = {
  name: "Unit A-101",
  location: "Riyadh, Al Malqa",
  unitType: "apartment",
  listingType: "sale",
  price: "880000",
  area: "125",
  rooms: "3",
  baths: "2",
  floor: "8",
  view: "City",
  status: "available",
  description: "A project child unit.",
  adLicenseNumber: "",
  paymentPlanTitle: "Developer payment plan",
  downPayment: "100000",
  handoverAt: "2027-01-01",
  parkingSpaces: "1",
  priceComparison: "unknown",
  comparisonNotes: "",
  expertNotes: "",
  services: ["Parking"],
  images: [{ key: "image-1", url: "https://ufs.sh/f/image-1", name: "floor.jpg" }],
  privatePermitFiles: [],
};

beforeEach(() => {
  applyProjectUnitBulkActions.mockClear();
  attachOrganizationAssets.mockClear();
  getProjectDossier.mockClear();
  getProjectDossierByProjectId.mockClear();
  getProjectWorkspaceDetail.mockClear();
  notFound.mockClear();
  setCapturedProps(null);
});

it("passes project-scoped defaults into the unit creation form", async () => {
  const element = await CreateProjectUnitPage({
    params: Promise.resolve({ projectId: "project-1" }),
  });
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("AgUnitCreateFormMock");
  expect(getCapturedProps()).toEqual(
    expect.objectContaining({
      mode: "project_child",
      title: "Add unit inside project",
      submitLabel: "Save unit",
      cancelHref: "/ws/projects/project-1/units",
      initialData: expect.objectContaining({
        location: "Riyadh، Al Malqa",
        description: "Project summary used as the unit description default.",
        unitType: "apartment",
        price: "880000",
        paymentPlanTitle: "Developer payment plan",
        downPayment: "100000",
        services: ["Parking", "Security"],
        status: "available",
      }),
    }),
  );
});

it("uses the workspace detail resolver before legacy dossier fallbacks", async () => {
  getProjectWorkspaceDetail.mockResolvedValueOnce({
    property: {
      _id: "workspace-property",
      title: "Workspace Project",
      address: "Jeddah, Al Shati",
      location: "Jeddah",
      description: "Workspace property description",
    },
    dossier: {
      _id: "workspace-project",
      propertyId: "workspace-property",
      title: "Workspace Project",
      summary: "Workspace detail summary.",
      primaryUnitType: "villa",
      averagePrice: 1500000,
      services: ["Garden"],
      location: {
        countryCode: "SA",
        city: "Jeddah",
        district: "Al Shati",
      },
    },
    units: [],
    paymentPlans: [],
  });

  const element = await CreateProjectUnitPage({
    params: Promise.resolve({ projectId: "route-id" }),
  });
  renderToStaticMarkup(element);

  expect(getProjectWorkspaceDetail).toHaveBeenCalledWith({ projectId: "route-id" });
  expect(getProjectDossierByProjectId).not.toHaveBeenCalled();
  expect(getCapturedProps()).toEqual(
    expect.objectContaining({
      cancelHref: "/ws/projects/workspace-project/units",
      initialData: expect.objectContaining({
        location: "Jeddah، Al Shati",
        unitType: "villa",
        price: "1500000",
        services: ["Garden"],
      }),
    }),
  );
});

it("creates a child unit under the canonical project and redirects to the unit detail", async () => {
  const element = await CreateProjectUnitPage({
    params: Promise.resolve({ projectId: "project-1" }),
  });
  renderToStaticMarkup(element);

  const props = getCapturedProps() as {
    onSave: (data: UnitCreateFormData) => Promise<{ ok: true; redirectTo: string } | { ok: false }>;
  };
  const result = await props.onSave(unitInput);

  expect(result).toEqual({ ok: true, redirectTo: "/ws/projects/project-1/units/unit-1" });
  expect(applyProjectUnitBulkActions).toHaveBeenCalledWith({
    propertyId: "property-1",
    actions: [
      {
        type: "create",
        unit: expect.objectContaining({
          label: "Unit A-101",
          unitKind: "unit",
          status: "available",
          bedrooms: 3,
          bathrooms: 2,
          sizeSqm: 125,
          floor: "8",
          view: "City",
          price: 880000,
          floorPlanMedia: unitInput.images,
        }),
      },
    ],
  });
  expect(attachOrganizationAssets).toHaveBeenCalledWith("token", {
    keys: ["image-1"],
    attachedEntityType: "project",
    attachedEntityId: "property-1",
    visibilityScope: "organization",
  });
});
