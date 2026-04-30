import { afterAll, expect, it, vi } from "vitest";

const { requireSessionContext, resetUploadthingToken } = vi.hoisted(() => {
  const previousUploadthingToken = process.env.UPLOADTHING_TOKEN;
  process.env.UPLOADTHING_TOKEN = "ut-test-token";
  return {
    requireSessionContext: vi.fn(),
    resetUploadthingToken: () => {
      if (previousUploadthingToken === undefined) {
        delete process.env.UPLOADTHING_TOKEN;
        return;
      }
      process.env.UPLOADTHING_TOKEN = previousUploadthingToken;
    },
  };
});

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

import { uploadRouter } from "./core";
import { GET, POST } from "./route";

afterAll(() => {
  resetUploadthingToken();
});

it("exposes property, offer, crm, and verification upload endpoints", () => {
  expect(Object.keys(uploadRouter).sort()).toEqual([
    "crmDocuments",
    "offerAttachments",
    "propertyMedia",
    "verificationDocuments",
  ]);
});

it("exports both GET and POST handlers", () => {
  expect(typeof GET).toBe("function");
  expect(typeof POST).toBe("function");
});

it("builds upload router entries", () => {
  expect(uploadRouter.propertyMedia).toBeTruthy();
  expect(uploadRouter.offerAttachments).toBeTruthy();
  expect(uploadRouter.crmDocuments).toBeTruthy();
  expect(uploadRouter.verificationDocuments).toBeTruthy();
});

it("returns a stable 503 payload when UploadThing token is missing", async () => {
  const previous = process.env.UPLOADTHING_TOKEN;
  delete process.env.UPLOADTHING_TOKEN;
  vi.resetModules();
  try {
    const route = await import("./route");
    const response = await route.GET(new Request("http://localhost/api/uploadthing"), {});
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "UPLOADTHING_NOT_CONFIGURED",
      message: expect.stringContaining("Convex Cloud env vars are separate"),
      status: 503,
    });
  } finally {
    if (previous === undefined) {
      delete process.env.UPLOADTHING_TOKEN;
    } else {
      process.env.UPLOADTHING_TOKEN = previous;
    }
    vi.resetModules();
  }
});
