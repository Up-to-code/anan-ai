import BrandStatStrip from "../../../_components/WorkspaceBrand/BrandStatStrip";

type ProjectsSummaryProps = {
  total: number;
  linkedBrokers: number;
  activeClients: number;
  archivedCount: number;
};

/**
 * WHY:   The projects screen needs a compact visual summary tied to broker and client activity, not publication-only counters.
 * WHAT:  Renders the top-line project, broker, client, and archive metrics.
 * HOW:   Receives precomputed counts from the page orchestrator and displays them in scan-friendly cards.
 */
export default function ProjectsSummary({
  total,
  linkedBrokers,
  activeClients,
  archivedCount,
}: ProjectsSummaryProps) {
  return (
    <BrandStatStrip
      items={[
        { label: "إجمالي المشاريع", value: total },
        { label: "وسطاء مرتبطون", value: linkedBrokers, tone: "blue" },
        { label: "عملاء نشطون", value: activeClients },
        { label: "مؤرشف", value: archivedCount },
      ]}
    />
  );
}
