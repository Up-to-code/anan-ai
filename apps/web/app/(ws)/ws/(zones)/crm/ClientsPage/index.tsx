"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PersonCard from "../../../_components/Visuals/PersonCard";
import type { CrmClientRecord } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

const STAGE_LABELS: Record<CrmClientRecord["stage"], string> = {
  new: "جديد",
  qualified: "مؤهل",
  proposal: "عرض",
  won: "مغلقة",
  lost: "مفقودة",
};

function matchesClientFilter(client: CrmClientRecord, filterKey: string) {
  if (filterKey === "all") return true;
  if (filterKey === "unlinked") return !client.project && !client.broker;
  if (filterKey === "project") return Boolean(client.project) && !client.broker;
  if (filterKey === "full") return Boolean(client.project) && Boolean(client.broker);
  return true;
}

function ClientCard({ client }: { client: CrmClientRecord }) {
  return (
    <PersonCard
      person={{
        id: client.id,
        type: client.personType,
        name: client.name,
        title: "صفقة نشطة",
        avatarImage: client.avatarImage,
        avatarLabel: client.avatarLabel,
        location: client.project?.location,
        summary: client.preference,
        stageLabel: STAGE_LABELS[client.stage],
        badges: client.badges,
        relation: {
          project: client.project,
          unit: client.unit,
        },
      }}
      footer={(
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <div className="text-sm text-slate-600">الميزانية: {client.budgetLabel}</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-500">
              {client.broker ? `مع ${client.broker.name}` : "بدون وسيط"}
            </div>
            <Link
              href={`/ws/crm/clients/${client.id}`}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              فتح
            </Link>
          </div>
        </div>
      )}
    />
  );
}

const FILTER_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "unlinked", label: "بدون روابط" },
  { key: "project", label: "مشروع فقط" },
  { key: "full", label: "مشروع + وسيط" },
] as const;

export default function ClientsPage({ clients }: { clients: CrmClientRecord[] }) {
  const [filterKey, setFilterKey] = useState("all");
  const visibleClients = clients.filter((client) => matchesClientFilter(client, filterKey));
  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة الصفقات"
        title="العملاء"
        description=""
        actions={
          <Link
            href="/ws/crm/clients/add"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            إضافة صفقة
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <FilterChipBar chips={[...FILTER_CHIPS]} activeKey={filterKey} onChange={setFilterKey} />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleClients.map((client) => <ClientCard key={client.id} client={client} />)}
        </div>
      </div>
    </div>
  );
}
