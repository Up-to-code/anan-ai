"use client";

import Link from "next/link";
import {
  ArrowRight,
  Globe,
  type LucideIcon,
  Mail,
  MapPin,
  ShieldCheck,
  Tag,
  Building2,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  buildClientRequirementViewModel,
  buildWhatsAppHref,
  formatOfferMarketplaceLabel,
  formatOfferPrice,
  formatOfferStageLabel,
  formatOfferTypeLabel,
} from "./offerViewModel";
import type { WorkspaceOfferSummary } from "./offerTypes";

function formatOrganizationTypeLabel(type: "broker" | "developer" | null) {
  if (type === "broker") return "وسيط";
  if (type === "developer") return "مطور";
  return "جهة";
}

function organizationInitial(name?: string | null) {
  const trimmed = name?.trim();
  return trimmed ? Array.from(trimmed)[0] : "؟";
}

function truncateDescription(text?: string | null, maxLength = 180) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-[12px] font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function OfferPropertyCard({ item }: { item: WorkspaceOfferSummary }) {
  return (
    <div className="rounded-[20px] border border-border/50 bg-background/70 p-3">
      <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:[direction:ltr]">
        <div className="relative h-28 overflow-hidden rounded-[16px] bg-muted/20">
          {item.property?.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.property.imageUrl}
              alt={item.property?.title ?? item.message}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-right">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {formatOfferMarketplaceLabel(item)}
            </div>
            <div className="mt-1 text-[15px] font-black text-foreground">{item.property?.title ?? item.message}</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {item.property?.address ?? "غير محدد"}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <InfoRow icon={Tag} label="السعر" value={formatOfferPrice(item.price)} />
            <InfoRow icon={ShieldCheck} label="التصريح" value={item.permitStatus ?? "غير متوفر"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferClientCard({ item }: { item: WorkspaceOfferSummary }) {
  const client = item.clientContext;
  if (!client) return null;
  const requirement = buildClientRequirementViewModel(client);
  if (!requirement) return null;

  return (
    <div className="rounded-[20px] border border-border/50 bg-background/70 p-4 text-right">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">طلب عميل</div>
      <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{requirement.summary}</div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {requirement.budgetLabel ? <InfoRow icon={Tag} label="الميزانية" value={requirement.budgetLabel} /> : null}
        {requirement.location ? <InfoRow icon={MapPin} label="الموقع" value={requirement.location} /> : null}
        {requirement.area ? <InfoRow icon={Building2} label="المنطقة" value={requirement.area} /> : null}
        {requirement.bedsLabel ? <InfoRow icon={Building2} label="الغرف" value={requirement.bedsLabel} /> : null}
        {requirement.bathsLabel ? <InfoRow icon={Building2} label="الحمامات" value={requirement.bathsLabel} /> : null}
        {requirement.sqftLabel ? <InfoRow icon={Building2} label="المساحة" value={requirement.sqftLabel} /> : null}
        {requirement.phone ? <InfoRow icon={Phone} label="الهاتف" value={requirement.phone} /> : null}
      </div>
    </div>
  );
}

function OfferBrandBlock({ item }: { item: WorkspaceOfferSummary }) {
  const organization = item.primaryOrganization;
  const whatsappHref = buildWhatsAppHref(organization?.phone);

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/50"
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
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/50"
          >
            <Globe className="h-4 w-4" />
            الموقع
          </a>
        ) : null}
        {organization?.contactEmail ? (
          <a
            href={`mailto:${organization.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted/50"
          >
            <Mail className="h-4 w-4" />
            البريد
          </a>
        ) : null}
        <Link
          href={item.href}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[12px] font-bold text-background transition hover:bg-foreground/90"
        >
          فتح التفاصيل
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center justify-end gap-3 text-right">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">المنظمة الناشرة</div>
          <div className="text-[15px] font-black text-foreground">
            {organization?.name ?? item.senderName ?? "جهة غير محددة"}
          </div>
          <div className="text-[13px] text-muted-foreground">
            {formatOrganizationTypeLabel(organization?.type ?? null)}
            {organization?.phone ? ` • ${organization.phone}` : ""}
          </div>
        </div>

        {organization?.logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={organization.logoUrl}
            alt={organization.name}
            className="h-11 w-11 rounded-2xl bg-muted/20 object-contain p-2"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/20 text-base font-black text-muted-foreground">
            {organizationInitial(organization?.name ?? item.senderName)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * WHY:   Offers need one shared row-card UI so the main list and search results speak the same visual language.
 * WHAT:  Renders a flat offer list item with compact property/client context and a dedicated organization/contact block.
 * HOW:   Chooses the media card for property-first offers and the client card for client-driven offers while keeping the brand block separate.
 */
export default function OfferListItem({ item }: { item: WorkspaceOfferSummary }) {
  const truncatedDescription = truncateDescription(item.description ?? item.propertySummary ?? item.property?.address ?? null);

  return (
    <article className="rounded-[24px] border border-border/60 bg-card px-5 py-4 shadow-sm">
      <div className="space-y-4 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-muted-foreground">
            {formatOfferMarketplaceLabel(item)}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-bold text-muted-foreground">
              {formatOfferTypeLabel(item.type)}
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold text-foreground">
              {formatOfferStageLabel(item.stage)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[21px] font-black tracking-tight text-foreground">{item.message}</h2>
          {truncatedDescription ? (
            <p className="line-clamp-2 text-[14px] leading-7 text-muted-foreground">{truncatedDescription}</p>
          ) : null}
        </div>

        {item.clientContext ? <OfferClientCard item={item} /> : <OfferPropertyCard item={item} />}

        <OfferBrandBlock item={item} />
      </div>
    </article>
  );
}
