export type MarketFiltersInput = {
  city?: string;
  area?: string;
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  windowDays?: number;
};

export type MarketDateRange = {
  dateFrom: string;
  dateTo: string;
  startMs: number;
  endMs: number;
  windowDays?: 30 | 90 | 180;
};

export type MarketSnapshotResult = {
  filters: {
    city: string;
    area: string;
    query: string;
    dateFrom: string;
    dateTo: string;
    windowDays?: 30 | 90 | 180;
  };
  availableCities: string[];
  availableAreas: string[];
  headline: {
    selectedCityLabel: string;
    selectedAreaLabel: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  };
  topCities: Array<{
    city: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  }>;
  topAreas: Array<{
    city: string;
    area: string;
    demandSignals: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
    topProductType: string | null;
    topSignalLabel: string | null;
  }>;
  sellingPoints: Array<{
    label: string;
    count: number;
    source: "features" | "derived_configuration";
  }>;
  keywordInsights: {
    relatedSearches: Array<{
      label: string;
      count: number;
      source: "research_query" | "research_term" | "search_log";
    }>;
    topKeywords: Array<{
      label: string;
      count: number;
      source: "query" | "feature" | "derived_topic";
    }>;
    topTopics: Array<{
      label: string;
      count: number;
      source: "query" | "feature" | "derived_topic";
    }>;
    mostResearchedLabel: string | null;
  };
  opportunities: Array<{
    city: string;
    area: string;
    priority: "high" | "medium" | "watch";
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    dominantProductType: string | null;
    strongestSellingPoint: string | null;
    reason: string;
  }>;
  chartSeries: {
    cityDemand: Array<{
      label: string;
      demandSignals: number;
      researchRuns: number;
      inventoryCount?: number;
    }>;
    areaDemand: Array<{
      label: string;
      demandSignals: number;
      researchRuns: number;
      inventoryCount?: number;
    }>;
    keywordCounts: Array<{ label: string; count: number }>;
  };
  latestUpdate: null | {
    query: string;
    createdAt: number;
    status: "completed" | "partial" | "failed";
    sourceCount: number;
    topFindings: Array<{
      title: string;
      locationHint?: string;
      priceHint?: string;
      area?: string;
      features?: string[];
      sourceTitle?: string;
      sourceUrl?: string;
    }>;
  };
};

export type RawProperty = {
  title: string;
  description?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  location?: string;
  area?: string;
  address?: string;
  status?: string;
  publicationState?: string;
};

export type RawResearchFinding = {
  title: string;
  locationHint?: string;
  priceHint?: string;
  area?: string;
  features?: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  beds?: string;
  bathrooms?: string;
};

export type RawResearch = {
  query: string;
  createdAt: number;
  status: "completed" | "partial" | "failed";
  searchTerms?: string[];
  sourceRuns?: Array<unknown>;
  propertyFindings: RawResearchFinding[];
};

export type RawSearchLog = {
  query?: string;
  _creationTime?: number;
  stage?: string;
  status?: string;
};

export type NormalizedProperty = {
  city?: string;
  area?: string;
  price?: number;
  productType?: string;
  configuration?: string;
};

export type NormalizedFinding = {
  title: string;
  city?: string;
  area?: string;
  priceHint?: string;
  features: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  productType?: string;
  configuration?: string;
};

export type NormalizedResearch = {
  query: string;
  createdAt: number;
  status: "completed" | "partial" | "failed";
  sourceCount: number;
  searchTerms: string[];
  primaryCity?: string;
  primaryArea?: string;
  findings: NormalizedFinding[];
};

export type NormalizedSearchSignal = {
  city?: string;
  area?: string;
  query?: string;
};

export type AreaAggregate = {
  city: string;
  area: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  prices: number[];
  productTypeCounts: Map<string, number>;
  signalCounts: Map<string, number>;
};

export type CityAggregate = {
  city: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  prices: number[];
};

export type KeywordCounts = {
  query: Map<string, number>;
  feature: Map<string, number>;
  derived: Map<string, number>;
};
