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

  expect(markup).toContain("الخطوة 1 من 5");
  expect(markup).toContain("هوية المشروع");
  expect(markup).toContain("الحجم والمزيج");
  expect(markup).toContain("السعر والمقارنة");
  expect(markup).toContain("الخدمات والجاهزية");
  expect(markup).toContain("مراجعة الخبير");
  expect(markup).toContain("الاسم والنوع والظهور والموقع السعودي");
  expect(markup).toContain("نوع المشروع");
});
