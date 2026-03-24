import { AreaAggregate, CityAggregate, NormalizedProperty, NormalizedResearch, NormalizedSearchSignal } from "./types";
import { incrementCount } from "./utils";

function ensureCityAggregate(cityAggregates: Map<string, CityAggregate>, city: string): CityAggregate {
  const existing = cityAggregates.get(city);
  if (existing) return existing;
  const created: CityAggregate = {
    city,
    demandSignals: 0,
    researchRuns: 0,
    inventoryCount: 0,
    prices: [],
  };
  cityAggregates.set(city, created);
  return created;
}

function ensureAreaAggregate(
  areaAggregates: Map<string, AreaAggregate>,
  city: string,
  area: string
): AreaAggregate {
  const key = `${city}::${area}`;
  const existing = areaAggregates.get(key);
  if (existing) return existing;
  const created: AreaAggregate = {
    city,
    area,
    demandSignals: 0,
    researchRuns: 0,
    inventoryCount: 0,
    prices: [],
    productTypeCounts: new Map<string, number>(),
    signalCounts: new Map<string, number>(),
  };
  areaAggregates.set(key, created);
  return created;
}

function applyPropertyAggregate(
  cityAggregates: Map<string, CityAggregate>,
  areaAggregates: Map<string, AreaAggregate>,
  property: NormalizedProperty
) {
  if (!property.city) return;
  const city = ensureCityAggregate(cityAggregates, property.city);
  city.inventoryCount += 1;
  if (property.price) city.prices.push(property.price);
  if (!property.area) return;
  const area = ensureAreaAggregate(areaAggregates, property.city, property.area);
  area.inventoryCount += 1;
  if (property.price) area.prices.push(property.price);
  incrementCount(area.productTypeCounts, property.productType);
  incrementCount(area.signalCounts, property.productType);
  incrementCount(area.signalCounts, property.configuration);
}

function applySearchSignalAggregate(
  cityAggregates: Map<string, CityAggregate>,
  areaAggregates: Map<string, AreaAggregate>,
  signal: NormalizedSearchSignal
) {
  if (!signal.city) return;
  ensureCityAggregate(cityAggregates, signal.city).demandSignals += 1;
  if (signal.area) ensureAreaAggregate(areaAggregates, signal.city, signal.area).demandSignals += 1;
}

function applyResearchAggregate(
  cityAggregates: Map<string, CityAggregate>,
  areaAggregates: Map<string, AreaAggregate>,
  research: NormalizedResearch
) {
  if (research.primaryCity) {
    ensureCityAggregate(cityAggregates, research.primaryCity).researchRuns += 1;
    ensureCityAggregate(cityAggregates, research.primaryCity).demandSignals += 1;
    if (research.primaryArea) {
      ensureAreaAggregate(areaAggregates, research.primaryCity, research.primaryArea).researchRuns += 1;
      ensureAreaAggregate(areaAggregates, research.primaryCity, research.primaryArea).demandSignals += 1;
    }
  }
  for (const finding of research.findings) {
    if (!finding.city) continue;
    ensureCityAggregate(cityAggregates, finding.city).demandSignals += 1;
    if (!finding.area) continue;
    const area = ensureAreaAggregate(areaAggregates, finding.city, finding.area);
    area.demandSignals += 1;
    incrementCount(area.productTypeCounts, finding.productType);
    incrementCount(area.signalCounts, finding.productType);
    incrementCount(area.signalCounts, finding.configuration);
    for (const feature of finding.features) incrementCount(area.signalCounts, feature);
  }
}

export function aggregateCitiesAndAreas(args: {
  properties: NormalizedProperty[];
  researchRows: NormalizedResearch[];
  searchSignals: NormalizedSearchSignal[];
}): {
  cityAggregates: Map<string, CityAggregate>;
  areaAggregates: Map<string, AreaAggregate>;
  availableCities: string[];
  } {
  const cityAggregates = new Map<string, CityAggregate>();
  const areaAggregates = new Map<string, AreaAggregate>();
  for (const property of args.properties) applyPropertyAggregate(cityAggregates, areaAggregates, property);
  for (const signal of args.searchSignals) applySearchSignalAggregate(cityAggregates, areaAggregates, signal);
  for (const research of args.researchRows) applyResearchAggregate(cityAggregates, areaAggregates, research);
  return {
    cityAggregates,
    areaAggregates,
    availableCities: Array.from(cityAggregates.keys()).sort((a, b) => a.localeCompare(b, "ar")),
  };
}
