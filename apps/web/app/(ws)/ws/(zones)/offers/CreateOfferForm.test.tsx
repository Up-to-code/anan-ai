import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import CreateOfferForm, { buildSubmitPayload } from "./CreateOfferForm";

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

it("keeps property create mode slim in simplified create mode", () => {
  const html = renderToStaticMarkup(
    <CreateOfferForm
      simplifiedFieldsOnly
      audience="broker"
      organization={{
        id: "org-1",
        type: "broker",
        name: "شركة النخبة",
        slug: "elite",
        status: "active",
        isVerified: true,
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

  expect(html).toContain("1. نوع الطلب");
  expect(html).toContain("2. التفاصيل الأساسية");
  expect(html).toContain("العقار");
  expect(html).toContain("القيمة / الميزانية");
  expect(html).not.toContain("العنوان");
  expect(html).not.toContain("العقار المختار");
  expect(html).not.toContain("سينشر باسم");
  expect(html).not.toContain("إرسال مباشر إلى منظمة وسيط أخرى");
});

it("shows a slim client requirements flow in simplified create mode", () => {
  const html = renderToStaticMarkup(
    <CreateOfferForm
      simplifiedFieldsOnly
      audience="broker"
      initialData={{
        mode: "collaboration_case",
        title: "محمد علي",
        description: "يحتاج شقة جاهزة في القاهرة الجديدة",
      }}
      organization={{
        id: "org-1",
        type: "broker",
        name: "شركة النخبة",
        slug: "elite",
        status: "active",
        isVerified: true,
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

  expect(html).toContain("1. نوع الطلب");
  expect(html).toContain("2. التفاصيل الأساسية");
  expect(html).toContain("طلب عميل");
  expect(html).toContain("الموقع المطلوب");
  expect(html).toContain("المنطقة المطلوبة");
  expect(html).toContain("الميزانية من");
  expect(html).toContain("الميزانية إلى");
  expect(html).toContain("الحد الأدنى للغرف");
  expect(html).toContain("الحد الأدنى للحمامات");
  expect(html).toContain("العنوان");
  expect(html).not.toContain("طلب العميل");
  expect(html).not.toContain("هاتف العميل");
  expect(html).not.toContain("العقار المختار");
  expect(html).not.toContain("سينشر باسم");
  expect(html).not.toContain("إرسال مباشر إلى منظمة وسيط أخرى");
});

it("builds structured client requirement fields into the collaboration payload", () => {
  const payload = buildSubmitPayload(
    {
      propertyId: "",
      mode: "collaboration_case",
      title: "طلب شراء في الرياض",
      description: "عميل جاد ويحتاج وحدة جاهزة",
      price: "2900000",
      allowedAudience: "brokers",
      commissionText: "",
      permitStatus: "",
      productStatus: "",
      recipientEmail: "",
      recipientPhone: "",
      clientName: "",
      clientPhone: "",
      clientBudget: "",
      clientBudgetMin: "2400000",
      clientBudgetMax: "2900000",
      clientLocation: "الرياض",
      clientArea: "الملقا",
      clientBedsMin: "3",
      clientBathsMin: "3",
      clientSqftMin: "180",
      clientSqftMax: "240",
      clientNeed: "",
    },
    [],
    { simplifiedFieldsOnly: true, properties: [] },
  );

  expect(payload.clientContext).toEqual({
    clientName: "طلب شراء في الرياض",
    clientPhone: undefined,
    clientBudget: "2900000",
    clientNeed: "عميل جاد ويحتاج وحدة جاهزة\nالموقع المطلوب: الرياض",
    budgetMin: 2400000,
    budgetMax: 2900000,
    location: "الرياض",
    area: "الملقا",
    bedsMin: 3,
    bathsMin: 3,
    sqftMin: 180,
    sqftMax: 240,
  });
});
