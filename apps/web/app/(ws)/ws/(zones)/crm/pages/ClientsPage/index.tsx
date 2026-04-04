"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { formatWebCopy } from "@/lib/i18n";
import FilterChipBar from "../../../../_components/Visuals/FilterChipBar";
import PersonCard from "../../../../_components/Visuals/PersonCard";
import type { CrmClientRecord } from "../../types/crmTypes";

function matchesClientFilter(client: CrmClientRecord, filterKey: string) {
  if (filterKey === "all") return true;
  if (filterKey === "unlinked") return !client.project && !client.broker;
  if (filterKey === "project") return Boolean(client.project) && !client.broker;
  if (filterKey === "full") return Boolean(client.project) && Boolean(client.broker);
  return true;
}

function ClientCard({ client }: { client: CrmClientRecord }) {
  const { dictionary, locale } = useWebLocale();
  const stageLabels: Record<CrmClientRecord["stage"], string> = {
    new: locale === "fr" ? "Nouveau" : locale === "en" ? "New" : "جديد",
    qualified: locale === "fr" ? "Qualifié" : locale === "en" ? "Qualified" : "مؤهل",
    proposal: locale === "fr" ? "Proposition" : locale === "en" ? "Proposal" : "عرض",
    won: locale === "fr" ? "Clôturé" : locale === "en" ? "Closed" : "مغلقة",
    lost: locale === "fr" ? "Perdu" : locale === "en" ? "Lost" : "مفقودة",
  };
  return (
    <PersonCard
      person={{
        id: client.id,
        type: client.personType,
        name: client.name,
        title: client.relationLabel,
        avatarImage: client.avatarImage,
        avatarLabel: client.avatarLabel,
        location: client.project?.location,
        summary: client.preference,
        stageLabel: stageLabels[client.stage],
        badges: client.badges,
        relation: {
          project: client.project,
          unit: client.unit,
        },
      }}
      footer={(
        <div className="space-y-4 border-t border-border/60 pt-4 mt-1">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{dictionary.crm.budget}: {client.budgetLabel}</div>
          <div className="text-[12px] font-black text-blue-700">{client.relationLabel}</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] font-medium text-foreground/70">
              {client.broker
                ? formatWebCopy(dictionary.crm.withBroker, { name: client.broker.name })
                : dictionary.crm.withoutBroker}
            </div>
            <Link
              href={`/ws/crm/clients/${client.id}`}
              className="rounded-xl border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground transition hover:border-foreground/30 hover:bg-muted/10"
            >
              {dictionary.crm.open}
            </Link>
          </div>
        </div>
      )}
    />
  );
}

export default function ClientsPage({
  clients,
  initialFilter,
  pagination,
}: {
  clients: CrmClientRecord[];
  initialFilter: string;
  pagination: { cursor: string | null; continueCursor: string | null; isDone: boolean };
}) {
  const { dictionary } = useWebLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filterKey, setFilterKey] = useState(initialFilter);
  const visibleClients = useMemo(() => clients.filter((client) => matchesClientFilter(client, filterKey)), [clients, filterKey]);

  function navigate(nextCursor: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (filterKey && filterKey !== "all") params.set("filter", filterKey);
    else params.delete("filter");
    if (nextCursor) params.set("cursor", nextCursor);
    else params.delete("cursor");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="flex flex-col gap-6 px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{dictionary.crm.clientsTitle}</h1>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-[0.05em]">{dictionary.crm.clientsDescription}</p>
          </div>
          <Link
            href="/ws/crm/clients/add"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-[13px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {dictionary.crm.addClient}
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-6">
          <FilterChipBar
            chips={[
              { key: "all", label: dictionary.crm.all },
              { key: "unlinked", label: dictionary.crm.unlinked },
              { key: "project", label: dictionary.crm.projectOnly },
              { key: "full", label: dictionary.crm.fullyLinked },
            ]}
            activeKey={filterKey}
            onChange={(nextFilter) => {
              setFilterKey(nextFilter);
              const params = new URLSearchParams(searchParams.toString());
              if (nextFilter === "all") params.delete("filter");
              else params.set("filter", nextFilter);
              params.delete("cursor");
              router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            }}
          />
          
          <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            {formatWebCopy(dictionary.crm.resultsCount, { count: String(visibleClients.length) })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleClients.map((client) => <ClientCard key={client.id} client={client} />)}
          </div>

          {visibleClients.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-20 text-center">
              <p className="text-sm font-bold text-muted-foreground">{dictionary.crm.noMatchingClients}</p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(null)}
              disabled={!pagination.cursor}
              className="rounded-xl border border-border px-4 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted disabled:opacity-40"
            >
              {dictionary.crm.firstPage}
            </button>
            <div className="text-[12px] font-bold text-muted-foreground">
              {pagination.isDone ? dictionary.crm.lastPageNow : dictionary.crm.nextPageAvailable}
            </div>
            <button
              type="button"
              onClick={() => navigate(pagination.continueCursor)}
              disabled={!pagination.continueCursor}
              className="rounded-xl border border-foreground bg-foreground px-4 py-2 text-[12px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-40"
            >
              {dictionary.crm.nextPage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
