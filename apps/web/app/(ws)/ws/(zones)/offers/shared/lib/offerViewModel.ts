import type { AppLocale } from "@/lib/locale";
import { getLocaleNumberFormat } from "@/lib/locale";
import { parsePropertyBody, type PropertyDetail } from "@/server/contracts/properties";
import type { OfferPropertyOption, WorkspaceOfferSummary } from "../../types/offerTypes";

const currencySuffixByLocale: Record<AppLocale, string> = {
  ar: "ر.س",
  en: "SAR",
  fr: "SAR",
};

/**
 * WHY:   Offer prices are shown across the offers overview, detail pages, and client requirement summaries.
 * WHAT:  Formats a numeric price using the active locale's grouping with a stable SAR suffix.
 * HOW:   Reuses the shared locale number format mapping so the same domain value reads naturally in every locale.
 */
export function formatOfferPrice(value: number, locale: AppLocale = "ar") {
  return `${new Intl.NumberFormat(getLocaleNumberFormat(locale), {
    maximumFractionDigits: 0,
  }).format(value)} ${currencySuffixByLocale[locale]}`;
}

/**
 * WHY:   Offer stage badges need to be human-readable in the currently selected workspace locale.
 * WHAT:  Maps a stage enum value into a localized label.
 * HOW:   Uses per-locale lookup tables and falls back to the raw enum if a new stage appears unexpectedly.
 */
export function formatOfferStageLabel(stage: WorkspaceOfferSummary["stage"], locale: AppLocale = "ar") {
  const labels: Record<AppLocale, Record<WorkspaceOfferSummary["stage"], string>> = {
    ar: {
      draft: "مسودة",
      open: "مفتوح",
      targeted: "موجّه",
      engaged: "تعاون نشط",
      agreed: "تم الاتفاق",
      closed_won: "مغلقة - ناجحة",
      closed_lost: "مغلقة - غير مكتملة",
      archived: "مؤرشفة",
    },
    en: {
      draft: "Draft",
      open: "Open",
      targeted: "Targeted",
      engaged: "Active collaboration",
      agreed: "Agreement reached",
      closed_won: "Closed - won",
      closed_lost: "Closed - incomplete",
      archived: "Archived",
    },
    fr: {
      draft: "Brouillon",
      open: "Ouverte",
      targeted: "Ciblee",
      engaged: "Collaboration active",
      agreed: "Accord valide",
      closed_won: "Cloturee - gagnee",
      closed_lost: "Cloturee - incomplete",
      archived: "Archivee",
    },
  };

  return labels[locale][stage] ?? stage;
}

/**
 * WHY:   Offer cards and detail headers surface the collaboration model as a concise localized label.
 * WHAT:  Maps an offer type enum into a locale-aware label.
 * HOW:   Uses a small lookup table keyed by locale and the canonical offer type identifier.
 */
export function formatOfferTypeLabel(type: WorkspaceOfferSummary["type"], locale: AppLocale = "ar") {
  const labels: Record<AppLocale, Record<WorkspaceOfferSummary["type"], string>> = {
    ar: {
      open_offer: "عرض عقار",
      private_offer: "مشاركة عقار",
      collaboration_case: "طلب عميل",
    },
    en: {
      open_offer: "Property offer",
      private_offer: "Property share",
      collaboration_case: "Client request",
    },
    fr: {
      open_offer: "Offre immobiliere",
      private_offer: "Partage de bien",
      collaboration_case: "Demande client",
    },
  };

  return labels[locale][type] ?? type;
}

/**
 * WHY:   The offer marketplace badge needs to distinguish between inventory-led and client-led cases in every locale.
 * WHAT:  Returns the localized marketplace label for a summary card or detail hero.
 * HOW:   Prioritizes client context, then differentiates developer inventory from broker-to-broker sharing.
 */
export function formatOfferMarketplaceLabel(
  offer: Pick<WorkspaceOfferSummary, "clientContext" | "primaryOrganization">,
  locale: AppLocale = "ar",
) {
  if (offer.clientContext) {
    return locale === "fr" ? "Demande client" : locale === "en" ? "Client request" : "طلب عميل";
  }
  if (offer.primaryOrganization?.type === "developer") {
    return locale === "fr" ? "Offre d'un promoteur" : locale === "en" ? "Property offer from a developer" : "عرض عقار من مطور";
  }
  return locale === "fr" ? "Partage entre courtiers" : locale === "en" ? "Broker-to-broker property share" : "مشاركة عقار بين الوسطاء";
}

