import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import CreateOfferForm from "./CreateOfferForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/uploadthing", () => ({
  useUploadThing: vi.fn(() => ({
    startUpload: vi.fn(async () => []),
    isUploading: false,
  })),
}));

it("renders organization-owned marketplace copy with organization settings and property card", () => {
  const html = renderToStaticMarkup(
    <CreateOfferForm
      audience="broker"
      organization={{
        id: "org-1",
        type: "broker",
        name: "شركة النخبة",
        slug: "elite",
        status: "active",
        isVerified: true,
        phone: "+966500000000",
      }}
      properties={[
        {
          id: "project-1",
          title: "أبراج النخبة",
          location: "القاهرة الجديدة",
          image: "https://example.com/image.jpg",
          expectedPrice: "2500000",
          shortDescription: "واجهة معاصرة ووحدات جاهزة",
          publicationState: "published",
        },
      ]}
      onSubmit={async () => ({ redirectTo: "/ws/offers/offer-1" })}
    />,
  );

  expect(html).toContain("إنشاء عرض باسم المنظمة");
  expect(html).toContain("المنظمة المالكة للعرض");
  expect(html).toContain("إعدادات المنظمة");
  expect(html).toContain("واتساب");
  expect(html).toContain("مشاركة عقار");
  expect(html).toContain("طلب عميل");
  expect(html).toContain("العقار المختار");
  expect(html).toContain("رفع المرفقات");
});
