import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { ProjectFormData } from "@/components/shared/ag-aui/AgPropertyForm";

const {
  createProperty,
  publishProperty,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    createProperty: vi.fn(async () => "property-new"),
    publishProperty: vi.fn(async () => ({ ok: true })),
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
    publishProperty,
  })),
}));

vi.mock("../ProjectFormScreen", () => ({
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
  rooms: "4",
  baths: "5",
  area: "380",
  status: "active",
  images: [uploadedImage],
  video: null,
  brokerId: null,
  adLicenseNumber: "AD-001",
  adLicenseStatus: null,
};

beforeEach(() => {
  createProperty.mockClear();
  publishProperty.mockClear();
  setCapturedProps(null);
});

it("saves uploaded images as media and publishes when status is active", async () => {
  const element = await CreateProjectPage();
  const markup = renderToStaticMarkup(element);

  expect(markup).toContain("ProjectFormScreenMock");

  const props = getCapturedProps() as {
    onSave: (data: ProjectFormData) => Promise<{ redirectTo: string }>;
  };
  const result = await props.onSave(formInput);

  expect(result).toEqual({ redirectTo: "/ws/projects/property-new" });
  expect(createProperty).toHaveBeenCalledWith(expect.objectContaining({ media: [uploadedImage] }));
  expect(publishProperty).toHaveBeenCalledWith({ id: "property-new" });
});
