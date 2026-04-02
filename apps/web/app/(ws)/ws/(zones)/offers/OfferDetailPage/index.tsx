"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  Images,
  type LucideIcon,
  Mail,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Tag,
} from "lucide-react";
import {
  buildClientRequirementViewModel,
  buildWhatsAppHref,
  formatOfferMarketplaceLabel,
  formatOfferPrice,
  formatOfferStageLabel,
  formatOfferTypeLabel,
} from "../offerViewModel";
import type { WorkspaceOfferDetail } from "../offerTypes";
import type { OfferActionResult } from "@/server/contracts/offers";

type DetailActionResult = { redirectTo?: string } | { ok: true } | OfferActionResult | void;
type PropertyTextBlock = {
  label: string;
  value: string;
};

function formatOrganizationTypeLabel(type: "broker" | "developer" | null) {
  if (type === "broker") return "وسيط";
  if (type === "developer") return "مطور";
  return "جهة";
}

function organizationInitial(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed ? Array.from(trimmed)[0] : "؟";
}

function normalizeDetailText(value?: string | null) {
  return value?.trim() ?? "";
}

function getPropertyMediaUrls(offer: WorkspaceOfferDetail) {
  const urls = [...offer.propertyGallery, offer.propertyImageUrl]
    .map((value) => normalizeDetailText(value))
    .filter(Boolean);

  return urls.filter((url, index) => urls.indexOf(url) === index);
}

function buildPropertyCategories(offer: WorkspaceOfferDetail) {
  const categories = [
    formatOfferTypeLabel(offer.type),
    offer.productStatus,
    formatOfferStageLabel(offer.stage),
    offer.permitStatus,
    offer.property?.area,
  ]
    .map((value) => normalizeDetailText(value))
    .filter(Boolean);

  return categories.filter((value, index) => categories.indexOf(value) === index);
}

function buildPropertyTextBlocks(offer: WorkspaceOfferDetail): PropertyTextBlock[] {
  const title = normalizeDetailText(offer.propertyTitle || offer.message);
  const candidates: PropertyTextBlock[] = [
    {
      label: "وصف العقار",
      value: normalizeDetailText(offer.propertySummary),
    },
    {
      label: "تفاصيل العرض",
      value: normalizeDetailText(offer.description),
    },
    {
      label: "معلومة إضافية",
      value: normalizeDetailText(offer.message),
    },
  ];

  const seen = new Set<string>();

  return candidates.filter((block) => {
    if (!block.value || block.value === title || seen.has(block.value)) {
      return false;
    }
    seen.add(block.value);
    return true;
  });
}

function getOfferHeroTitle(offer: WorkspaceOfferDetail) {
  return normalizeDetailText(offer.message) || normalizeDetailText(offer.propertyTitle) || "تفاصيل العرض";
}

function getOfferHeroSummary(offer: WorkspaceOfferDetail) {
  if (offer.clientContext) {
    return normalizeDetailText(offer.description) || "لا يوجد وصف إضافي لهذه الحالة.";
  }

  return (
    normalizeDetailText(offer.propertySummary) ||
    normalizeDetailText(offer.description) ||
    normalizeDetailText(offer.message) ||
    "لا يوجد وصف إضافي لهذه الوحدة حالياً."
  );
}

function DetailBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
      {value}
    </span>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string | null;
}) {
  return (
    <div className="border-b border-border/50 py-3 text-right last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex items-center justify-end gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 text-[15px] font-black text-foreground">{value}</div>
      {helper ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground/90">{helper}</div> : null}
    </div>
  );
}

function InfoChip({
  icon: Icon,
  value,
}: {
  icon: LucideIcon;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground shadow-sm">
      <Icon className="h-4 w-4" />
      <span>{value}</span>
    </div>
  );
}

function ApartmentMediaSlider({ offer }: { offer: WorkspaceOfferDetail }) {
  const mediaUrls = getPropertyMediaUrls(offer);
  const [activeIndex, setActiveIndex] = useState(0);

  if (mediaUrls.length === 0) {
    return (
      <section className="rounded-[28px] border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex h-[320px] items-center justify-center rounded-[24px] bg-muted/20 text-center">
          <div className="space-y-3 text-right">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="text-lg font-black text-foreground">لا توجد صور مرفقة لهذه الشقة حالياً.</div>
            <div className="text-[13px] leading-6 text-muted-foreground">يمكنك متابعة تفاصيل الوحدة والموقع من الأقسام التالية.</div>
          </div>
        </div>
      </section>
    );
  }

  const goTo = (index: number) => {
    const total = mediaUrls.length;
    setActiveIndex((index + total) % total);
  };

  return (
    <section className="space-y-4">
      <div data-slot="offer-gallery" className="overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-sm">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrls[activeIndex]}
            alt={`${offer.propertyTitle} ${activeIndex + 1}`}
            className="h-[360px] w-full object-cover sm:h-[420px]"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-5 text-right">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-bold text-white/95">
              <Images className="h-4 w-4" />
              {activeIndex + 1} / {mediaUrls.length}
            </div>
          </div>

          {mediaUrls.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
                aria-label="الصورة السابقة"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/70"
                aria-label="الصورة التالية"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {mediaUrls.length > 1 ? (
        <div className="rounded-[24px] border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Gallery</div>
            <div className="text-[14px] font-black text-foreground">معرض الصور</div>
          </div>
          <div className="mt-4 grid gap-3 grid-cols-3 sm:grid-cols-5">
            {mediaUrls.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-[18px] border transition ${
                  activeIndex === index
                    ? "border-foreground shadow-sm"
                    : "border-border/60 opacity-75 hover:opacity-100"
                }`}
                aria-label={`عرض الصورة ${index + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={`${offer.propertyTitle} thumbnail ${index + 1}`}
                  className="h-20 w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PropertyFactCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/70 p-4 text-right">
      <div className="flex items-center justify-end gap-2 text-[12px] font-bold text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-[16px] font-black text-foreground">{value}</div>
      {helper ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{helper}</div> : null}
    </div>
  );
}

function ApartmentCategoryBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
      {value}
    </span>
  );
}

function ApartmentSpecCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-card p-4 text-right shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/30 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      </div>
      <div className="mt-4 text-[18px] font-black text-foreground">{value}</div>
      <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{helper}</div>
    </div>
  );
}

function ApartmentLocationPanel({ offer }: { offer: WorkspaceOfferDetail }) {
  return (
    <section className="rounded-[24px] border border-border/60 bg-card p-5 shadow-sm">
      <div className="text-right">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Location</div>
        <h3 className="mt-2 text-xl font-black text-foreground">الموقع</h3>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <PropertyFactCard
          icon={MapPin}
          label="عنوان الشقة"
          value={offer.propertyAddress}
          helper={offer.propertyTitle || "عنوان الوحدة المعروضة"}
        />
        <PropertyFactCard
          icon={Building2}
          label="داخل المنطقة"
          value={offer.property?.area || offer.property?.location || "غير محدد"}
          helper={offer.property?.location || "بدون مدينة أو نطاق إضافي"}
        />
      </div>
    </section>
  );
}

function OfferPrimaryData({ offer }: { offer: WorkspaceOfferDetail }) {
  if (offer.clientContext) {
    const requirement = buildClientRequirementViewModel(offer.clientContext);
    if (!requirement) return null;
    return (
      <div className="rounded-[24px] bg-muted/10 px-5 py-4">
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">طلب العميل</div>
          <div className="mt-2 text-[14px] leading-7 text-muted-foreground">{requirement.summary}</div>
        </div>

        <div className="mt-4 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
          {requirement.budgetLabel ? <DetailRow icon={Tag} label="الميزانية" value={requirement.budgetLabel} /> : null}
          {requirement.location ? (
            <DetailRow icon={MapPin} label="الموقع" value={requirement.location} />
          ) : null}
          {requirement.area ? <DetailRow icon={Building2} label="المنطقة" value={requirement.area} /> : null}
          {requirement.bedsLabel ? <DetailRow icon={Building2} label="الغرف" value={requirement.bedsLabel} /> : null}
          {requirement.bathsLabel ? <DetailRow icon={Building2} label="الحمامات" value={requirement.bathsLabel} /> : null}
          {requirement.sqftLabel ? <DetailRow icon={Building2} label="المساحة" value={requirement.sqftLabel} /> : null}
          {requirement.phone ? <DetailRow icon={Mail} label="الهاتف" value={requirement.phone} /> : null}
        </div>
      </div>
    );
  }

  const textBlocks = buildPropertyTextBlocks(offer);
  const categories = buildPropertyCategories(offer);
  const apartmentDescription = normalizeDetailText(offer.description) || normalizeDetailText(offer.propertySummary);
  const apartmentSpecs = [
    {
      icon: Tag,
      label: "السعر",
      value: formatOfferPrice(offer.price),
      helper: offer.commissionText ?? "سعر الوحدة المعروض حالياً.",
    },
    offer.property?.beds != null
      ? {
          icon: BedDouble,
          label: "الغرف",
          value: `${offer.property.beds} غرف`,
          helper: "عدد الغرف الأساسية داخل هذه الشقة.",
        }
      : null,
    offer.property?.baths != null
      ? {
          icon: Bath,
          label: "الحمامات",
          value: `${offer.property.baths} حمامات`,
          helper: "عدد الحمامات المتاحة داخل الوحدة.",
        }
      : null,
    offer.property?.sqft != null
      ? {
          icon: Ruler,
          label: "المساحة",
          value: `${offer.property.sqft} م²`,
          helper: "المساحة الإجمالية المعروضة لهذه الشقة.",
        }
      : null,
    {
      icon: ShieldCheck,
      label: "الحالة",
      value: offer.permitStatus ?? "غير متوفر",
      helper: offer.productStatus ?? "حالة المنتج الحالية داخل المنصة.",
    },
    {
      icon: Building2,
      label: "نوع العرض",
      value: formatOfferTypeLabel(offer.type),
      helper: formatOfferStageLabel(offer.stage),
    },
  ].filter(Boolean) as Array<{
    icon: LucideIcon;
    label: string;
    value: string;
    helper: string;
  }>;

  return (
    <div className="space-y-6">
      <ApartmentMediaSlider offer={offer} />

      <section className="rounded-[24px] border border-border/60 bg-card p-6 shadow-sm">
        <div className="space-y-5 text-right">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Apartment Detail</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">{offer.propertyTitle}</h2>
            <div className="mt-3 inline-flex items-center gap-2 text-[14px] text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {offer.propertyAddress}
            </div>
          </div>

          {apartmentDescription ? (
            <p className="max-w-4xl text-[15px] leading-8 text-muted-foreground">{apartmentDescription}</p>
          ) : null}

          {categories.length ? (
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Categories</div>
              <div className="flex flex-wrap justify-end gap-2">
                {categories.map((category) => (
                  <ApartmentCategoryBadge key={category} value={category} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {apartmentSpecs.map((spec) => (
              <ApartmentSpecCard
                key={`${spec.label}-${spec.value}`}
                icon={spec.icon}
                label={spec.label}
                value={spec.value}
                helper={spec.helper}
              />
            ))}
          </div>
        </div>
      </section>

      <ApartmentLocationPanel offer={offer} />

      <section className="rounded-[24px] border border-border/60 bg-card p-5 shadow-sm">
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Full Description</div>
          <h3 className="mt-2 text-xl font-black text-foreground">الوصف الكامل</h3>
        </div>
        <div className="mt-5 space-y-3">
          {textBlocks.length > 0 ? (
            textBlocks.map((block) => (
              <div key={`${block.label}-${block.value}`} className="rounded-[24px] border border-border/60 bg-background/50 p-5 text-right">
                <div className="text-[11px] font-bold text-muted-foreground">{block.label}</div>
                <div className="mt-2 text-[14px] leading-8 text-foreground">{block.value}</div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-border/60 bg-background/50 p-5 text-right">
              <div className="text-[11px] font-bold text-muted-foreground">الوصف</div>
              <div className="mt-2 text-[14px] leading-8 text-foreground">لا يوجد وصف إضافي لهذه الوحدة حالياً.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function OfferBrandPanel({
  offer,
  editHref,
  pendingAction,
  runAction,
  onMessage,
  onArchive,
  onPublish,
  onEngage,
  onRespond,
  onAdvanceStage,
}: {
  offer: WorkspaceOfferDetail;
  editHref?: string | null;
  pendingAction: string | null;
  runAction: (actionKey: string, callback: () => Promise<DetailActionResult>) => Promise<void>;
  onMessage: () => Promise<{ conversationId: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
  onPublish?: () => Promise<DetailActionResult>;
  onEngage?: () => Promise<DetailActionResult>;
  onRespond?: (status: "accepted" | "rejected") => Promise<DetailActionResult>;
  onAdvanceStage?: (action: "mark_agreed" | "close_won" | "close_lost") => Promise<DetailActionResult>;
}) {
  const router = useRouter();
  const organization = offer.primaryOrganization;
  const whatsappHref = buildWhatsAppHref(organization?.phone);
  const hasWorkflowActions =
    offer.allowedActions.canEngage ||
    offer.allowedActions.canRespond ||
    offer.allowedActions.canMarkAgreed ||
    offer.allowedActions.canCloseWon ||
    offer.allowedActions.canCloseLost;

  return (
    <aside data-slot="offer-detail-sidebar" className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-[24px] border border-border/60 bg-card p-5 text-right shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">المنظمة الناشرة</div>
            <div className="text-xl font-black text-foreground">
              {organization?.name ?? offer.senderName ?? "جهة غير محددة"}
            </div>
            <div className="text-[13px] font-medium text-muted-foreground">
              {formatOrganizationTypeLabel(organization?.type ?? null)}
            </div>
            {organization?.phone ? (
              <div className="text-[13px] font-medium text-muted-foreground">{organization.phone}</div>
            ) : null}
          </div>
          {organization?.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={organization.logoUrl}
              alt={organization.name}
              className="h-16 w-16 rounded-2xl bg-muted/20 object-contain p-2"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20 text-xl font-black text-muted-foreground">
              {organizationInitial(organization?.name ?? offer.senderName)}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/70"
            >
              <MessageCircle className="h-4 w-4" />
              واتساب
            </a>
          ) : null}
          {organization?.website ? (
            <a
              href={organization.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/70"
            >
              <Globe className="h-4 w-4" />
              الموقع
            </a>
          ) : null}
          {organization?.contactEmail ? (
            <a
              href={`mailto:${organization.contactEmail}`}
              className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/70"
            >
              <Mail className="h-4 w-4" />
              البريد
            </a>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-border/60 bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              void runAction("message", async () => {
                const result = await onMessage();
                router.push(`/ws/inbox/${result.conversationId}`);
              })
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
          >
            <Mail className="h-4 w-4" />
            فتح المحادثة
          </button>

          {editHref ? (
            <button
              type="button"
              onClick={() => router.push(editHref)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/70"
            >
              <ExternalLink className="h-4 w-4" />
              تعديل المسودة
            </button>
          ) : null}

          {offer.canPublish && onPublish ? (
            <button
              type="button"
              onClick={() => void runAction("publish", onPublish)}
              className="w-full rounded-full bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/70"
            >
              {pendingAction === "publish" ? "جارٍ النشر..." : "نشر الحالة"}
            </button>
          ) : null}

          {offer.allowedActions.canEngage && onEngage ? (
            <button
              type="button"
              onClick={() => void runAction("engage", onEngage)}
              className="w-full rounded-full bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/70"
            >
              {pendingAction === "engage" ? "جارٍ فتح التعاون..." : "بدء التعاون"}
            </button>
          ) : null}

          {offer.allowedActions.canRespond && onRespond ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void runAction("accept", () => onRespond("accepted"))}
                className="rounded-full bg-emerald-600 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-emerald-700"
              >
                {pendingAction === "accept" ? "جارٍ القبول..." : "قبول"}
              </button>
              <button
                type="button"
                onClick={() => void runAction("reject", () => onRespond("rejected"))}
                className="rounded-full bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700 transition hover:bg-rose-100"
              >
                {pendingAction === "reject" ? "جارٍ الرفض..." : "رفض"}
              </button>
            </div>
          ) : null}

          {offer.allowedActions.canMarkAgreed && onAdvanceStage ? (
            <button
              type="button"
              onClick={() => void runAction("mark_agreed", () => onAdvanceStage("mark_agreed"))}
              className="w-full rounded-full bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/70"
            >
              {pendingAction === "mark_agreed" ? "جارٍ الحفظ..." : "اعتماد الاتفاق"}
            </button>
          ) : null}

          {offer.allowedActions.canCloseWon && onAdvanceStage ? (
            <button
              type="button"
              onClick={() => void runAction("close_won", () => onAdvanceStage("close_won"))}
              className="w-full rounded-full bg-emerald-600 px-4 py-3 text-[13px] font-bold text-white transition hover:bg-emerald-700"
            >
              {pendingAction === "close_won" ? "جارٍ الإغلاق..." : "إغلاق ناجح"}
            </button>
          ) : null}

          {offer.allowedActions.canCloseLost && onAdvanceStage ? (
            <button
              type="button"
              onClick={() => void runAction("close_lost", () => onAdvanceStage("close_lost"))}
              className="w-full rounded-full bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700 transition hover:bg-rose-100"
            >
              {pendingAction === "close_lost" ? "جارٍ الإغلاق..." : "إغلاق غير مكتمل"}
            </button>
          ) : null}

          {offer.canArchive && onArchive ? (
            <button
              type="button"
              onClick={() => void runAction("archive", onArchive)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/70"
            >
              <Archive className="h-4 w-4" />
              {pendingAction === "archive" ? "جارٍ الأرشفة..." : "أرشفة"}
            </button>
          ) : null}

          {!hasWorkflowActions && !offer.canPublish && !offer.canArchive ? (
            <div className="rounded-[18px] bg-background px-4 py-4 text-center text-[13px] font-semibold text-muted-foreground">
              لا توجد إجراءات متاحة في هذه المرحلة حالياً.
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

/**
 * WHY:   Offer details should start with the actual property/client context instead of decorative legacy sections.
 * WHAT:  Renders a two-column detail page with brand/contact on one side and an apartment-first property layout on the other.
 * HOW:   Uses the shared offer DTO to render a media slider, apartment specs, location details, and client-driven cases without changing action flows.
 */
export default function OfferDetailPage({
  offer,
  onMessage,
  onArchive,
  onPublish,
  onEngage,
  onRespond,
  onAdvanceStage,
  editHref,
}: {
  offer: WorkspaceOfferDetail;
  onMessage: () => Promise<{ conversationId: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
  onPublish?: () => Promise<DetailActionResult>;
  onEngage?: () => Promise<DetailActionResult>;
  onRespond?: (status: "accepted" | "rejected") => Promise<DetailActionResult>;
  onAdvanceStage?: (action: "mark_agreed" | "close_won" | "close_lost") => Promise<DetailActionResult>;
  editHref?: string | null;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heroTitle = getOfferHeroTitle(offer);
  const heroSummary = getOfferHeroSummary(offer);

  async function runAction(actionKey: string, callback: () => Promise<DetailActionResult>) {
    setError(null);
    try {
      setPendingAction(actionKey);
      const result = await callback();
      if (result && typeof result === "object" && "redirectTo" in result && result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-background/50 pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/ws/offers")}
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للعروض
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <DetailBadge value={formatOfferTypeLabel(offer.type)} />
            <DetailBadge value={formatOfferStageLabel(offer.stage)} />
          </div>
        </nav>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-[13px] font-bold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:[direction:ltr]">
          <OfferBrandPanel
            offer={offer}
            editHref={editHref}
            pendingAction={pendingAction}
            runAction={runAction}
            onMessage={onMessage}
            onArchive={onArchive}
            onPublish={onPublish}
            onEngage={onEngage}
            onRespond={onRespond}
            onAdvanceStage={onAdvanceStage}
          />

          <main className="order-1 space-y-6 lg:order-2">
            <section data-slot="offer-detail-hero" className="rounded-[24px] border border-border/60 bg-card p-6 shadow-sm lg:p-8">
              <div className="space-y-5 text-right">
                <div className="space-y-3">
                  <div className="text-[12px] font-semibold text-muted-foreground">
                    {formatOfferMarketplaceLabel(offer)}
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground">{heroTitle}</h1>
                  {!offer.clientContext ? (
                    <div className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {offer.propertyAddress}
                    </div>
                  ) : null}
                  <p className="max-w-3xl text-[15px] leading-8 text-muted-foreground/90">{heroSummary}</p>
                </div>

                <OfferPrimaryData offer={offer} />
              </div>
            </section>

            <section className="rounded-[24px] border border-border/60 bg-card p-6 shadow-sm lg:p-8">
              <div className="space-y-5">
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Activity Log</div>
                  <h2 className="mt-2 text-2xl font-black text-foreground">تاريخ العمليات</h2>
                </div>

                {offer.activity.length > 0 ? (
                  <div className="grid gap-3">
                    {offer.activity.map((activity) => (
                      <div key={activity.id} className="border-b border-border/50 py-4 last:border-b-0 last:pb-0 first:pt-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-[12px] font-bold tabular-nums text-muted-foreground">
                            {new Intl.DateTimeFormat("ar-SA", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(activity.createdAt))}
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-[15px] font-black text-foreground">{activity.message ?? activity.kind}</div>
                            {activity.actorName ? (
                              <div className="mt-1 text-[13px] text-muted-foreground">{activity.actorName}</div>
                            ) : null}
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] bg-muted/10 px-4 py-6 text-center text-[13px] font-semibold text-muted-foreground">
                    لا توجد أحداث مسجلة بعد.
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
