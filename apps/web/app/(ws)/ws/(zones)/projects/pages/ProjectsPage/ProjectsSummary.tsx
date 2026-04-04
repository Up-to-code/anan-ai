import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import BrandStatStrip from "../../../../_components/WorkspaceBrand/BrandStatStrip";

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
  const { locale } = useWebLocale();
  return (
    <BrandStatStrip
      items={[
        { label: locale === "fr" ? "Projets au total" : locale === "en" ? "Total projects" : "إجمالي المشاريع", value: total },
        { label: locale === "fr" ? "Courtiers lies" : locale === "en" ? "Linked brokers" : "وسطاء مرتبطون", value: linkedBrokers, tone: "blue" },
        { label: locale === "fr" ? "Clients actifs" : locale === "en" ? "Active clients" : "عملاء نشطون", value: activeClients },
        { label: locale === "fr" ? "Archives" : locale === "en" ? "Archived" : "مؤرشف", value: archivedCount },
      ]}
    />
  );
}
