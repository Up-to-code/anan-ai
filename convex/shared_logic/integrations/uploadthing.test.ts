import { expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

const mockUploadthingFiles = {
  upsertFile: vi.fn(async () => ({ id: "file-1" })),
  listAllFiles: vi.fn(async () => [{ id: "file-1" }]),
};

const mockRequireOrganizationMembership = vi.fn();

vi.mock("../../uploadthing", () => ({
  uploadthingFiles: mockUploadthingFiles,
}));

vi.mock("../agencies/repositories/membership", () => ({
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
    url: "https://utfs.io/f/file-key.png",
    name: "file.png",
    size: 1024,
    mime: "image/png",
    sha256: "a".repeat(64),
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
          sha256: "a".repeat(64),
        }),
      }),
    }),
  );
});

it("rejects untrusted upload URLs", async () => {
  const t = convexTest(schema, modules);
  setMembershipWithTenant();

  await expect(
    t.mutation(
      api.shared_logic.uploadthing.trackUploadthingFile as never,
      {
        ...sampleUpload,
        file: {
          ...sampleUpload.file,
          url: "https://files.test/file.png",
        },
      } as never,
    ),
  ).rejects.toBeInstanceOf(ConvexError);
});

it("rejects uploads without verified checksums", async () => {
  const t = convexTest(schema, modules);
  setMembershipWithTenant();

  await expect(
    t.mutation(
      api.shared_logic.uploadthing.trackUploadthingFile as never,
      {
        ...sampleUpload,
        file: {
          key: sampleUpload.file.key,
          url: sampleUpload.file.url,
          name: sampleUpload.file.name,
          size: sampleUpload.file.size,
          mime: sampleUpload.file.mime,
        },
      } as never,
    ),
  ).rejects.toThrow();
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
