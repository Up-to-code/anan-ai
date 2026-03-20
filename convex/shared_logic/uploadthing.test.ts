import { expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

const mockUploadthingFiles = {
  upsertFile: vi.fn(async () => ({ id: "file-1" })),
  listAllFiles: vi.fn(async () => [{ id: "file-1" }]),
};

const mockRequireOrganizationMembership = vi.fn();

vi.mock("../uploadthing", () => ({
  uploadthingFiles: mockUploadthingFiles,
}));

vi.mock("./agencies/repositories/membership", () => ({
  requireOrganizationMembership: mockRequireOrganizationMembership,
}));

function setMembershipWithTenant() {
  mockRequireOrganizationMembership.mockResolvedValue({
    owner: {
      tenantOrgId: "tenant-1",
      ownerType: "broker",
      ownerBrokerId: "broker-1",
    },
    profile: {
      authUserId: "auth-user-1",
    },
    membership: {
      role: "manager",
      status: "active",
    },
  });
}

const sampleUpload = {
  category: "propertyMedia",
  file: {
    key: "file-key",
    url: "https://files.test/file.png",
    name: "file.png",
    size: 1024,
    mime: "image/png",
  },
} as const;

it("upserts files with tenant folder and metadata", async () => {
  const t = convexTest(schema, modules);
  setMembershipWithTenant();

  await t.mutation(api.shared_logic.uploadthing.trackUploadthingFile as never, sampleUpload as never);

  expect(mockUploadthingFiles.upsertFile).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      userId: "auth-user-1",
      options: expect.objectContaining({
        folder: "tenant:tenant-1",
        tags: ["propertyMedia"],
        metadata: expect.objectContaining({
          tenantOrgId: "tenant-1",
          ownerType: "broker",
          ownerId: "broker-1",
          category: "propertyMedia",
        }),
      }),
    }),
  );
});

it("rejects uploads when tenant org is missing", async () => {
  const t = convexTest(schema, modules);
  mockRequireOrganizationMembership.mockResolvedValue({
    owner: {
      ownerType: "broker",
      ownerBrokerId: "broker-1",
    },
    profile: {
      authUserId: "auth-user-1",
    },
    membership: {
      role: "manager",
      status: "active",
    },
  });

  await expect(
    t.mutation(
      api.shared_logic.uploadthing.trackUploadthingFile as never,
      sampleUpload as never,
    ),
  ).rejects.toBeInstanceOf(ConvexError);
});

it("lists files scoped to the tenant and category", async () => {
  const t = convexTest(schema, modules);
  setMembershipWithTenant();

  await t.query(
    api.shared_logic.uploadthing.listCurrentTenantFiles as never,
    {
      category: "crmDocuments",
      limit: 10,
      includeExpired: true,
    } as never,
  );

  expect(mockUploadthingFiles.listAllFiles).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      viewerUserId: "auth-user-1",
      folder: "tenant:tenant-1",
      tag: "crmDocuments",
      includeExpired: true,
      limit: 10,
    }),
  );
});
