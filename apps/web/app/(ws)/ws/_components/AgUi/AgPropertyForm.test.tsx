import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

import AgPropertyForm from "./AgPropertyForm";

it("renders the project form as a five-step expert wizard", () => {
  const markup = renderToStaticMarkup(
    <AgPropertyForm
      initialData={{
        name: "مشروع تجريبي",
        price: "1,500,000 ر.س",
        location: "الرياض",
        description: "وصف المشروع",
        shortDescription: "",
        amenitiesText: "",
        hasParking: false,
        parkingSpaces: "",
        coverImageKey: null,
        galleryDisplayMode: "cover",
        galleryAspectRatio: "landscape",
        privatePermitSummary: "",
        privatePermitFiles: [],
        rooms: "3",
        baths: "3",
        area: "220",
        status: "pending",
        images: [],
        video: null,
        brokerId: null,
      }}
      title="تعديل المشروع"
      description="وصف"
      submitLabel="حفظ"
    />,
  );

  expect(markup).toContain("الخطوة 1");
  expect(markup).toContain("الأساسيات");
  expect(markup).toContain("الموقع السعودي المنظم");
  expect(markup).toContain("نوع المشروع");
});
