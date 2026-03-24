import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";
import {
  createCurrentOrganizationApiKeyForCurrentUser,
  listOrganizationClientsByApiKey,
} from "./service";

const requireSession = vi.fn(async () => ({ token: "session-token" }));
const repository = {
  listCurrentOrganizationApiKeys: vi.fn(),
  createCurrentOrganizationApiKey: vi.fn(),
  revokeCurrentOrganizationApiKey: vi.fn(),
  listClientsByApiKey: vi.fn(),
  createClientByApiKey: vi.fn(),
  updateClientByApiKey: vi.fn(),
  deleteClientByApiKey: vi.fn(),
  listPropertiesByApiKey: vi.fn(),
  createPropertyByApiKey: vi.fn(),
  updatePropertyByApiKey: vi.fn(),
  deletePropertyByApiKey: vi.fn(),
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-20T12:00:00.000Z"));
  Object.values(repository).forEach((entry) => {
    if (typeof entry === "function" && "mockReset" in entry) {
      (entry as ReturnType<typeof vi.fn>).mockReset();
    }
  });
});

it("creates a one-time API key secret and persists only hashed metadata", async () => {
  repository.createCurrentOrganizationApiKey.mockImplementation(async (_token, input) => ({
    id: "row-1",
    keyId: input.keyId,
    prefix: input.prefix,
    name: input.name,
    permissions: input.permissions,
    status: "active",
    createdBy: "auth-manager",
    createdByName: "Manager",
    createdAt: input.now,
  }));

  const result = await createCurrentOrganizationApiKeyForCurrentUser(
    {
      name: "Internal CRM",
      permissions: [
        { resource: "properties", action: "update" },
        { resource: "clients", action: "read" },
        { resource: "clients", action: "read" },
      ],
    },
    { requireSession, repository },
  );

  expect(result.apiKey).toContain(".");
  expect(result.key.name).toBe("Internal CRM");
  expect(repository.createCurrentOrganizationApiKey).toHaveBeenCalledWith(
    "session-token",
    expect.objectContaining({
      name: "Internal CRM",
      keyId: expect.stringMatching(/^oak_/),
      prefix: expect.stringMatching(/^anan_/),
      secretHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      now: new Date("2026-03-20T12:00:00.000Z").getTime(),
      permissions: [
        { resource: "clients", action: "read" },
        { resource: "properties", action: "update" },
      ],
    }),
  );
});

it("auto-generates a key name when the create form is submitted without one", async () => {
  repository.createCurrentOrganizationApiKey.mockImplementation(async (_token, input) => ({
    id: "row-1",
    keyId: input.keyId,
    prefix: input.prefix,
    name: input.name,
    permissions: input.permissions,
    status: "active",
    createdBy: "auth-manager",
    createdByName: "Manager",
    createdAt: input.now,
  }));

  const result = await createCurrentOrganizationApiKeyForCurrentUser(
    {
      permissions: [{ resource: "clients", action: "read" }],
    },
    { requireSession, repository },
  );

  expect(result.key.name).toMatch(/^API Key 2026-03-20 12:00$/);
  expect(repository.createCurrentOrganizationApiKey).toHaveBeenCalledWith(
    "session-token",
    expect.objectContaining({
      name: "API Key 2026-03-20 12:00",
    }),
  );
});

it("rejects machine API calls when the key header is missing", async () => {
  await expect(listOrganizationClientsByApiKey("", { repository })).rejects.toMatchObject<Partial<DomainError>>({
    code: "UNAUTHORIZED",
    status: 401,
  });
});
