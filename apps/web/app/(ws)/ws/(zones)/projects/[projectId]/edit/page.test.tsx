import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProjectFormData } from "@/components/shared/ag-aui/AgPropertyForm";

const {
  getProperty,
  updateProperty,
  publishProperty,
  deleteProperty,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    getProperty: vi.fn(async () => ({
      _id: "property-1",
      title: "برج الاختبار",
      address: "الرياض",
      location: "الرياض",
      description: "وصف",
      price: 2200000,
      beds: 4,
      baths: 4,
      media: [{ key: "file-existing", url: "https://ufs.sh/f/existing", name: "existing.jpg" }],
      publicationState: "draft",
      adLicenseNumber: "AD-OLD",
      adLicenseStatus: "pending",
    })),
    updateProperty: vi.fn(async () => undefined),
    publishProperty: vi.fn(async () => ({ ok: true })),
    deleteProperty: vi.fn(async () => undefined),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    getProperty,
    updateProperty,
    publishProperty,
    deleteProperty,
  })),
}));

vi.mock("../../ProjectFormScreen", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>ProjectFormScreenMock</div>;
  },
}));

import EditProjectRoute from "./page";

describe("/ws/projects/[projectId]/edit page", () => {
  beforeEach(() => {
    getProperty.mockClear();
    updateProperty.mockClear();
    publishProperty.mockClear();
    deleteProperty.mockClear();
    setCapturedProps(null);
  });

  it("updates project media through the mapped patch and supports delete", async () => {
    const element = await EditProjectRoute({
      params: Promise.resolve({ projectId: "property-1" }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("ProjectFormScreenMock");

    const props = getCapturedProps() as {
      initialData: Partial<ProjectFormData>;
      onSave: (data: ProjectFormData) => Promise<{ redirectTo: string }>;
      onDelete: () => Promise<{ redirectTo: string }>;
    };

    expect(props.initialData.images).toEqual([{ key: "file-existing", url: "https://ufs.sh/f/existing", name: "existing.jpg" }]);

    const uploadedImage = {
      key: "file-new",
      url: "https://ufs.sh/f/new",
      name: "new.jpg",
      size: 1800,
      mime: "image/jpeg",
    };

    const saveResult = await props.onSave({
      name: "برج الاختبار",
      price: "2,300,000 ر.س",
      location: "الرياض",
      description: "وصف محدث",
      rooms: "4",
      baths: "4",
      area: "400",
      status: "active",
      images: [uploadedImage],
      video: null,
      brokerId: null,
      adLicenseNumber: "AD-NEW",
      adLicenseStatus: "pending",
    });

    expect(saveResult).toEqual({ redirectTo: "/ws/projects/property-1" });
    expect(updateProperty).toHaveBeenCalledWith({
      id: "property-1",
      patch: expect.objectContaining({
        media: [uploadedImage],
      }),
    });
    expect(publishProperty).toHaveBeenCalledWith({ id: "property-1" });

    const deleteResult = await props.onDelete();
    expect(deleteResult).toEqual({ redirectTo: "/ws/projects" });
    expect(deleteProperty).toHaveBeenCalledWith({ id: "property-1" });
  });
});
