import { beforeEach, expect, it, vi } from "vitest";

const { getProperty } = vi.hoisted(() => ({
  getProperty: vi.fn(),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    getProperty,
  })),
}));

import { resolveWorkspaceProjectDetail } from "./detail";

function makeProperty() {
  return {
    _id: "property-1",
    title: "برج الاختبار",
    address: "الرياض",
    location: "الرياض",
    description: "وصف",
    price: 2200000,
    beds: 4,
    baths: 4,
    publicationState: "draft" as const,
    REDId: "red-1",
  };
}

beforeEach(() => {
  getProperty.mockReset();
});

it("returns owner access when the workspace zone can load the property", async () => {
  const property = makeProperty();
  getProperty.mockResolvedValue(property);

  const result = await resolveWorkspaceProjectDetail(
    {
      projectId: "property-1",
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
    },
    {
      requireSession: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
        profile: null,
      })),
      inboxRepository: {
        hasProjectShareAccess: vi.fn(async () => false),
      },
      projectAccessRepository: {
        hasExplicitProjectViewerAccess: vi.fn(async () => false),
        promoteCurrentUserToProjectViewer: vi.fn(async () => ({ alreadyOwner: false, promoted: false })),
      },
      rawPropertyRepository: {
        getProperty: vi.fn(async (_token: string, _propertyId: string) => property),
      },
    },
  );

  expect(result).toEqual({
    property,
    accessMode: "owner",
    canEdit: true,
  });
});

it("returns shared read-only access when inbox project sharing grants access", async () => {
  const property = makeProperty();
  getProperty.mockResolvedValue(null);
  const hasProjectShareAccess = vi.fn(async () => true);
  const promoteCurrentUserToProjectViewer = vi.fn(async () => ({ alreadyOwner: false, promoted: true }));
  const rawGetProperty = vi.fn(async () => property);

  const result = await resolveWorkspaceProjectDetail(
    {
      projectId: "property-1",
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
    },
    {
      requireSession: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
        profile: null,
      })),
      inboxRepository: { hasProjectShareAccess },
      projectAccessRepository: {
        hasExplicitProjectViewerAccess: vi.fn(async () => false),
        promoteCurrentUserToProjectViewer,
      },
      rawPropertyRepository: { getProperty: rawGetProperty },
    },
  );

  expect(hasProjectShareAccess).toHaveBeenCalledWith("token", "property-1");
  expect(promoteCurrentUserToProjectViewer).toHaveBeenCalledWith("token", { propertyId: "property-1" });
  expect(rawGetProperty).toHaveBeenCalledWith("token", "property-1");
  expect(result).toEqual({
    property,
    accessMode: "shared",
    canEdit: false,
  });
});

it("returns shared read-only access when explicit viewer access already exists", async () => {
  const property = makeProperty();
  getProperty.mockResolvedValue(null);
  const hasExplicitProjectViewerAccess = vi.fn(async () => true);
  const rawGetProperty = vi.fn(async () => property);

  const result = await resolveWorkspaceProjectDetail(
    {
      projectId: "property-1",
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
    },
    {
      requireSession: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
        profile: null,
      })),
      inboxRepository: {
        hasProjectShareAccess: vi.fn(async () => false),
      },
      projectAccessRepository: {
        hasExplicitProjectViewerAccess,
        promoteCurrentUserToProjectViewer: vi.fn(async () => ({ alreadyOwner: false, promoted: false })),
      },
      rawPropertyRepository: { getProperty: rawGetProperty },
    },
  );

  expect(hasExplicitProjectViewerAccess).toHaveBeenCalledWith("token", "property-1");
  expect(rawGetProperty).toHaveBeenCalledWith("token", "property-1");
  expect(result).toEqual({
    property,
    accessMode: "shared",
    canEdit: false,
  });
});

it("returns null when the project is neither owned nor explicitly shared", async () => {
  getProperty.mockResolvedValue(null);

  const result = await resolveWorkspaceProjectDetail(
    {
      projectId: "property-404",
      audience: "broker",
      ownerContext: { ownerType: "broker", ownerId: "broker-1" },
    },
    {
      requireSession: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "broker", isActive: true, brokerId: "broker-1" },
        profile: null,
      })),
      inboxRepository: {
        hasProjectShareAccess: vi.fn(async () => false),
      },
      projectAccessRepository: {
        hasExplicitProjectViewerAccess: vi.fn(async () => false),
        promoteCurrentUserToProjectViewer: vi.fn(async () => ({ alreadyOwner: false, promoted: false })),
      },
      rawPropertyRepository: {
        getProperty: vi.fn(async (_token: string, _propertyId: string) => null),
      },
    },
  );

  expect(result).toBeNull();
});
