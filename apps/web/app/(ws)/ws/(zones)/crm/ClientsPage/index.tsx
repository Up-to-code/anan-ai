"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PersonCard, {
  brokerPresenceToPersonCard,
} from "../../../_components/Visuals/PersonCard";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { CrmClientRecord } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

/**
 * WHY:   The CRM client index should be segmented visually instead of reading like a flat text list.
 * WHAT:  Renders client cards with chip-based filtering by relationship completeness.
 * HOW:   Keeps the selected segment in local state while the route stays SSR-backed.
 */
export default function ClientsPage({
  clients,
}: {
  clients: CrmClientRecord[];
}) {
  const [filterKey, setFilterKey] = useState("all");

  const visibleClients = clients.filter((client) => {
    if (filterKey === "all") return true;
    if (filterKey === "unlinked") return !client.project && !client.broker;
    if (filterKey === "project") return Boolean(client.project) && !client.broker;
    if (filterKey === "full") return Boolean(client.project) && Boolean(client.broker);
    return true;
  });

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة العملاء"
        title="قائمة العملاء"
        description="بطاقات مرئية للعملاء مع المشروع والوسيط المرتبطين بهم أو حالة الفراغ إذا لم يوجد أي ربط."
        actions={
          <Link
            href="/ws/crm/clients/add"
            className="inline-flex items-center gap-2 border border-blue-600 bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white transition hover:border-slate-950 hover:bg-slate-950"
          >
            <Plus className="h-4 w-4" />
            إضافة عميل جديد
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <FilterChipBar
          chips={[
            { key: "all", label: "الكل" },
            { key: "unlinked", label: "بدون روابط" },
            { key: "project", label: "مشروع فقط" },
            { key: "full", label: "مشروع + وسيط" },
          ]}
          activeKey={filterKey}
          onChange={setFilterKey}
        />

        <div className="w-full max-w-6xl overflow-x-auto border border-slate-200 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase">العميل</th>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase">المرحلة</th>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase">الاهتمام</th>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase">الميزانية</th>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase">التكليفات</th>
                <th className="px-6 py-4 font-black text-slate-900 tracking-widest text-[11px] uppercase text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleClients.map((client) => (
                <tr key={client.id} className="transition hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex-shrink-0 bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs uppercase">
                        {(client.name || "U").slice(0, 2)}
                      </div>
                      <span className="font-black text-slate-950">{client.name}</span>
                      {client.badges?.includes("vip") && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5 ml-2">
                          VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 bg-white px-2 py-1">
                      {client.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{client.preference}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{client.budgetLabel}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {client.project ? (
                        <span className="text-[10px] font-black tracking-widest text-blue-600">
                          {client.project.title}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black tracking-widest text-slate-400">بدون مشروع</span>
                      )}
                      {client.broker ? (
                        <span className="text-[10px] font-black tracking-widest text-emerald-600">
                          مع {client.broker.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black tracking-widest text-slate-400">بدون وسيط</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <Link
                      href={`/ws/crm/clients/${client.id}`}
                      className="inline-flex border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 transition group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                    >
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
