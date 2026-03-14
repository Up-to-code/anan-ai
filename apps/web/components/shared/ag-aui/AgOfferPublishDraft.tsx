import AgEntityDraftCard from "./AgEntityDraftCard";

export default function AgOfferPublishDraft({
  title,
  project,
  unit,
  audience,
  price,
  notes,
}: {
  title: string;
  project: string;
  unit?: string;
  audience: string;
  price: string;
  notes: string;
}) {
  return (
    <AgEntityDraftCard
      kind="offer"
      title={title}
      subtitle="مسودة نشر عرض قبل إرساله إلى السوق أو الوسطاء."
      fields={[
        { label: "المشروع", value: project, emphasized: true },
        { label: "الوحدة", value: unit ?? "على مستوى المشروع بالكامل" },
        { label: "الفئة المستهدفة", value: audience },
        { label: "السعر", value: price },
        { label: "ملخص العرض", value: notes },
      ]}
    />
  );
}
