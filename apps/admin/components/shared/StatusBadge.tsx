import { StatusBadge as SharedStatusBadge } from "@anan/ui/admin";
import { labelForStatus } from "@/lib/adminLabels";

export default function StatusBadge({
  value,
  className,
}: {
  value?: string | null;
  className?: string;
}) {
  return <SharedStatusBadge value={value} className={className} formatLabel={labelForStatus} />;
}
