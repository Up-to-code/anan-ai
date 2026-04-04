"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Briefcase, UserRound } from "lucide-react";
import type { OfferOrganizationSummary, OffersDirectoryProfile } from "@/server/contracts/organizations";
import OfferPaginationNav from "../../shared/components/OfferPaginationNav";
import { cn } from "@/lib/utils";

export type DirectoryEntityFilter = "businessPersons" | "organizationPeople";

type DirectoryPagination = {
  totalItems: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type DirectoryPersonCard = {
  id: string;
  avatarUrl: string | null;
  avatarLabel: string;
  displayName: string;
  organizationName: string;
  role: "broker" | "developer";
  href: string | null;
};

type DirectoryOrganizationCard = {
  id: string;
  logoUrl: string | null;
  avatarLabel: string;
  displayName: string;
  offerCount: number;
  href: string;
};

function DirectoryPersonCardView({ person }: { person: DirectoryPersonCard }) {
  const content = (
    <>
      <div className="flex items-start gap-4">
        {person.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={person.avatarUrl} alt={person.displayName} className="h-16 w-16 rounded-2xl border border-border shadow-sm object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/10 text-lg font-black text-muted-foreground/40">
            {person.avatarLabel}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-[15px] font-black tracking-tight text-foreground">{person.displayName}</h2>
          <p className="truncate text-[13px] font-medium text-muted-foreground/60">{person.organizationName}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">
          <UserRound className="h-3.5 w-3.5" />
          {person.role === "broker" ? "وسيط" : "مطور"}
        </div>
        <div className="text-[11px] font-black uppercase tracking-widest text-foreground/60">
          {person.href?.includes("/ws/inbox/") ? "بدء محادثة" : "عرض الملف"}
        </div>
      </div>
    </>
  );

  if (person.href) {
    return (
      <Link href={person.href} className="group rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-black/[0.02] transition-all hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return <article className="rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-black/[0.02]">{content}</article>;
}

function DirectoryOrganizationCardView({
  organization,
  type,
}: {
  organization: DirectoryOrganizationCard;
  type: "broker" | "developer";
}) {
  return (
    <Link href={organization.href} className="group rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-black/[0.02] transition-all hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex items-start gap-4">
        {organization.logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={organization.logoUrl} alt={organization.displayName} className="h-16 w-16 rounded-2xl border border-border shadow-sm object-contain p-2 bg-background" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/10 text-lg font-black text-muted-foreground/40">
            {organization.avatarLabel}
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-[15px] font-black tracking-tight text-foreground">{organization.displayName}</h2>
          <p className="truncate text-[13px] font-medium text-muted-foreground/60">{type === "broker" ? "شركاء وساطة" : "شركاء تطوير"}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">
          <Building2 className="h-3.5 w-3.5" />
          جهة معتمدة
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-foreground/60">
          <Briefcase className="h-3.5 w-3.5" />
          {organization.offerCount} عروض
        </div>
      </div>
    </Link>
  );
}

function avatarLabelFromName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return [...trimmed].slice(0, 1).join("").toUpperCase();
}

export function mapDirectoryPeopleToCards(people: OffersDirectoryProfile[]): DirectoryPersonCard[] {
  return people.map((person) => ({
    id: person.id,
    avatarUrl: person.image ?? null,
    avatarLabel: avatarLabelFromName(person.name),
    displayName: person.name,
    organizationName: person.organizationName,
    role: person.role,
    href: person.conversationId
      ? `/ws/inbox/${person.conversationId}`
      : person.organizationSlug
        ? `/ws/offers/directory/${person.role}/${person.organizationSlug}`
        : null,
  }));
}

export function mapDirectoryOrganizationsToCards(
  organizations: OfferOrganizationSummary[],
  type: "broker" | "developer",
): DirectoryOrganizationCard[] {
  return organizations.map((organization) => ({
    id: organization.id,
    logoUrl: organization.logo ?? null,
    avatarLabel: avatarLabelFromName(organization.name),
    displayName: organization.name,
    offerCount: organization.offerCount,
    href: `/ws/offers/directory/${type}/${organization.slug}`,
  }));
}

/**
 * WHY:   Offer collaboration needs one practical directory where users can quickly switch between people and organizations.
 * WHAT:  Renders a role-scoped directory with entity filters for business people vs organizations.
 * HOW:   Receives pre-paginated collections from the route and swaps the rendered grid based on local filter state.
 */
export default function OfferDirectoryPage({
  title,
  description,
  people,
  organizations,
  peoplePagination,
  organizationsPagination,
  routeBase,
  initialFilter = "businessPersons",
}: {
  title: string;
  description: string;
  people: OffersDirectoryProfile[];
  organizations: OfferOrganizationSummary[];
  peoplePagination: DirectoryPagination;
  organizationsPagination: DirectoryPagination;
  routeBase: string;
  initialFilter?: DirectoryEntityFilter;
}) {
  const [activeFilter, setActiveFilter] = useState<DirectoryEntityFilter>(initialFilter);

  const type = routeBase.includes("brokers") ? "broker" : "developer";
  const peopleCards = mapDirectoryPeopleToCards(people);
  const organizationCards = mapDirectoryOrganizationsToCards(organizations, type);

  const cards = activeFilter === "businessPersons" ? peopleCards : organizationCards;
  const pagination = activeFilter === "businessPersons" ? peoplePagination : organizationsPagination;

  return (
    <div className="flex min-h-full flex-col pb-24 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:px-10 lg:py-16">
        <header className="space-y-2 text-right">
          <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
          <p className="max-w-3xl text-[15px] font-medium leading-relaxed text-muted-foreground/70">
            {description}
          </p>
        </header>

        <div className="flex flex-wrap gap-2.5" data-slot="directory-filters">
          <button
            type="button"
            onClick={() => setActiveFilter("businessPersons")}
            className={cn(
              "rounded-2xl border px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.1em] transition-all",
              activeFilter === "businessPersons"
                ? "border-foreground bg-foreground text-background shadow-lg shadow-black/10 scale-105"
                : "border-border/40 bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/20",
            )}
          >
            Business persons
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("organizationPeople")}
            className={cn(
              "rounded-2xl border px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.1em] transition-all",
              activeFilter === "organizationPeople"
                ? "border-foreground bg-foreground text-background shadow-lg shadow-black/10 scale-105"
                : "border-border/40 bg-card text-muted-foreground hover:border-foreground/20 hover:bg-muted/20",
            )}
          >
            People in companies or organizations
          </button>
        </div>

        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          {pagination.totalItems} نتائج متوفرة
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-slot="directory-grid">
          {activeFilter === "businessPersons" &&
            peopleCards.map((person) => <DirectoryPersonCardView key={person.id} person={person} />)}

          {activeFilter === "organizationPeople" &&
            organizationCards.map((organization) => (
              <DirectoryOrganizationCardView key={organization.id} organization={organization} type={type} />
            ))}
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-16 text-center text-sm font-semibold text-muted-foreground">
            {activeFilter === "businessPersons"
              ? "لا توجد ملفات أشخاص متاحة ضمن هذا التصنيف."
              : "لا توجد جهات متاحة ضمن هذا التصنيف."}
          </div>
        ) : (
          <OfferPaginationNav
            page={pagination.page}
            pageCount={pagination.pageCount}
            hasPreviousPage={pagination.hasPreviousPage}
            hasNextPage={pagination.hasNextPage}
            routeBase={routeBase}
          />
        )}
      </div>
    </div>
  );
}
