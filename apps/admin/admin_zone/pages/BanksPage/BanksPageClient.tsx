"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import type { BankRecord } from "@/admin_zone/mocks/types";

type BanksPageClientProps = {
  banks: BankRecord[];
};

/**
 * WHY:   Finance admins need a simple bank catalog page before wiring real assistant loan configuration.
 * WHAT:  Renders searchable bank cards and product counts from mock data.
 * HOW:   Filters the bank list locally and links each record to its bank detail page.
 */
export default function BanksPageClient({ banks }: BanksPageClientProps) {
  const [search, setSearch] = useState("");

  const filteredBanks = useMemo(
    () => banks.filter((bank) => [bank.name, bank.notes].some((value) => value.toLowerCase().includes(search.toLowerCase()))),
    [banks, search],
  );

  return (
    <SectionScaffold
      eyebrow="التمويل والبنوك"
      title="البنوك"
      description="إدارة كتالوج البنوك ومنتجات التمويل التي يمكن أن يستفيد منها المساعد."
      actions={<PageActions actions={[{ label: "إضافة بنك", href: "/banks/new" }]} />}
    >
      <div className="max-w-md">
        <AdminInput placeholder="ابحث باسم البنك" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredBanks.map((bank) => (
          <WorkspacePanel key={bank.id} className="flex flex-col gap-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Link href={`/banks/${bank.id}`} className="block text-xl font-black tracking-tight text-foreground hover:text-primary transition-colors">
                  {bank.name}
                </Link>
                <div className="text-[12px] font-bold text-muted-foreground/50">{bank.contactEmail}</div>
              </div>
              <StatusBadge value={bank.status} />
            </div>
            
            <p className="text-[13px] font-bold leading-relaxed text-muted-foreground/70 line-clamp-2">
              {bank.notes}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 leading-none">عدد المنتجات</div>
                <div className="text-sm font-black text-foreground tracking-tight">{bank.products.length}</div>
              </div>
              <div className="rounded-xl border border-border/30 bg-muted/5 p-4 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 leading-none">إتاحة المساعد</div>
                <div className="text-sm font-black text-foreground tracking-tight">{bank.assistantEnabled ? "متاح" : "داخلي"}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 border-t border-border/20 pt-4 mt-auto">
              <Link href={`/banks/${bank.id}`} className="hover:text-primary transition-colors">عرض التفاصيل</Link>
              <Link href={`/banks/${bank.id}/edit`} className="hover:text-primary transition-colors">تعديل</Link>
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