/**
 * WHY:   Offer cards expose a one-click WhatsApp shortcut when the publishing organization has a phone number.
 * WHAT:  Normalizes the phone number into a `wa.me` URL.
 * HOW:   Removes non-digit characters first, then returns `null` when the remaining value is empty.
 */
export function buildWhatsAppHref(phone?: string | null) {
  const normalized = phone?.replace(/[^\d]/g, "") ?? "";
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}

/**
 * WHY:   Client requirements sometimes embed structured fields inside free-form notes.
 * WHAT:  Splits the free-form note into a summary and an extracted preferred location when present.
 * HOW:   Recognizes the known Arabic and English location prefixes and removes them from the summary lines.
 */
export function parseClientRequirementDetails(clientNeed?: string | null) {
  const trimmed = clientNeed?.trim() ?? "";
  if (!trimmed) {
    return { summary: "", location: null as string | null };
  }

  const locationPrefixes = ["الموقع المطلوب:", "Preferred location:"];
  const lines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let location: string | null = null;
  const summaryLines = lines.filter((line) => {
    const prefix = locationPrefixes.find((candidate) => line.startsWith(candidate));
    if (!prefix) return true;
    location = line.slice(prefix.length).trim() || null;
    return false;
  });

  return {
    summary: summaryLines.join("\n").trim() || trimmed,
    location,
  };
}

type ClientRequirementLike = NonNullable<WorkspaceOfferSummary["clientContext"]>;

function formatRequirementBudgetLabel(client: ClientRequirementLike, locale: AppLocale) {
  if (typeof client.budgetMin === "number" && typeof client.budgetMax === "number") {
    if (client.budgetMin === client.budgetMax) {
      return formatOfferPrice(client.budgetMax, locale);
    }
    return `${formatOfferPrice(client.budgetMin, locale)} - ${formatOfferPrice(client.budgetMax, locale)}`;
  }
  if (typeof client.budgetMin === "number") {
    return `${formatOfferPrice(client.budgetMin, locale)}+`;
  }
  if (typeof client.budgetMax === "number") {
    return formatOfferPrice(client.budgetMax, locale);
  }
  return client.clientBudget?.trim() || null;
}

function formatRequirementSpaceLabel(client: ClientRequirementLike) {
  if (typeof client.sqftMin === "number" && typeof client.sqftMax === "number") {
    if (client.sqftMin === client.sqftMax) {
      return `${client.sqftMax} m²`;
    }
    return `${client.sqftMin}-${client.sqftMax} m²`;
  }
  if (typeof client.sqftMin === "number") {
    return `${client.sqftMin}+ m²`;
  }
  if (typeof client.sqftMax === "number") {
    return `${client.sqftMax} m²`;
  }
  return null;
}

/**
 * WHY:   Client-led offers need one normalized shape before the UI can render budget and requirement blocks.
 * WHAT:  Produces the derived summary, extracted location, and localized numeric labels for a client context.
 * HOW:   Parses the free-form requirement note once and formats budget fields using the active locale.
 */
export function buildClientRequirementViewModel(
  client?: WorkspaceOfferSummary["clientContext"] | null,
  locale: AppLocale = "ar",
) {
  if (!client) return null;

  const parsed = parseClientRequirementDetails(client.clientNeed);

  return {
    summary: parsed.summary,
    location: client.location?.trim() || parsed.location,
    budgetLabel: formatRequirementBudgetLabel(client, locale),
    area: client.area?.trim() || null,
    bedsLabel: typeof client.bedsMin === "number" ? `${client.bedsMin}+` : null,
    bathsLabel: typeof client.bathsMin === "number" ? `${client.bathsMin}+` : null,
    sqftLabel: formatRequirementSpaceLabel(client),
    phone: client.clientPhone?.trim() || null,
  };
}

/**
 * WHY:   The offer create/edit flows only need a compact property picker model instead of the full property detail DTO.
 * WHAT:  Maps a property record into the lightweight option shape used by the offer form.
 * HOW:   Prefers the presentation body and hero image when available, then falls back to media or a stock image.
 */
export function mapPropertyToOfferOption(property: PropertyDetail): OfferPropertyOption {
  const presentation = parsePropertyBody(property.body)?.presentation;

  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address,
    image:
      property.heroImage?.url ??
      property.media?.[0]?.url ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    expectedPrice: String(property.price),
    shortDescription: presentation?.descriptionShort ?? property.description,
    publicationState: property.publicationState,
  };
}
