import { beforeEach, expect, it, vi } from "vitest";

const { fetchMutation, fetchQuery } = vi.hoisted(() => ({
  fetchMutation: vi.fn(),
  fetchQuery: vi.fn(),
}));

vi.mock("convex/nextjs", () => ({
  fetchMutation,
  fetchQuery,
}));

vi.mock("@/lib/convexApi", () => ({
  apiUnsafe: {
    "shared_logic/agencies/repositories/apiKeys": {
      listCurrentOrganizationApiKeys: "listCurrentOrganizationApiKeys",
      createCurrentOrganizationApiKey: "createCurrentOrganizationApiKey",
      revokeCurrentOrganizationApiKey: "revokeCurrentOrganizationApiKey",
      listClientsByApiKey: "listClientsByApiKey",
      createClientByApiKey: "createClientByApiKey",
      updateClientByApiKey: "updateClientByApiKey",
      deleteClientByApiKey: "deleteClientByApiKey",
      listPropertiesByApiKey: "listPropertiesByApiKey",
      createPropertyByApiKey: "createPropertyByApiKey",
      updatePropertyByApiKey: "updatePropertyByApiKey",
      deletePropertyByApiKey: "deletePropertyByApiKey",
      listDealsByApiKey: "listDealsByApiKey",
      createDealByApiKey: "createDealByApiKey",
      updateDealByApiKey: "updateDealByApiKey",
      deleteDealByApiKey: "deleteDealByApiKey",
      listBrokersByApiKey: "listBrokersByApiKey",
      getBrokerByApiKey: "getBrokerByApiKey",
    },
  },
}));

import { convexOrganizationApiKeysRepository } from "./index";

beforeEach(() => {
  fetchMutation.mockReset();
  fetchQuery.mockReset();
  fetchMutation.mockResolvedValue({ clients: [] });
});

it("omits origin from machine mutation payloads when it is absent", async () => {
  await convexOrganizationApiKeysRepository.listClientsByApiKey("secret-hash", 123);

  expect(fetchMutation).toHaveBeenCalledWith("listClientsByApiKey", { secretHash: "secret-hash", now: 123 });
});

it("forwards origin when it is provided", async () => {
  await convexOrganizationApiKeysRepository.listClientsByApiKey("secret-hash", 123, "https://app.anan.test");

  expect(fetchMutation).toHaveBeenCalledWith("listClientsByApiKey", {
    secretHash: "secret-hash",
    now: 123,
    origin: "https://app.anan.test",
  });
});
