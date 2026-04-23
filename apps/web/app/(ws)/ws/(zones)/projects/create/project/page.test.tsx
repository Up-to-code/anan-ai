import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { ProjectFormData } from "@/app/(ws)/ws/public";

const {
  createProperty,
  requireWorkspaceData,
  saveProjectDossierDraft,
  saveProjectUnits,
  saveProjectPaymentPlans,
  saveProjectComplianceDocuments,
  saveProjectAdLicense,
  saveProjectBrokerAuthorization,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    createProperty: vi.fn(async () => "property-new"),
    requireWorkspaceData: vi.fn(async () => ({
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
    })),
    saveProjectDossierDraft: vi.fn(async () => ({ ok: true, propertyId: "property-new", dossierId: "project-new" })),
    saveProjectUnits: vi.fn(async () => ({ ok: true })),
    saveProjectPaymentPlans: vi.fn(async () => ({ ok: true })),
    saveProjectComplianceDocuments: vi.fn(async () => ({ ok: true })),
    saveProjectAdLicense: vi.fn(async () => ({ ok: true })),
    saveProjectBrokerAuthorization: vi.fn(async () => ({ ok: true })),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("../../../../_lib/workspaceLocale", () => ({
  getWorkspaceLocale: vi.fn(async () => "ar"),
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
    saveProjectBrokerAuthorization,
  })),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(async () => ({
    token: "token",
  })),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    attachOrganizationAssets: vi.fn(async () => undefined),
  },
}));

vi.mock("../../shared/forms/ProjectFormScreen", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>ProjectFormScreenMock</div>;
  },
}));

import CreateProjectPage from "./page";

const uploadedImage = {
  key: "file-1",
  url: "https://ufs.sh/f/file-1",
  name: "cover.jpg",
  size: 1200,
  mime: "image/jpeg",
};

const formInput = {
  name: "مشروع تجريبي",
  price: "3,200,000 ر.س",
  location: "الرياض",
  description: "تفاصيل المشروع",
  shortDescription: "نبذة قصيرة",
  amenitiesText: "مسبح، نادي",
  hasParking: true,
  parkingSpaces: "2",
  coverImageKey: "file-1",
  galleryDisplayMode: "fit",
  galleryAspectRatio: "square",
  privatePermitSummary: "تصريح للطرف المستلم فقط",
  privatePermitFiles: [{ key: "permit-1", url: "https://ufs.sh/f/permit-1", name: "permit.pdf" }],
  expertProjectType: "residential",
  projectScale: "180 وحدة",
  productMix: "شقق ودوبلكس",
  primaryUnitType: "apartment",
  sizeRange: "95-240 م²",
  priceComparison: "fair_market",
  comparisonNotes: "مقارب للمشاريع المحيطة.",
  expertNotes: "مناسب للمشترين الباحثين عن تسليم قريب.",
  services: ["مواقف", "أمن"],
  rooms: "4",
  baths: "5",
  area: "380",
  status: "active",
  clientVisibility: "public",
  images: [uploadedImage],
  video: null,
  brokerId: null,
  adLicenseNumber: "AD-001",
  adLicenseStatus: null,
  dossier: {
    projectType: "ready_property",
    lifecycleStage: "draft",
    salesMode: "developer_direct",
    city: "الرياض",
    district: "الملقا",
    neighborhood: "",
    street: "",
    nationalAddress: "",
    latitude: "",
    longitude: "",
  },
  units: [],
  paymentPlans: [],
  complianceDocuments: [],
  brokerAuthorization: {
    contractNumber: "",
    marketingScope: "",
    channelsText: "",
    commissionTerms: "",
    validFrom: "",
    validUntil: "",
    evidenceFiles: [],
  },
} satisfies ProjectFormData;

beforeEach(() => {
  createProperty.mockClear();
  requireWorkspaceData.mockClear();
  saveProjectDossierDraft.mockClear();
  saveProjectUnits.mockClear();
  saveProjectPaymentPlans.mockClear();
  saveProjectComplianceDocuments.mockClear();
  saveProjectAdLicense.mockClear();
  saveProjectBrokerAuthorization.mockClear();
  setCapturedProps(null);
});

it("saves uploaded images as media and buyer-visible publication state separately from status", async () => {
  const element = await CreateProjectPage();
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("ProjectFormScreenMock");

  const props = getCapturedProps() as {
    onSave: (data: ProjectFormData) => Promise<{ ok: true; redirectTo: string } | { ok: false }>;
  };
  const result = await props.onSave(formInput);

  expect(result).toEqual({ ok: true, redirectTo: "/ws/projects/project-new?tab=units" });
  expect(requireWorkspaceData).toHaveBeenCalledTimes(2);
  expect(requireWorkspaceData).toHaveBeenNthCalledWith(1, "/ws/projects/create/project");
  expect(requireWorkspaceData).toHaveBeenNthCalledWith(2, "/ws/projects/create/project");
  expect(createProperty).toHaveBeenCalledWith(
    expect.objectContaining({
      media: [uploadedImage],
      publicationState: "published",
      status: "available",
      body: {
        presentation: expect.objectContaining({
          descriptionShort: "نبذة قصيرة",
          amenities: ["مسبح", "نادي"],
          parkingSpaces: 2,
          hasParking: true,
          coverImageKey: "file-1",
          galleryDisplayMode: "fit",
          galleryAspectRatio: "square",
          expertMetadata: expect.objectContaining({
            assetType: "residential",
            projectScale: "180 وحدة",
            productMix: "شقق ودوبلكس",
            priceComparison: "fair_market",
            services: ["مواقف", "أمن"],
          }),
          privatePermitSummary: "تصريح للطرف المستلم فقط",
        }),
      },
    }),
  );
  expect(saveProjectUnits).toHaveBeenCalledWith(expect.objectContaining({ propertyId: "property-new" }));
});

it("passes the refreshed guided create copy to the form screen", async () => {
  const element = await CreateProjectPage();
  renderToStaticMarkup(element);

  expect(getCapturedProps()).toEqual(
    expect.objectContaining({
      title: "إعداد مشروع جديد",
      description: "اتبع الخطوات لإدخال بيانات المشروع، ترتيب المعرض، ضبط الوصول، ثم مراجعة النسخة النهائية قبل الحفظ.",
      submitLabel: "حفظ المشروع",
    }),
  );
});
