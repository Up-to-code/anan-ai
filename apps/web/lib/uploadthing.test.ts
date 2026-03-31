import { afterEach, expect, it, vi } from "vitest";

const { mockUseUploadThing } = vi.hoisted(() => ({
  mockUseUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
    routeConfig: undefined,
    permittedFileInfo: undefined,
  })),
}));

vi.mock("@uploadthing/react", () => ({
  generateReactHelpers: vi.fn(() => ({
    useUploadThing: mockUseUploadThing,
  })),
}));

afterEach(() => {
  vi.resetModules();
  mockUseUploadThing.mockClear();
});

it("returns a local fallback without touching UploadThing when the client flag is disabled", async () => {
  vi.stubEnv("NEXT_PUBLIC_UPLOADTHING_ENABLED", "false");
  const uploadthing = await import("./uploadthing");

  const result = uploadthing.useUploadThing("propertyMedia");

  expect(mockUseUploadThing).not.toHaveBeenCalled();
  await expect(result.startUpload([])).rejects.toThrow(
    "Uploads are not configured. Set UPLOADTHING_TOKEN in apps/web/.env.local and restart the web app.",
  );
  expect(result.isUploading).toBe(false);
});

it("delegates to UploadThing helpers when the client flag is enabled", async () => {
  vi.stubEnv("NEXT_PUBLIC_UPLOADTHING_ENABLED", "true");
  const uploadthing = await import("./uploadthing");

  const result = uploadthing.useUploadThing("offerAttachments");

  expect(mockUseUploadThing).toHaveBeenCalledWith("offerAttachments");
  expect(typeof result.startUpload).toBe("function");
});
