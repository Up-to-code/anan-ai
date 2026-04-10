import { getPropertyLocationLabel } from "@/lib/mobileData";
import { formatMobileCopy, getMobileDictionary } from "@/lib/i18n";
import type { MobileLocale } from "@/lib/locale";
import type { MobileProperty, MobileSearchContext, MobileSearchOwnerType } from "@/types/mobile";

export type MobileSearchRouteParams = {
  threadId?: string;
  sourcePropertyId?: string;
  searchSummary?: string;
  searchQuery?: string;
  searchArea?: string;
  searchOwnerType?: MobileSearchOwnerType;
};

export function normalizeSearchRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseSearchRouteParams(params: Record<string, string | string[] | undefined>): MobileSearchContext | null {
  const searchSummary = normalizeSearchRouteParam(params.searchSummary)?.trim();
  if (!searchSummary) return null;

  const context: MobileSearchContext = {
    searchSummary,
  };

  const threadId = normalizeSearchRouteParam(params.threadId)?.trim();
  const sourcePropertyId = normalizeSearchRouteParam(params.sourcePropertyId)?.trim();
  const query = normalizeSearchRouteParam(params.searchQuery)?.trim();
  const area = normalizeSearchRouteParam(params.searchArea)?.trim();
  const ownerType = normalizeSearchRouteParam(params.searchOwnerType)?.trim() as MobileSearchOwnerType | undefined;

  if (threadId) context.threadId = threadId;
  if (sourcePropertyId) context.sourcePropertyId = sourcePropertyId;
  if (query) context.query = query;
  if (area) context.area = area;
  if (ownerType === "broker" || ownerType === "developer") {
    context.ownerType = ownerType;
  }

  return context;
}

export function buildSearchRouteParams(context: MobileSearchContext | null | undefined): MobileSearchRouteParams {
  if (!context) return {};

  return {
    threadId: context.threadId,
    sourcePropertyId: context.sourcePropertyId,
    searchSummary: context.searchSummary,
    searchQuery: context.query,
    searchArea: context.area,
    searchOwnerType: context.ownerType,
  };
}

export function getOwnerTypeLabel(property: MobileProperty): MobileSearchOwnerType {
  return property.owner.type === "broker" ? "broker" : "developer";
}

/**
 * WHY:   The search screen should feel like an assistant handoff instead of a disconnected blank list.
 * WHAT:  Builds the default route-backed search context from the current property/thread state.
 * HOW:   Uses the active property as the strongest signal and falls back to the last user message when no property is focused.
 */
export function buildAssistantSearchContext(args: {
  activeProperty?: MobileProperty | null;
  lastUserMessage?: string | null;
  threadId?: string | null;
  locale?: MobileLocale;
}): MobileSearchContext | null {
  const dictionary = getMobileDictionary(args.locale ?? "ar");
  const property = args.activeProperty ?? null;
  if (property) {
    return {
      threadId: args.threadId ?? undefined,
      sourcePropertyId: property.id,
      searchSummary: formatMobileCopy(dictionary.assistant.searchContextFromProperty, { title: property.title }),
      area: getPropertyLocationLabel(property),
      ownerType: getOwnerTypeLabel(property),
    };
  }

  const lastUserMessage = args.lastUserMessage?.trim();
  if (!lastUserMessage) return null;

  return {
    threadId: args.threadId ?? undefined,
    searchSummary: dictionary.assistant.searchContextFromPrompt,
    query: lastUserMessage,
  };
}

export function filterPropertiesForSearch(
  properties: MobileProperty[],
  args: {
    query: string;
    selectedArea: string;
    selectedOwnerType: string;
    allFilterLabel: string;
  },
) {
  return properties.filter((property) => {
    const matchesText =
      args.query.trim().length === 0 ||
      property.title.includes(args.query) ||
      property.address.includes(args.query) ||
      getPropertyLocationLabel(property).includes(args.query) ||
      property.owner.name.includes(args.query);
    const matchesArea = args.selectedArea === args.allFilterLabel || getPropertyLocationLabel(property) === args.selectedArea;
    const matchesOwnerType =
      args.selectedOwnerType === args.allFilterLabel ||
      ((args.selectedOwnerType === "broker" || args.selectedOwnerType === "وسيط") && property.owner.type === "broker") ||
      ((args.selectedOwnerType === "developer" || args.selectedOwnerType === "مطور") && property.owner.type === "RED");

    return matchesText && matchesArea && matchesOwnerType;
  });
}
