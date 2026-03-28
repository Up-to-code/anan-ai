import { Badge } from "@/client_zone/components/ui/badge";
import { useLocaleDictionary } from "@/client_zone/components/LocaleProvider";
import { AgUiCardHeading, AgUiCardShell } from "../AgUiCardPrimitives";
import type { PermitStatusCardProps } from "../types";

/**
 * WHY:   The client experience should make verification status explicit when the assistant recommends a property.
 * WHAT:  Renders a compact permit and verification state block.
 * HOW:   Keeps the message brief so it supports the decision instead of taking over the thread.
 */
export function PermitStatusCard(props: PermitStatusCardProps) {
  const { locale } = useLocaleDictionary();
  const label =
    props.permitStatus === "verified"
      ? locale === "ar"
        ? "موثق"
        : "Verified"
      : props.permitStatus === "pending_review"
        ? locale === "ar"
          ? "قيد المراجعة"
          : "Pending review"
        : locale === "ar"
          ? "غير متاح"
          : "Not available";

  return (
    <AgUiCardShell>
      <AgUiCardHeading title={props.title} summary={props.summary} aside={<Badge>{label}</Badge>} />
    </AgUiCardShell>
  );
}
