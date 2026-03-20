import { MarketSnapshotResult, NormalizedProperty, NormalizedResearch } from "./types";
import { incrementCount, matchesScope } from "./utils";

type BuildSellingPointsArgs = {
  properties: NormalizedProperty[];
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
};

function collectScopedFindings(args: BuildSellingPointsArgs) {
  return args.researchRows.flatMap((research) =>
    research.findings.filter((finding) =>
      matchesScope({
        targetCity: args.city,
        targetArea: args.area,
        city: finding.city,
        area: finding.area,
      })
    )
  );
}

function toSellingPointEntries(
  entries: Array<[string, number]>,
  source: "features" | "derived_configuration"
) {
  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, source }));
}

function addDerivedCountsFromProperties(args: BuildSellingPointsArgs, derivedCounts: Map<string, number>) {
  for (const property of args.properties) {
    if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: property.city, area: property.area })) continue;
    incrementCount(derivedCounts, property.configuration ?? property.productType);
  }
}

export function buildSellingPoints(args: BuildSellingPointsArgs): MarketSnapshotResult["sellingPoints"] {
  const featureCounts = new Map<string, number>();
  const derivedCounts = new Map<string, number>();
  for (const finding of collectScopedFindings(args)) {
    for (const feature of finding.features) incrementCount(featureCounts, feature);
    incrementCount(derivedCounts, finding.configuration ?? finding.productType);
  }

  if (featureCounts.size < 3) addDerivedCountsFromProperties(args, derivedCounts);

  const features = toSellingPointEntries(Array.from(featureCounts.entries()), "features");

  if (featureCounts.size >= 3) {
    return features;
  }

  const derived = toSellingPointEntries(
    Array.from(derivedCounts.entries()).filter(([label]) => !featureCounts.has(label)),
    "derived_configuration"
  );
  return [...features, ...derived].slice(0, 5);
}
