import { MarketSnapshotResult, NormalizedProperty, NormalizedResearch } from "./types";
import { incrementCount, matchesScope } from "./utils";

type BuildSellingPointsArgs = {
  properties: NormalizedProperty[];
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
};

export function buildSellingPoints(args: BuildSellingPointsArgs): MarketSnapshotResult["sellingPoints"] {
  const featureCounts = new Map<string, number>();
  const derivedCounts = new Map<string, number>();

  for (const research of args.researchRows) {
    for (const finding of research.findings) {
      if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area })) continue;
      for (const feature of finding.features) {
        incrementCount(featureCounts, feature);
      }
      incrementCount(derivedCounts, finding.configuration ?? finding.productType);
    }
  }

  if (featureCounts.size < 3) {
    for (const property of args.properties) {
      if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: property.city, area: property.area })) continue;
      incrementCount(derivedCounts, property.configuration ?? property.productType);
    }
  }

  const features = Array.from(featureCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, source: "features" as const }));

  if (featureCounts.size >= 3) {
    return features;
  }

  const derived = Array.from(derivedCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .filter(([label]) => !featureCounts.has(label))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, source: "derived_configuration" as const }));
  return [...features, ...derived].slice(0, 5);
}
