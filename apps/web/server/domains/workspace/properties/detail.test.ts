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
      rawPropertyRepository: {
        getProperty: vi.fn(async () => property),
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
      rawPropertyRepository: { getProperty: rawGetProperty },
    },
  );

  expect(hasProjectShareAccess).toHaveBeenCalledWith("token", "property-1");
  expect(rawGetProperty).toHaveBeenCalledWith("property-1");
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
      rawPropertyRepository: {
        getProperty: vi.fn(async () => null),
      },
    },
  );

  expect(result).toBeNull();
});
