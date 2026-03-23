"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Button from "@/components/shared/Button";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";
import type { KnowledgeItemRecord } from "@/admin_zone/mocks/types";

type KnowledgeSettingsClientProps = {
  items: KnowledgeItemRecord[];
};

/**
 * WHY:   Knowledge governance needs a UI-only moderation surface before wiring real backend review actions.
 * WHAT:  Renders pending, accepted, and rejected knowledge items with local-only approve/reject actions.
 * HOW:   Keeps the current knowledge list in local state and updates status fields in memory only.
 */
export default function KnowledgeSettingsClient({ items }: KnowledgeSettingsClientProps) {
  const [knowledgeItems, setKnowledgeItems] = useState(items);

  function updateStatus(id: string, status: KnowledgeItemRecord["status"]) {
    setKnowledgeItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  const grouped = useMemo(
    () => ({
      pending: knowledgeItems.filter((item) => item.status === "pending"),
      accepted: knowledgeItems.filter((item) => item.status === "accepted"),
      rejected: knowledgeItems.filter((item) => item.status === "rejected"),
    }),
    [knowledgeItems],
  );

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title="قاعدة المعرفة"
      description="مراجعة إضافات المعرفة المقترحة قبل قبولها أو رفضها بشريًا."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة عنصر", href: "/ai-settings/knowledge/new" }]} />}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        {[
          { key: "pending", title: "بانتظار القرار", items: grouped.pending },
          { key: "accepted", title: "المعرفة المقبولة", items: grouped.accepted },
          { key: "rejected", title: "المعرفة المرفوضة", items: grouped.rejected },
        ].map((column) => (
          <WorkspacePanel key={column.key} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">{column.title}</h2>
            <div className="space-y-3">
              {column.items.map((item) => (
                <div key={item.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/ai-settings/knowledge/${item.id}`} className="font-medium text-slate-900 hover:underline">
                      {item.title}
                    </Link>
                    <StatusBadge value={item.status} />
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{item.source} · {item.submittedBy}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                  {item.status === "pending" ? (
                    <div className="mt-4 flex gap-3">
                      <Button onClick={() => updateStatus(item.id, "accepted")}>قبول</Button>
                      <Button variant="outline" onClick={() => updateStatus(item.id, "rejected")}>رفض</Button>
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <Link href={`/ai-settings/knowledge/${item.id}/edit`} className="underline-offset-2 hover:underline">تعديل</Link>
                    <Link href={`/ai-settings/knowledge/${item.id}/delete`} className="underline-offset-2 hover:underline">حذف</Link>
                  </div>
                </div>
              ))}
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
