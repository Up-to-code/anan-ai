import { describe, expect, it, vi } from "vitest";

const { requireSessionContext } = vi.hoisted(() => ({
  requireSessionContext: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

import { uploadRouter } from "./core";
import { GET, POST } from "./route";

describe("uploadthing route", () => {
  it("exposes property, offer, and crm upload endpoints", () => {
    expect(Object.keys(uploadRouter).sort()).toEqual([
      "crmDocuments",
      "offerAttachments",
      "propertyMedia",
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
  });
});
