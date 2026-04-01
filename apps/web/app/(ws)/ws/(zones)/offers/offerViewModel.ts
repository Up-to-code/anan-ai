import { parsePropertyBody, type PropertyDetail } from "@/server/contracts/properties";
import type { OfferPropertyOption, WorkspaceOfferSummary } from "./offerTypes";

export function formatOfferPrice(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} ر.س`;
}

export function formatOfferStageLabel(stage: WorkspaceOfferSummary["stage"]) {
  switch (stage) {
    case "draft":
      return "مسودة";
    case "open":
      return "مفتوح";
    case "targeted":
      return "موجّه";
    case "engaged":
      return "تعاون نشط";
    case "agreed":
      return "تم الاتفاق";
    case "closed_won":
      return "مغلقة - ناجحة";
    case "closed_lost":
      return "مغلقة - غير مكتملة";
    case "archived":
      return "مؤرشفة";
    default:
      return stage;
  }
}

export function formatOfferTypeLabel(type: WorkspaceOfferSummary["type"]) {
  switch (type) {
    case "open_offer":
      return "عرض عقار";
    case "private_offer":
      return "مشاركة عقار";
    case "collaboration_case":
      return "طلب عميل";
    default:
      return type;
  }
}

export function formatOfferMarketplaceLabel(offer: Pick<WorkspaceOfferSummary, "clientContext" | "primaryOrganization">) {
  if (offer.clientContext) {
    return "طلب عميل";
  }
  if (offer.primaryOrganization?.type === "developer") {
    return "عرض عقار من مطور";
  }
  return "مشاركة عقار بين الوسطاء";
}

export function buildWhatsAppHref(phone?: string | null) {
  const normalized = phone?.replace(/[^\d]/g, "") ?? "";
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}

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

function formatRequirementBudgetLabel(client: ClientRequirementLike) {
  if (typeof client.budgetMin === "number" && typeof client.budgetMax === "number") {
    if (client.budgetMin === client.budgetMax) {
      return formatOfferPrice(client.budgetMax);
    }
    return `${formatOfferPrice(client.budgetMin)} - ${formatOfferPrice(client.budgetMax)}`;
  }
  if (typeof client.budgetMin === "number") {
    return `${formatOfferPrice(client.budgetMin)}+`;
  }
  if (typeof client.budgetMax === "number") {
    return formatOfferPrice(client.budgetMax);
  }
  return client.clientBudget?.trim() || null;
}

function formatRequirementSpaceLabel(client: ClientRequirementLike) {
  if (typeof client.sqftMin === "number" && typeof client.sqftMax === "number") {
    if (client.sqftMin === client.sqftMax) {
      return `${client.sqftMax} م²`;
    }
    return `${client.sqftMin}-${client.sqftMax} م²`;
  }
  if (typeof client.sqftMin === "number") {
    return `${client.sqftMin}+ م²`;
  }
  if (typeof client.sqftMax === "number") {
    return `${client.sqftMax} م²`;
  }
  return null;
}

export function buildClientRequirementViewModel(client?: WorkspaceOfferSummary["clientContext"] | null) {
  if (!client) return null;

  const parsed = parseClientRequirementDetails(client.clientNeed);

  return {
    summary: parsed.summary,
    location: client.location?.trim() || parsed.location,
    budgetLabel: formatRequirementBudgetLabel(client),
    area: client.area?.trim() || null,
    bedsLabel: typeof client.bedsMin === "number" ? `${client.bedsMin}+` : null,
    bathsLabel: typeof client.bathsMin === "number" ? `${client.bathsMin}+` : null,
    sqftLabel: formatRequirementSpaceLabel(client),
    phone: client.clientPhone?.trim() || null,
  };
}

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
