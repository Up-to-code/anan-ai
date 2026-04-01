"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, CircleDot, FolderArchive, Handshake, UserRoundSearch } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import OfferPaginationNav from "../OfferPaginationNav";
import { formatOfferPrice, formatOfferStageLabel, formatOfferTypeLabel } from "../offerViewModel";
import type { WorkspaceOfferQueue, WorkspaceOfferQueueKey } from "../offerTypes";

const queueIcons: Record<WorkspaceOfferQueueKey, typeof Handshake> = {
  client_needs_match: UserRoundSearch,
  inventory_i_can_share: Building2,
  incoming_opportunities: CircleDot,
  shared_by_me: BriefcaseBusiness,
  active_collaborations: Handshake,
  archived: FolderArchive,
  open_inventory: Building2,
  incoming_broker_requests: UserRoundSearch,
  targeted_shares: BriefcaseBusiness,
};

function OfferCaseCard({ item }: { item: WorkspaceOfferQueue["items"][number] }) {
  const { dictionary } = useWebLocale();
  const clientContext = item.clientContext;
  const image = item.property?.imageUrl ?? "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80";
  const owner = item.participants.find((participant) => participant.role === "inventory_owner") ?? item.participants[0] ?? null;
  const executionPartner = item.participants.find((participant) => participant.role === "execution_partner") ?? null;

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={item.property?.title ?? item.message} className="h-52 w-full object-cover lg:h-full" />
        <div className="grid gap-5 p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                {formatOfferTypeLabel(item.type)}
              </span>
                <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold text-foreground">
                  {formatOfferStageLabel(item.stage)}
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground">{item.message}</h2>
              <p className="max-w-2xl text-[14px] leading-7 text-muted-foreground">
                {item.description ?? item.property?.address ?? dictionary.offers.noClearAsset}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{dictionary.offers.value}</div>
              <div className="mt-1 text-xl font-black text-foreground">{formatOfferPrice(item.price)}</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{dictionary.offers.asset}</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{item.property?.title ?? dictionary.offers.noClearAsset}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{item.property?.address ?? dictionary.offers.unspecified}</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{dictionary.offers.inventoryOwner}</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{owner?.organizationName ?? dictionary.offers.unknownOwner}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{item.commissionText ?? dictionary.offers.noCommissionDetails}</div>
            </div>
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{dictionary.offers.executionPartner}</div>
              <div className="mt-2 text-[15px] font-black text-foreground">{executionPartner?.organizationName ?? dictionary.offers.notAssignedYet}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">{item.permitStatus ?? dictionary.offers.noPermitStatus}</div>
            </div>
          </div>

          {clientContext ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-right">
              <div className="text-[11px] font-bold uppercase tracking-widest text-sky-700">{dictionary.offers.clientSummary}</div>
              <div className="mt-2 text-[15px] font-black text-sky-950">{clientContext.clientName}</div>
              <div className="mt-1 text-[13px] text-sky-900/80">{clientContext.clientNeed}</div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] font-medium text-muted-foreground">
              {item.allowedAudience === "both"
                ? dictionary.offers.openToBrokersAndDevelopers
                : item.allowedAudience === "brokers"
                  ? dictionary.offers.targetedToBrokers
                  : dictionary.offers.targetedToDevelopers}
            </div>
            <Link
              href={item.href}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted"
            >
              {dictionary.offers.openCase}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function OfferOverviewPage({
  queues,
  selectedQueue,
}: {
  queues: Array<
    WorkspaceOfferQueue & {
      pagination: {
        items: WorkspaceOfferQueue["items"];
        page: number;
        pageCount: number;
        totalItems: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
      };
    }
  >;
  selectedQueue: WorkspaceOfferQueueKey | "all";
}) {
  const { dictionary } = useWebLocale();

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="grid gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <header className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{dictionary.offers.eyebrow}</div>
            <h1 className="mt-2 text-3xl font-black text-foreground">{dictionary.offers.title}</h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">
              {dictionary.offers.description}
            </p>
          </div>
          <Link
            href="/ws/offers/create"
            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
          >
            {dictionary.offers.create}
          </Link>
        </header>

        <nav className="flex flex-wrap gap-2">
          <Link
            href="/ws/offers"
            className={selectedQueue === "all"
              ? "rounded-2xl bg-foreground px-4 py-2 text-[13px] font-bold text-background"
              : "rounded-2xl border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground"}
          >
            {dictionary.offers.allQueues}
          </Link>
          {queues.map((queue) => {
            const Icon = queueIcons[queue.key];
            return (
              <Link
                key={queue.key}
                href={`/ws/offers?queue=${queue.key}`}
                className={selectedQueue === queue.key
                  ? "inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-2 text-[13px] font-bold text-background"
                  : "inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground"}
              >
                <Icon className="h-4 w-4" />
                {queue.label}
              </Link>
            );
          })}
        </nav>

        <div className="grid gap-6">
          {queues.map((queue) => {
            if (selectedQueue !== "all" && selectedQueue !== queue.key) {
              return null;
            }

            const Icon = queueIcons[queue.key];

            return (
              <section key={queue.key} className="grid gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      {dictionary.offers.queue}
                    </div>
                    <h2 className="mt-2 text-2xl font-black text-foreground">{queue.label}</h2>
                    <p className="mt-2 max-w-3xl text-[14px] leading-7 text-muted-foreground">{queue.description}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{dictionary.offers.casesCount}</div>
                    <div className="mt-1 text-2xl font-black text-foreground">{queue.pagination.totalItems}</div>
                  </div>
                </div>

                {queue.pagination.items.length > 0 ? (
                  <div className="grid gap-4">
                    {queue.pagination.items.map((item) => (
                      <OfferCaseCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-[14px] font-medium text-muted-foreground">
                    {dictionary.offers.emptyQueue}
                  </div>
                )}

                {queue.pagination.totalItems > 0 ? (
                  <OfferPaginationNav
                    page={queue.pagination.page}
                    pageCount={queue.pagination.pageCount}
                    hasPreviousPage={queue.pagination.hasPreviousPage}
                    hasNextPage={queue.pagination.hasNextPage}
                    routeBase={selectedQueue === "all" ? "/ws/offers" : `/ws/offers?queue=${queue.key}`}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
