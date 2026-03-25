import type { OfferMarketplaceItem } from "../offerTypes";
import Link from "next/link";
import { Eye, MapPin, Plus } from "lucide-react";
import OfferPaginationNav from "../OfferPaginationNav";
import type { OffersTabKey } from "../offersPageData";

function kindLabel(kind: OfferMarketplaceItem["kind"]) {
  if (kind === "developer") return "مطور";
  if (kind === "broker") return "وسيط";
  if (kind === "client") return "عميل";
  return "ربط";
}

function avatarLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return [...trimmed].slice(0, 1).join("").toUpperCase();
}

function OfferOwnerBlock({ item }: { item: OfferMarketplaceItem }) {
  const ownerKindLabel = item.kind === "broker" ? "وسيط" : item.kind === "developer" ? "شركة تطوير" : "جهة العرض";
  return (
    <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700">
        {avatarLabel(item.ownerLabel)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-800">{item.ownerLabel}</div>
        <div className="text-xs text-slate-500">{ownerKindLabel}</div>
      </div>
    </div>
  );
}

function OfferMetaGrid({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-md border border-slate-200 bg-white p-2">
        <div className="text-xs text-slate-500">سعر العرض</div>
        <div className="mt-1 font-semibold text-slate-900">{item.priceLabel}</div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-2">
        <div className="text-xs text-slate-500">نوع العرض</div>
        <div className="mt-1 font-semibold text-slate-900">{item.propertyType}</div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-2">
        <div className="text-xs text-slate-500">{item.linkedProperty ? "سعر العقار" : "متوسط السعر"}</div>
        <div className="mt-1 font-semibold text-slate-900">
          {item.linkedProperty?.askingPriceLabel ?? item.fallbackDetails?.averagePriceLabel ?? "غير متوفر"}
        </div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-2">
        <div className="text-xs text-slate-500">{item.linkedProperty ? "العقار" : "المشروع"}</div>
        <div className="mt-1 font-semibold text-slate-900">
          {item.linkedProperty?.title ?? item.fallbackDetails?.propertyLabel ?? item.project.title}
        </div>
      </div>
    </div>
  );
}

function OfferCardFooter({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <div className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate">{item.location}</span>
      </div>
      <Link
        href={`/ws/offers/${item.id}`}
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <Eye className="h-3.5 w-3.5" />
        استعراض
      </Link>
    </div>
  );
}

function OfferOverviewCard({ item }: { item: OfferMarketplaceItem }) {
  const image = item.linkedProperty?.image ?? item.image;
  const heading = item.linkedProperty?.title ?? item.title;
  const location = item.linkedProperty?.location ?? item.fallbackDetails?.locationLabel ?? item.location;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <Link href={`/ws/offers/${item.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={heading} className="h-40 w-full object-cover" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/ws/offers/${item.id}`} className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-slate-700">
            {heading}
          </Link>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
            {kindLabel(item.kind)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {item.linkedProperty ? "العقار المرتبط" : "البيانات المتاحة"}: {location}
        </p>
        <OfferOwnerBlock item={item} />
        <OfferMetaGrid item={item} />
        <OfferCardFooter item={item} />
      </div>
    </article>
  );
}

function OfferTabs({ selectedTab }: { selectedTab: OffersTabKey }) {
  const tabs: Array<{ href: string; label: string; key: OffersTabKey }> = [
    { key: "all", label: "الكل", href: "/ws/offers" },
    { key: "received", label: "الواردة", href: "/ws/offers?tab=received" },
    { key: "sent", label: "المرسلة", href: "/ws/offers?tab=sent" },
  ];

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap gap-6" aria-label="Offers tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={tab.key === selectedTab
              ? "border-b-2 border-slate-950 pb-3 text-sm font-medium text-slate-950"
              : "border-b-2 border-transparent pb-3 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900"}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function OfferOverviewToolbar({ page, pageCount }: { page: number; pageCount: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/ws/offers/create"
          className="inline-flex items-center gap-2 rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          طرح عرض جديد
        </Link>
        <Link href="/ws/offers/brokers" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          الوسطاء
        </Link>
        <Link href="/ws/offers/developers" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          المطورون
        </Link>
        <Link href="/ws/offers/search" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          البحث
        </Link>
      </div>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        صفحة {page} من {pageCount}
      </div>
    </div>
  );
}

function OfferOverviewContent({ items }: { items: OfferMarketplaceItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-16 text-center text-sm font-semibold text-slate-600">
        لا توجد عروض متاحة في هذه الصفحة حالياً.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-slot="offers-grid">
      {items.map((item) => (
        <OfferOverviewCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function OfferOverviewPage({
  items,
  totalItems,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  routeBase,
  selectedTab,
}: {
  items: OfferMarketplaceItem[];
  totalItems: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  routeBase: string;
  selectedTab: OffersTabKey;
}) {
  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="px-6 py-6 lg:px-8 lg:py-8 grid gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">العروض</h1>
          <p className="mt-1 text-sm text-slate-500">الفرص الواردة والمرسلة وكل ما تحتاجه للعمل على العرض نفسه.</p>
        </div>
        <OfferTabs selectedTab={selectedTab} />
        <OfferOverviewToolbar page={page} pageCount={pageCount} />

        <div className="text-xs font-semibold text-slate-500">{totalItems} عروض</div>
        <OfferOverviewContent items={items} />

        {items.length > 0 ? (
          <OfferPaginationNav
            page={page}
            pageCount={pageCount}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            routeBase={routeBase}
          />
        ) : null}
      </div>
    </div>
  );
}
