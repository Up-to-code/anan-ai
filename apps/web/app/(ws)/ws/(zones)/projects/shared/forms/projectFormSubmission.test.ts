import { expect, it } from "vitest";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { getFirstProjectFormErrorStep, validateProjectFormSubmission } from "./projectFormSubmission";

const validFormData: ProjectFormData = {
  name: "مشروع الاختبار",
  price: "1,200,000 ر.س",
  location: "الرياض",
  description: "وصف كامل للمشروع",
  shortDescription: "وصف مختصر",
  amenitiesText: "مسبح، نادي",
  hasParking: true,
  parkingSpaces: "2",
  coverImageKey: "image-1",
  galleryDisplayMode: "cover",
  galleryAspectRatio: "landscape",
  privatePermitSummary: "",
  privatePermitFiles: [],
  rooms: "3",
  baths: "3",
  area: "240",
  status: "active",
  clientVisibility: "private",
  images: [{ key: "image-1", url: "https://example.com/image-1.jpg", name: "image-1.jpg" }],
  video: null,
  brokerId: null,
  adLicenseNumber: "AD-123",
  adLicenseStatus: null,
};

it("returns field-level feedback for invalid project input", () => {
  const feedback = validateProjectFormSubmission({
    ...validFormData,
    name: "",
    images: [],
  });

  expect(feedback).toEqual(
    expect.objectContaining({
      fieldErrors: expect.objectContaining({
        name: "اسم المشروع مطلوب.",
        images: "أضف صورة واحدة على الأقل للمشروع.",
      }),
    }),
  );
  expect(getFirstProjectFormErrorStep(feedback?.fieldErrors ?? {})).toBe(0);
});

it("flags the specs step when parking is enabled without spaces", () => {
  const feedback = validateProjectFormSubmission({
    ...validFormData,
    parkingSpaces: "",
  });

  expect(feedback?.fieldErrors.parkingSpaces).toBe("أدخل عدد المواقف عندما تكون المواقف متاحة.");
  expect(getFirstProjectFormErrorStep(feedback?.fieldErrors ?? {})).toBe(3);
});
