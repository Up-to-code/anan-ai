"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Briefcase, UserRound } from "lucide-react";
import type { OfferOrganizationSummary, OffersDirectoryProfile } from "@/server/contracts/organizations";
import OfferPaginationNav from "../OfferPaginationNav";
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
      <div className="flex items-start gap-3">
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.avatarUrl} alt={person.displayName} className="h-12 w-12 rounded-full border border-slate-200 object-cover dark:border-slate-700" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {person.avatarLabel}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{person.displayName}</h2>
          <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">{person.organizationName}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <UserRound className="h-3.5 w-3.5" />
          {person.role === "broker" ? "وسيط" : "مطور"}
        </div>
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{person.href?.includes("/ws/inbox/") ? "محادثة" : "الملف"}</span>
      </div>
    </>
  );

  if (person.href) {
    return (
      <Link href={person.href} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
        {content}
      </Link>
    );
  }

  return <article className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">{content}</article>;
}

function DirectoryOrganizationCardView({
  organization,
  type,
}: {
  organization: DirectoryOrganizationCard;
  type: "broker" | "developer";
}) {
  return (
    <Link href={organization.href} className="rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
      <div className="flex items-start gap-3">
        {organization.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={organization.logoUrl} alt={organization.displayName} className="h-12 w-12 rounded-md border border-slate-200 object-cover p-1 dark:border-slate-700" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {organization.avatarLabel}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{organization.displayName}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{type === "broker" ? "شركة وساطة" : "شركة تطوير"}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="h-3.5 w-3.5" />
          جهة عمل
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-200">
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
    <div className="flex min-h-full flex-col pb-24">
      <div className="flex flex-col gap-6 px-6 py-8 lg:px-10 lg:py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-slate-100">{title}</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" data-slot="directory-filters">
          <button
            type="button"
            onClick={() => setActiveFilter("businessPersons")}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
              activeFilter === "businessPersons"
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600",
            )}
          >
            Business persons
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("organizationPeople")}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
              activeFilter === "organizationPeople"
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600",
            )}
          >
            People in companies or organizations
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {pagination.totalItems} نتائج
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
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-16 text-center text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
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
