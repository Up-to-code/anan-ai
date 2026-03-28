import {
  inferPropertyTypeLabel,
  normalizeMarketArea,
  normalizeSellingFeature,
  parseSaudiGeography,
} from "../normalizers";
import {
  MarketDateRange,
  NormalizedProperty,
  NormalizedResearch,
  NormalizedSearchSignal,
  RawProperty,
  RawResearch,
  RawSearchLog,
} from "./types";
import { buildConfigurationLabel, isActiveProperty } from "./utils";

export function normalizeProperties(properties: RawProperty[]): NormalizedProperty[] {
  return properties
    .filter(isActiveProperty)
    .map((property) => {
      const geography = parseSaudiGeography({
        location: property.location,
        area: property.area,
        address: property.address,
      });
      return {
        city: geography.city,
        area: geography.area,
        price: typeof property.price === "number" && Number.isFinite(property.price) ? property.price : undefined,
        productType: inferPropertyTypeLabel(`${property.title ?? ""} ${property.description ?? ""}`),
        configuration: buildConfigurationLabel({
          beds: property.beds,
          baths: property.baths,
          area: property.sqft,
        }),
      };
    });
}

function normalizeResearchFinding(finding: RawResearch["propertyFindings"][number], row: RawResearch, queryGeo: { city?: string; area?: string }) {
  const findingGeo = parseSaudiGeography({
    location: finding.locationHint,
    area: finding.area,
    query: row.query,
  });
  return {
    title: finding.title,
    city: findingGeo.city ?? queryGeo.city,
    area: findingGeo.area ?? normalizeMarketArea(finding.area),
    priceHint: finding.priceHint,
    features: (finding.features ?? [])
      .map((feature) => normalizeSellingFeature(feature))
      .filter((feature): feature is string => typeof feature === "string"),
    sourceTitle: finding.sourceTitle,
    sourceUrl: finding.sourceUrl,
    productType: inferPropertyTypeLabel(finding.title),
    configuration: buildConfigurationLabel({
      beds: finding.beds,
      baths: finding.bathrooms,
      area: finding.area,
    }),
  };
}

export function normalizeResearchRows(researchRows: RawResearch[], dateRange: MarketDateRange): NormalizedResearch[] {
  return researchRows
    .filter((row) => row.createdAt >= dateRange.startMs && row.createdAt <= dateRange.endMs)
    .map((row) => {
      const queryGeo = parseSaudiGeography({ query: row.query });
      const findings = row.propertyFindings.map((finding) => normalizeResearchFinding(finding, row, queryGeo));
      return {
        query: row.query,
        createdAt: row.createdAt,
        status: row.status,
        sourceCount: row.sourceRuns?.length ?? 0,
        searchTerms: row.searchTerms ?? [],
        primaryCity: findings.find((finding) => finding.city)?.city ?? queryGeo.city,
        primaryArea: findings.find((finding) => finding.area)?.area ?? queryGeo.area,
        findings,
      };
    });
}

export function normalizeSearchSignals(searchLogs: RawSearchLog[], dateRange: MarketDateRange): NormalizedSearchSignal[] {
  return searchLogs
    .filter((log) => {
      const createdAt = log._creationTime ?? 0;
      return createdAt >= dateRange.startMs && createdAt <= dateRange.endMs;
    })
    .filter((log) => !!log.query)
    .filter((log) => !log.stage || log.stage === "completed" || log.stage === "serper" || log.stage === "db")
    .map((log) => ({ ...parseSaudiGeography({ query: log.query! }), query: log.query }))
    .filter((geo) => geo.city || geo.area);
}
