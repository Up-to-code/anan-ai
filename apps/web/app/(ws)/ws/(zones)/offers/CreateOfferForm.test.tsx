import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import CreateOfferForm from "./CreateOfferForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

it("renders the visual project selector and attachment dropzone copy", () => {
  const html = renderToStaticMarkup(
    <CreateOfferForm
      properties={[
        {
          id: "project-1",
          title: "أبراج النخبة",
          location: "القاهرة الجديدة",
          image: "https://example.com/image.jpg",
          expectedPrice: "2500000",
          shortDescription: "واجهة معاصرة ووحدات جاهزة",
          organizationName: "شركة النخبة",
          publicationState: "published",
        },
      ]}
      onSubmit={async () => ({ redirectTo: "/ws/offers/offer-1" })}
    />,
  );

  expect(html).toContain("استعراض");
  expect(html).toContain("يمكنك البحث أو فتح مشاريع أخرى لنفس المطور عندما تكون القائمة طويلة.");
  expect(html).toContain("إرفاق صور أو PDF للعرض");
  expect(html).toContain("اسحب الملفات هنا أو اخترها يدويًا");
});
