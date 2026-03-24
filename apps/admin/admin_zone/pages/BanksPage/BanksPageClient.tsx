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
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredBanks.map((bank) => (
          <WorkspacePanel key={bank.id} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Link href={`/banks/${bank.id}`} className="text-lg font-semibold text-slate-900 hover:text-blue-600">{bank.name}</Link>
                <div className="mt-1 text-sm text-slate-500">{bank.contactEmail}</div>
              </div>
              <StatusBadge value={bank.status} />
            </div>
            <p className="text-sm leading-7 text-slate-600">{bank.notes}</p>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>عدد المنتجات: {bank.products.length}</span>
              <span>{bank.assistantEnabled ? "متاح للمساعد" : "داخلي فقط"}</span>
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
