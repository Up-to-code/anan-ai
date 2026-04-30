import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { UnitCreateFormData } from "@/app/(ws)/ws/public";

const {
  createProperty,
  saveProjectDossierDraft,
  saveProjectUnits,
  saveProjectPaymentPlans,
  saveProjectComplianceDocuments,
  saveProjectAdLicense,
  attachOrganizationAssets,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    createProperty: vi.fn(async () => "unit-property"),
    saveProjectDossierDraft: vi.fn(async () => ({ ok: true, dossierId: "unit-dossier" })),
    saveProjectUnits: vi.fn(async () => ({ ok: true })),
    saveProjectPaymentPlans: vi.fn(async () => ({ ok: true })),
    saveProjectComplianceDocuments: vi.fn(async () => ({ ok: true })),
    saveProjectAdLicense: vi.fn(async () => ({ ok: true })),
    attachOrganizationAssets: vi.fn(async () => undefined),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("../../../../_lib/workspaceLocale", () => ({
  getWorkspaceLocale: vi.fn(async () => "en"),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    createProperty,
  })),
  getWorkspaceProjectZone: vi.fn(() => ({
    saveProjectDossierDraft,
    saveProjectUnits,
    saveProjectPaymentPlans,
    saveProjectComplianceDocuments,
    saveProjectAdLicense,
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

import CreateUnitPage from "./page";

const unitInput: UnitCreateFormData = {
  name: "Unit A-101",
  location: "Riyadh, Al Malqa",
  unitType: "apartment",
  listingType: "sale",
  price: "1,250,000",
  area: "145",
  rooms: "3",
  baths: "2",
  floor: "5",
  view: "Garden",
  status: "available",
  description: "A ready unit with strong sales appeal.",
  adLicenseNumber: "AD-UNIT-1",
  paymentPlanTitle: "Primary unit payment plan",
  downPayment: "150,000",
  handoverAt: "2026-12-31",
  parkingSpaces: "1",
  priceComparison: "fair_market",
  comparisonNotes: "Aligned with nearby ready units.",
  expertNotes: "Good match for investor leads.",
  services: ["Parking", "Security"],
  images: [{ key: "image-1", url: "https://ufs.sh/f/image-1", name: "unit.jpg" }],
  privatePermitFiles: [{ key: "permit-1", url: "https://ufs.sh/f/permit-1", name: "permit.pdf" }],
};

beforeEach(() => {
  createProperty.mockClear();
  saveProjectDossierDraft.mockClear();
  saveProjectUnits.mockClear();
  saveProjectPaymentPlans.mockClear();
  saveProjectComplianceDocuments.mockClear();
  saveProjectAdLicense.mockClear();
  attachOrganizationAssets.mockClear();
  setCapturedProps(null);
});

it("passes standalone unit create copy into the form", async () => {
  const element = await CreateUnitPage();
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("AgUnitCreateFormMock");
  expect(getCapturedProps()).toEqual(
    expect.objectContaining({
      title: "Create a standalone unit",
      description: "Add one saleable unit with the essential details, then save it into the same Anan inventory pipeline.",
      submitLabel: "Save unit",
      cancelHref: "/ws/projects/create",
    }),
  );
});

it("creates a property, dossier, and one unit through server-backed project services", async () => {
  const element = await CreateUnitPage();
  renderToStaticMarkup(element);

  const props = getCapturedProps() as {
    onSave: (data: UnitCreateFormData) => Promise<{ ok: true; redirectTo: string } | { ok: false }>;
  };
  const result = await props.onSave(unitInput);

  expect(result).toEqual({ ok: true, redirectTo: "/ws/projects/unit-dossier/units" });
  expect(createProperty).toHaveBeenCalledWith(expect.objectContaining({
    title: "Unit A-101",
    address: "Riyadh, Al Malqa",
    price: 1250000,
    sqft: 145,
    media: unitInput.images,
    publicationState: "draft",
    body: {
      presentation: expect.objectContaining({
        expertMetadata: expect.objectContaining({
          assetType: "apartment",
          priceComparison: "fair_market",
          services: ["Parking", "Security"],
        }),
      }),
    },
  }));
  expect(saveProjectDossierDraft).toHaveBeenCalledWith(expect.objectContaining({
    propertyId: "unit-property",
    inventoryKind: "standalone_unit",
  }));
  expect(saveProjectUnits).toHaveBeenCalledWith({
    propertyId: "unit-property",
    units: [expect.objectContaining({
      label: "Unit A-101",
      unitKind: "unit",
      bedrooms: 3,
      bathrooms: 2,
      sizeSqm: 145,
      floor: "5",
      view: "Garden",
      price: 1250000,
    })],
  });
  expect(saveProjectPaymentPlans).toHaveBeenCalledWith(expect.objectContaining({ propertyId: "unit-property" }));
  expect(saveProjectComplianceDocuments).toHaveBeenCalledWith(expect.objectContaining({ propertyId: "unit-property" }));
  expect(saveProjectAdLicense).toHaveBeenCalledWith(expect.objectContaining({ propertyId: "unit-property" }));
  expect(attachOrganizationAssets).toHaveBeenCalledTimes(2);
});

it("returns validation feedback without creating records when required unit fields are missing", async () => {
  const element = await CreateUnitPage();
  renderToStaticMarkup(element);

  const props = getCapturedProps() as {
    onSave: (data: UnitCreateFormData) => Promise<{ ok: true; redirectTo: string } | { ok: false }>;
  };
  const result = await props.onSave({ ...unitInput, name: "", price: "" });

  expect(result.ok).toBe(false);
  expect(createProperty).not.toHaveBeenCalled();
  expect(saveProjectUnits).not.toHaveBeenCalled();
});
