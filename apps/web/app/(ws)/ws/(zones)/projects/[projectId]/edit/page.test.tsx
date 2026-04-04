import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { ProjectFormData } from "@/app/(ws)/ws/public";

const {
  getProperty,
  updateProperty,
  deleteProperty,
  attachOrganizationAssets,
  markEntityAssetsPendingDelete,
  listPropertyViewers,
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
      body: {
        presentation: {
          descriptionShort: "وصف مختصر",
          amenities: ["مسبح", "حراسة"],
          parkingSpaces: 3,
          hasParking: true,
          coverImageKey: "file-existing",
          galleryDisplayMode: "fit",
          galleryAspectRatio: "portrait",
          privatePermitSummary: "ملف خاص بالمحادثة",
          privatePermitFiles: [
            { key: "permit-existing", url: "https://ufs.sh/f/permit-existing", name: "permit.pdf" },
          ],
          privatePermitVisibility: "conversation_only",
        },
      },
      price: 2200000,
      beds: 4,
      baths: 4,
      media: [{ key: "file-existing", url: "https://ufs.sh/f/existing", name: "existing.jpg" }],
      publicationState: "draft",
      adLicenseNumber: "AD-OLD",
      adLicenseStatus: "pending",
    })),
    updateProperty: vi.fn(async () => undefined),
    deleteProperty: vi.fn(async () => undefined),
    attachOrganizationAssets: vi.fn(async () => undefined),
    markEntityAssetsPendingDelete: vi.fn(async () => undefined),
    listPropertyViewers: vi.fn(async () => [
      {
        authUserId: "viewer-1",
        name: "Shared Viewer",
        email: "viewer@example.com",
        accessSource: "chat_share",
        createdAt: 1,
        updatedAt: 2,
      },
    ]),
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
    deleteProperty,
  })),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(async () => ({
    token: "token",
    context: { userId: "user-1", role: "developer", isActive: true, redId: "red-1" },
    profile: null,
  })),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    attachOrganizationAssets,
    markEntityAssetsPendingDelete,
  },
}));

vi.mock("@/server/infrastructure/convex/properties/access", () => ({
  convexProjectAccessRepository: {
    listPropertyViewers,
    revokePropertyViewer: vi.fn(async () => ({ ok: true })),
  },
}));

vi.mock("../../shared/forms/ProjectFormScreen", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>ProjectFormScreenMock</div>;
  },
}));

import EditProjectRoute from "./page";

const uploadedImage = {
  key: "file-new",
  url: "https://ufs.sh/f/new",
  name: "new.jpg",
  size: 1800,
  mime: "image/jpeg",
};

const saveFormInput: ProjectFormData = {
  name: "برج الاختبار",
  price: "2,300,000 ر.س",
  location: "الرياض",
  description: "وصف محدث",
  shortDescription: "وصف مختصر محدث",
  amenitiesText: "مسبح، حراسة، نادي",
  hasParking: true,
  parkingSpaces: "4",
  coverImageKey: "file-new",
  galleryDisplayMode: "cover",
  galleryAspectRatio: "landscape",
  privatePermitSummary: "نسخة خاصة لهذه المحادثة",
  privatePermitFiles: [{ key: "permit-new", url: "https://ufs.sh/f/permit-new", name: "permit-new.pdf" }],
  rooms: "4",
  baths: "4",
  area: "400",
  status: "active",
  clientVisibility: "public",
  images: [uploadedImage],
  video: null,
  brokerId: null,
  adLicenseNumber: "AD-NEW",
  adLicenseStatus: "pending",
};

type CapturedEditProps = {
  initialData: Partial<ProjectFormData>;
  onSave: (data: ProjectFormData) => Promise<{ ok: true; redirectTo: string } | { ok: false }>;
  onDelete: () => Promise<{ redirectTo: string }>;
};

async function renderEditProject() {
  const element = await EditProjectRoute({ params: Promise.resolve({ projectId: "property-1" }) });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedEditProps;
  return { markup, props };
}

beforeEach(() => {
  getProperty.mockClear();
  updateProperty.mockClear();
  deleteProperty.mockClear();
  setCapturedProps(null);
});

it("updates project media through the mapped patch without implicit publish side effects", async () => {
  const { markup, props } = await renderEditProject();

  expect(markup).toContain("ProjectFormScreenMock");
  expect(props.initialData.images).toEqual([{ key: "file-existing", url: "https://ufs.sh/f/existing", name: "existing.jpg" }]);
  expect(props.initialData.shortDescription).toBe("وصف مختصر");
  expect(props.initialData.amenitiesText).toBe("مسبح، حراسة");
  expect(props.initialData.hasParking).toBe(true);
  expect(props.initialData.coverImageKey).toBe("file-existing");
  expect(props.initialData.galleryDisplayMode).toBe("fit");
  expect(props.initialData.galleryAspectRatio).toBe("portrait");
  expect(props.initialData.privatePermitSummary).toBe("ملف خاص بالمحادثة");
  expect(props.initialData.clientVisibility).toBe("private");
  expect(props.initialData.visibilityMembers).toEqual([
    expect.objectContaining({
      authUserId: "viewer-1",
      name: "Shared Viewer",
    }),
  ]);

  const saveResult = await props.onSave(saveFormInput);
  expect(saveResult).toEqual({ ok: true, redirectTo: "/ws/projects/property-1" });
  expect(updateProperty).toHaveBeenCalledWith({
    id: "property-1",
    patch: expect.objectContaining({
      media: [uploadedImage],
      publicationState: "published",
      status: "available",
      body: {
        presentation: expect.objectContaining({
          descriptionShort: "وصف مختصر محدث",
          amenities: ["مسبح", "حراسة", "نادي"],
          parkingSpaces: 4,
          hasParking: true,
          coverImageKey: "file-new",
          galleryDisplayMode: "cover",
          galleryAspectRatio: "landscape",
          privatePermitSummary: "نسخة خاصة لهذه المحادثة",
        }),
      },
    }),
  });
  expect(attachOrganizationAssets).toHaveBeenCalledTimes(2);
});

it("supports deleting the project", async () => {
  const { props } = await renderEditProject();
  const deleteResult = await props.onDelete();

  expect(deleteResult).toEqual({ redirectTo: "/ws/projects" });
  expect(markEntityAssetsPendingDelete).toHaveBeenCalledWith(
    "token",
    expect.objectContaining({
      attachedEntityType: "project",
      attachedEntityId: "property-1",
    }),
  );
  expect(deleteProperty).toHaveBeenCalledWith({ id: "property-1" });
});
