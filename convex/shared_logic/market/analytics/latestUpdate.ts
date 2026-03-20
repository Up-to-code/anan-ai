import { MarketSnapshotResult, NormalizedResearch } from "./types";
import { matchesScope } from "./utils";

type SelectLatestUpdateArgs = {
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
};

export function selectLatestUpdate(args: SelectLatestUpdateArgs): MarketSnapshotResult["latestUpdate"] {
  const sorted = [...args.researchRows].sort((a, b) => b.createdAt - a.createdAt);
  const areaMatch =
    args.city && args.area
      ? sorted.find((row) =>
          row.findings.some((finding) => finding.city === args.city && finding.area === args.area) ||
          (row.primaryCity === args.city && row.primaryArea === args.area)
        )
      : undefined;
  const cityMatch =
    args.city && !areaMatch
      ? sorted.find((row) =>
          row.findings.some((finding) => finding.city === args.city) || row.primaryCity === args.city
        )
      : undefined;
  const row = areaMatch ?? cityMatch ?? sorted[0];
  if (!row) return null;
  const scopedFindings = row.findings.filter((finding) =>
    matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area })
  );
  const findingsToShow = (scopedFindings.length > 0 ? scopedFindings : row.findings).slice(0, 3);
  return {
    query: row.query,
    createdAt: row.createdAt,
    status: row.status,
    sourceCount: row.sourceCount,
    topFindings: findingsToShow.map((finding) => ({
      title: finding.title,
      locationHint: finding.city,
      priceHint: finding.priceHint,
      area: finding.area,
      features: finding.features.length > 0 ? finding.features : undefined,
      sourceTitle: finding.sourceTitle,
      sourceUrl: finding.sourceUrl,
    })),
  };
}
