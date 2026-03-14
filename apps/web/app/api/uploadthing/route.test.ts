import { describe, expect, it } from "vitest";
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
});
