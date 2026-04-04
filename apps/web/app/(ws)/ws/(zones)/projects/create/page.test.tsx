import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { ProjectFormData } from "@/app/(ws)/ws/public";

const {
  createProperty,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    createProperty: vi.fn(async () => "property-new"),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    createProperty,
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

vi.mock("../shared/forms/ProjectFormScreen", () => ({
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

const formInput: ProjectFormData = {
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
};

beforeEach(() => {
  createProperty.mockClear();
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

  expect(result).toEqual({ ok: true, redirectTo: "/ws/projects/property-new" });
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
          privatePermitSummary: "تصريح للطرف المستلم فقط",
        }),
      },
    }),
  );
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
