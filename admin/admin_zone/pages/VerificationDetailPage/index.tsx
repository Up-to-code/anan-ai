import { redirect } from "next/navigation";
import { getVerificationDetailPageData, reviewVerificationRequest } from "@/admin_zone/api/verifications";
import EmptyState from "@/components/shared/EmptyState";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForVerificationType } from "@/lib/adminLabels";
import { formatDateTime, formatNumber } from "@/lib/format";

type VerificationDetailPageProps = {
  requestId: string;
  tab?: "data" | "documents" | "review";
};

/**
 * WHY:   Verification detail should split the submitted data, documents, and review decision into separate pages.
 * WHAT:  Renders the requested verification-detail tab and provides a simple Arabic review action form.
 * HOW:   Loads the enriched verification request server-side and posts review decisions through a server action.
 */
export default async function VerificationDetailPage({ requestId, tab = "data" }: VerificationDetailPageProps) {
  const { detail } = await getVerificationDetailPageData(requestId);
  const data = detail as Record<string, unknown> | null;

  if (!data) {
    return <EmptyState title="طلب غير موجود" description="تعذر العثور على طلب التحقق المطلوب." />;
  }

  const subject = (data.subject as Record<string, unknown>) ?? {};
  const documents = (data.attachedDocuments as Array<Record<string, unknown>>) ?? [];
  const decisionHistory = (data.decisionHistory as Array<Record<string, unknown>>) ?? [];

  if (tab === "documents") {
    return documents.length > 0 ? (
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">المستندات المرفوعة</div>
        <div className="grid gap-4">
          {documents.map((document, index) => (
            <div key={`${String(document.url ?? index)}`} className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="font-black text-slate-900">{String(document.name ?? `مستند ${index + 1}`)}</div>
              <div className="mt-2 text-sm font-semibold text-slate-600">{String(document.mimeType ?? "نوع غير معروف")}</div>
              {document.url ? (
                <a href={String(document.url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-black text-blue-600">
                  فتح الملف
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </WorkspacePanel>
    ) : (
      <EmptyState title="لا توجد مستندات" description="لم يتم إرفاق مستندات مع هذا الطلب." />
    );
  }

  if (tab === "review") {
    async function submitReview(formData: FormData) {
      "use server";

      const status = String(formData.get("status") ?? "in_review") as "in_review" | "approved" | "rejected";
      const reviewerNotes = String(formData.get("reviewerNotes") ?? "");

      await reviewVerificationRequest({
        id: requestId,
        status,
        reviewerNotes: reviewerNotes || undefined,
      });

      redirect(`/verifications/${encodeURIComponent(requestId)}/review`);
    }

    return (
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الحالة الحالية</div>
          <div><StatusBadge value={String(data.currentStatus ?? "unknown")} /></div>
          <div className="text-sm font-semibold text-slate-600">
            نوع الطلب: {labelForVerificationType(String(data.requestType ?? "user"))}
          </div>
          <div className="text-sm font-semibold text-slate-600">
            عدد المستندات: {formatNumber(Number(data.documentsCount ?? 0))}
          </div>
          <div className="text-sm font-semibold text-slate-600">
            المرسل في: {formatDateTime(Number(data.submittedAt ?? 0))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">قرار المراجعة</div>
          <form action={submitReview} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["in_review", "قيد المراجعة"],
                ["approved", "اعتماد"],
                ["rejected", "رفض"],
              ].map(([value, label]) => (
                <label key={value} className="border-2 border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700">
                  <input type="radio" name="status" value={value} defaultChecked={value === "in_review"} className="ml-2" />
                  {label}
                </label>
              ))}
            </div>
            <textarea
              name="reviewerNotes"
              rows={6}
              placeholder="اكتب ملاحظات المراجعة هنا..."
              defaultValue={String(data.reviewerNotes ?? "")}
              className="w-full border-2 border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="inline-flex border-2 border-blue-600 bg-blue-600 px-5 py-3 text-sm font-black text-white">
              حفظ القرار
            </button>
          </form>

          <div className="space-y-3 border-t-2 border-slate-100 pt-4">
            <div className="text-sm font-black text-blue-600">تسلسل القرار</div>
            {decisionHistory.map((item) => (
              <div key={String(item.id)} className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="font-black text-slate-900">{String(item.label ?? "حدث")}</div>
                    <div className="text-xs font-semibold text-slate-500">{formatDateTime(Number(item.createdAt ?? 0))}</div>
                    {item.notes ? <div className="text-sm font-semibold text-slate-600">{String(item.notes)}</div> : null}
                  </div>
                  <StatusBadge value={String(item.status ?? "unknown")} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">ملخص الطلب</div>
        <div className="space-y-3">
          <div className="border-2 border-slate-100 bg-slate-50 p-4">
            <div className="text-xs font-black text-slate-500">العنوان</div>
            <div className="mt-2 text-xl font-black text-slate-900">{String(data.title ?? "طلب تحقق")}</div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">النوع</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{labelForVerificationType(String(data.requestType ?? "user"))}</div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">الحالة</div>
              <div className="mt-3"><StatusBadge value={String(data.currentStatus ?? "unknown")} /></div>
            </div>
          </div>
        </div>
      </WorkspacePanel>
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">الجهة المرتبطة</div>
        <JsonPreview value={subject} />
        <div className="text-sm font-black text-blue-600">البيانات المقدمة</div>
        <JsonPreview value={data.submittedData ?? {}} />
      </WorkspacePanel>
    </div>
  );
}
