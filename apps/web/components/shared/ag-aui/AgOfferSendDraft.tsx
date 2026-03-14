import AgEntityDraftCard from "./AgEntityDraftCard";

export default function AgOfferSendDraft({
  recipient,
  project,
  unit,
  message,
  action,
}: {
  recipient: string;
  project: string;
  unit?: string;
  message: string;
  action: string;
}) {
  return (
    <AgEntityDraftCard
      kind="offer"
      title={`إرسال عرض إلى ${recipient}`}
      subtitle="المساعد جهز محتوى الإرسال والخطوة التالية قبل التنفيذ."
      fields={[
        { label: "المشروع", value: project, emphasized: true },
        { label: "الوحدة", value: unit ?? "بدون تحديد وحدة" },
        { label: "نص الرسالة", value: message },
        { label: "الإجراء التالي", value: action },
      ]}
    />
  );
}
