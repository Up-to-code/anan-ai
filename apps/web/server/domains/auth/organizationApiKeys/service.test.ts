import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";
import {
  createCurrentOrganizationApiKeyForCurrentUser,
  createOrganizationDealByApiKey,
  getOrganizationBrokerByApiKey,
  listOrganizationClientsByApiKey,
  listOrganizationDealsByApiKey,
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
  listDealsByApiKey: vi.fn(),
  createDealByApiKey: vi.fn(),
  updateDealByApiKey: vi.fn(),
  deleteDealByApiKey: vi.fn(),
  listBrokersByApiKey: vi.fn(),
  getBrokerByApiKey: vi.fn(),
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

it("rejects unsupported api key permission pairs at create time", async () => {
  await expect(
    createCurrentOrganizationApiKeyForCurrentUser(
      {
        permissions: [{ resource: "brokers", action: "delete" }],
      },
      { requireSession, repository },
    ),
  ).rejects.toMatchObject<Partial<DomainError>>({
    code: "INVALID_ARGUMENT",
    status: 400,
  });
});

it("lists deals using the normalized api key hash", async () => {
  repository.listDealsByApiKey.mockResolvedValue([{ id: "deal-1", title: "Pipeline Deal", stage: "new" }]);

  const deals = await listOrganizationDealsByApiKey("anan_prefix.secret", undefined, { repository });

  expect(deals).toEqual([{ id: "deal-1", title: "Pipeline Deal", stage: "new" }]);
  expect(repository.listDealsByApiKey).toHaveBeenCalledWith(
    expect.stringMatching(/^[a-f0-9]{64}$/),
    expect.any(Number),
    undefined,
  );
});

it("creates a deal with external references and relation ids", async () => {
  repository.createDealByApiKey.mockResolvedValue({ id: "deal-1", title: "Pipeline Deal", stage: "contacted" });

  const deal = await createOrganizationDealByApiKey(
    "anan_prefix.secret",
    {
      title: "Pipeline Deal",
      stage: "contacted",
      relationType: "internal_client",
      clientId: "client-1",
      projectId: "property-1",
      brokerId: "broker-1",
      sourceSystem: "hubspot",
      externalId: "ext-1",
      businessId: "biz-1",
    },
    undefined,
    { repository },
  );

  expect(deal).toEqual({ id: "deal-1", title: "Pipeline Deal", stage: "contacted" });
  expect(repository.createDealByApiKey).toHaveBeenCalledWith(
    expect.stringMatching(/^[a-f0-9]{64}$/),
    expect.objectContaining({
      title: "Pipeline Deal",
      stage: "contacted",
      relationType: "internal_client",
      clientId: "client-1",
      projectId: "property-1",
      brokerId: "broker-1",
      sourceSystem: "hubspot",
      externalId: "ext-1",
      businessId: "biz-1",
    }),
    expect.any(Number),
    undefined,
  );
});

it("gets a broker using the api key header value", async () => {
  repository.getBrokerByApiKey.mockResolvedValue({ id: "broker-1", name: "Broker One" });

  const broker = await getOrganizationBrokerByApiKey("anan_prefix.secret", "broker-1", undefined, { repository });

  expect(broker).toEqual({ id: "broker-1", name: "Broker One" });
  expect(repository.getBrokerByApiKey).toHaveBeenCalledWith(
    expect.stringMatching(/^[a-f0-9]{64}$/),
    "broker-1",
    expect.any(Number),
    undefined,
  );
});
