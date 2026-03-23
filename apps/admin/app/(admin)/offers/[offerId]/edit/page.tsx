import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getOfferById } from "@/admin_zone/mocks/data";
import { offerDetailTabs, offersTabs } from "@/lib/adminSectionTabs";

type EditOfferPageProps = {
  params: Promise<{ offerId: string }>;
};

/**
 * WHY:   Offer review screens need an edit route with the current mocked values prefilled.
 * WHAT:  Renders the edit-offer page.
 * HOW:   Resolves the offer by id and forwards its values into the shared editor.
 */
export default async function EditOfferPage({ params }: EditOfferPageProps) {
  const { offerId } = await params;
  const offer = getOfferById(offerId);

  return (
    <EntityEditorPage
      eyebrow="إدارة العروض"
      title={`تعديل ${offer?.title ?? "العرض"}`}
      description="تحديث بيانات العرض والمشروع والقيمة قبل الاعتماد أو الرفض."
      entityLabel="العرض"
      mode="edit"
      backHref={offer ? `/offers/${offer.id}` : "/offers"}
      tabs={offer ? offerDetailTabs(offer.id) : offersTabs}
      fields={[
        { name: "title", label: "عنوان العرض", defaultValue: offer?.title ?? "" },
        { name: "organizationName", label: "المنظمة", defaultValue: offer?.organizationName ?? "" },
        { name: "submittedBy", label: "المرسل", defaultValue: offer?.submittedBy ?? "" },
        { name: "projectName", label: "المشروع", defaultValue: offer?.projectName ?? "" },
        { name: "propertyName", label: "العقار", defaultValue: offer?.propertyName ?? "" },
        { name: "amount", label: "القيمة", type: "number", defaultValue: offer?.amount ?? 0 },
        { name: "status", label: "الحالة", type: "select", defaultValue: offer?.status ?? "pending", options: [{ label: "معلّق", value: "pending" }, { label: "معتمد", value: "approved" }, { label: "مرفوض", value: "rejected" }] },
        { name: "body", label: "تفاصيل العرض", type: "textarea", defaultValue: offer?.body ?? "" },
      ]}
    />
  );
}
