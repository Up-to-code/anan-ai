import { KeywordCounts, RawProperty } from "./types";

const KEYWORD_STOPWORDS = new Set([
  "عقار",
  "عقارات",
  "العقاري",
  "السعودية",
  "سعودي",
  "في",
  "من",
  "على",
  "عن",
  "الى",
  "إلى",
  "داخل",
  "حي",
  "منطقة",
  "شقة",
  "شقق",
  "فيلا",
  "فلل",
  "ارض",
  "أرض",
  "أراض",
  "للبيع",
  "للايجار",
  "للإيجار",
  "افضل",
  "أفضل",
  "سوق",
  "market",
  "search",
  "property",
  "properties",
  "real",
  "estate",
  "best",
  "top",
  "good",
  "area",
  "city",
  "research",
]);

export function normalizeWindowDays(value?: number): 30 | 90 | 180 {
  if (value === 30 || value === 180) return value;
  return 90;
}

export function isActiveProperty(property: RawProperty): boolean {
  if (property.publicationState === "draft" || property.publicationState === "archived") return false;
  if (property.status === "sold" || property.status === "reserved") return false;
  return true;
}

export function formatAveragePriceLabel(prices: number[]): string | null {
  if (prices.length === 0) return null;
  const average = prices.reduce((sum, value) => sum + value, 0) / prices.length;
  if (average >= 1_000_000) {
    return `${(average / 1_000_000).toFixed(1)}M ر.س`;
  }
  if (average >= 1_000) {
    return `${Math.round(average / 1_000)}K ر.س`;
  }
  return `${Math.round(average)} ر.س`;
}

export function buildConfigurationLabel(args: {
  beds?: string | number;
  baths?: string | number;
  area?: string | number;
}): string | undefined {
  const parts: string[] = [];
  const beds = typeof args.beds === "number" ? args.beds : Number.parseInt(String(args.beds ?? ""), 10);
  const baths = typeof args.baths === "number" ? args.baths : Number.parseInt(String(args.baths ?? ""), 10);
  const numericArea =
    typeof args.area === "number"
      ? args.area
      : Number.parseInt(String(args.area ?? "").replace(/[^\d]/g, ""), 10);

  if (Number.isFinite(beds) && beds > 0) parts.push(`${beds} غرف`);
  if (Number.isFinite(baths) && baths > 0) parts.push(`${baths} حمامات`);
  if (Number.isFinite(numericArea) && numericArea > 0) parts.push(`${numericArea}م²`);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

export function normalizeSearchText(value?: string | null): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[،,/|]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesScope(args: {
  targetCity?: string;
  targetArea?: string;
  city?: string;
  area?: string;
}): boolean {
  if (args.targetCity && args.city !== args.targetCity) return false;
  if (args.targetArea && args.area !== args.targetArea) return false;
  return true;
}

export function matchesTextQuery(queryText: string, ...values: Array<string | null | undefined>): boolean {
  if (!queryText) return true;
  return values.some((value) => normalizeSearchText(value).includes(queryText));
}

export function pickTopEntry(counts: Map<string, number>): string | null {
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"));
  return sorted[0]?.[0] ?? null;
}

export function tokenizeKeywordText(value: string, excludedPhrases: Set<string>): string[] {
  const normalized = normalizeSearchText(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  return normalized.filter((token) => token.length >= 2 && !KEYWORD_STOPWORDS.has(token) && !excludedPhrases.has(token));
}

export function incrementCount(counts: Map<string, number>, key: string | undefined): void {
  if (!key) return;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

export function createKeywordCounts(): KeywordCounts {
  return {
    query: new Map<string, number>(),
    feature: new Map<string, number>(),
    derived: new Map<string, number>(),
  };
}

