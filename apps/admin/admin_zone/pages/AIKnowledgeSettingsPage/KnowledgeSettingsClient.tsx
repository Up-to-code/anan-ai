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
      title="مستودع المعرفة"
      description="مراجعة وتدقيق إضافات المعرفة المقترحة لضمان دقة استجابات الوكلاء."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة مصدر", href: "/ai-settings/knowledge/new" }]} />}
    >
      <div className="grid gap-8 xl:grid-cols-3">
        {[
          { key: "pending", title: "مراجعة معلقة", items: grouped.pending, color: "primary" },
          { key: "accepted", title: "معرفة معتمدة", items: grouped.accepted, color: "emerald-500" },
          { key: "rejected", title: "معرفة مرفوضة", items: grouped.rejected, color: "rose-500" },
        ].map((column) => (
          <WorkspacePanel key={column.key} className="rounded-3xl p-8 flex flex-col gap-8 border-border/30 bg-card/60 shadow-sm self-start">
            <div className="space-y-1.5 px-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">{column.title}</h2>
              <p className="text-[12px] font-heavy text-muted-foreground/30 uppercase tracking-widest">{column.items.length} items</p>
            </div>
            
            <div className="grid gap-4">
              {column.items.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-[24px] border border-border/20 bg-background p-6 transition-all hover:shadow-xl hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <Link href={`/ai-settings/knowledge/${item.id}`} className="block text-[15px] font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </Link>
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40">{item.source} <span className="mx-1">•</span> {item.submittedBy}</div>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="mt-4 text-[13px] font-bold leading-relaxed text-muted-foreground/60 line-clamp-2">{item.summary}</p>
                  
                  {item.status === "pending" && (
                    <div className="mt-6 flex gap-3">
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(item.id, "accepted")}
                        className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-10 shadow-lg shadow-primary/10"
                      >
                        اعتماد
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateStatus(item.id, "rejected")}
                        className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest px-4 h-10 border-border/40"
                      >
                        رفض
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 border-t border-border/5 pt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/ai-settings/knowledge/${item.id}/edit`} className="hover:text-primary transition-colors">تعديل</Link>
                    <Link href={`/ai-settings/knowledge/${item.id}/delete`} className="hover:text-rose-500 transition-colors">حذف</Link>
                  </div>
                </div>
              ))}
              {column.items.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center px-6 rounded-3xl border-2 border-dashed border-border/10 bg-muted/5">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/20 leading-relaxed max-w-[140px]">
                    لا توجد عناصر في هذا الطابور حاليًا
                  </div>
                </div>
              )}
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
