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
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-[11px] font-bold text-foreground shadow-sm">
        {avatarLabel(item.ownerLabel)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-bold text-foreground">{item.ownerLabel}</div>
        <div className="text-[11px] font-medium text-muted-foreground">{ownerKindLabel}</div>
      </div>
    </div>
  );
}

function OfferMetaGrid({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
      <div className="rounded-xl border border-border bg-background p-2">
        <div className="text-[11px] font-medium text-muted-foreground">سعر العرض</div>
        <div className="mt-1 font-bold text-foreground">{item.priceLabel}</div>
      </div>
      <div className="rounded-xl border border-border bg-background p-2">
        <div className="text-[11px] font-medium text-muted-foreground">نوع العرض</div>
        <div className="mt-1 font-bold text-foreground">{item.propertyType}</div>
      </div>
      <div className="rounded-xl border border-border bg-background p-2">
        <div className="text-[11px] font-medium text-muted-foreground">{item.linkedProperty ? "سعر العقار" : "متوسط السعر"}</div>
        <div className="mt-1 font-bold text-foreground">
          {item.linkedProperty?.askingPriceLabel ?? item.fallbackDetails?.averagePriceLabel ?? "غير متوفر"}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-2">
        <div className="text-[11px] font-medium text-muted-foreground">{item.linkedProperty ? "العقار" : "المشروع"}</div>
        <div className="mt-1 font-bold text-foreground">
          {item.linkedProperty?.title ?? item.fallbackDetails?.propertyLabel ?? item.project.title}
        </div>
      </div>
    </div>
  );
}

function OfferCardFooter({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-4 flex items-center justify-between text-[12px] font-medium text-muted-foreground">
      <div className="inline-flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate">{item.location}</span>
      </div>
      <Link
        href={`/ws/offers/${item.id}`}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-[11px] font-bold transition hover:bg-muted hover:text-foreground"
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
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/ws/offers/${item.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={heading} className="h-44 w-full object-cover" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/ws/offers/${item.id}`} className="line-clamp-2 text-[14px] font-bold text-foreground hover:underline">
            {heading}
          </Link>
          <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {kindLabel(item.kind)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground">{item.summary}</p>
        <p className="mt-1 truncate text-[12px] font-medium text-muted-foreground">
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
    <div className="border-b border-border">
      <nav className="-mb-px flex flex-wrap gap-6" aria-label="Offers tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={tab.key === selectedTab
              ? "border-b-2 border-foreground pb-3 text-[14px] font-bold text-foreground"
              : "border-b-2 border-transparent pb-3 text-[14px] font-medium text-muted-foreground transition hover:border-border hover:text-foreground"}
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
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/ws/offers/create"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-foreground px-4 py-2 text-[13px] font-bold text-background transition hover:bg-foreground/90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          طرح عرض جديد
        </Link>
        <Link href="/ws/offers/brokers" className="text-[13px] font-semibold text-muted-foreground transition hover:text-foreground">
          الوسطاء
        </Link>
        <Link href="/ws/offers/developers" className="text-[13px] font-semibold text-muted-foreground transition hover:text-foreground">
          المطورون
        </Link>
        <Link href="/ws/offers/search" className="text-[13px] font-semibold text-muted-foreground transition hover:text-foreground">
          البحث
        </Link>
      </div>
      <div className="rounded-lg bg-muted/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        صفحة {page} من {pageCount}
      </div>
    </div>
  );
}

function OfferOverviewContent({ items }: { items: OfferMarketplaceItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/50 p-8 text-center text-muted-foreground">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border shadow-sm">
          <Eye className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="text-[15px] font-semibold text-foreground">لا توجد عروض متاحة في هذه الصفحة حالياً.</p>
        <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
          ابدأ بطرح عرض جديد أو تغيير التبويب للبحث عن الفرص المناسبة.
        </p>
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
          <h1 className="text-3xl font-bold text-foreground">العروض</h1>
          <p className="mt-2 text-[14px] font-medium text-muted-foreground">الفرص الواردة والمرسلة وكل ما تحتاجه للعمل على العرض نفسه.</p>
        </div>
        <OfferTabs selectedTab={selectedTab} />
        <OfferOverviewToolbar page={page} pageCount={pageCount} />

        <div className="text-[12px] font-medium text-muted-foreground">{totalItems} عروض</div>
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
