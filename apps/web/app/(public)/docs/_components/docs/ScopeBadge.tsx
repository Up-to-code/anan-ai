import { ScopeBadge as SharedScopeBadge } from "@anan/ui/docs";
import { getScopeLabel } from "@/lib/docs/registry";

export default function ScopeBadge({ scopeId }: { scopeId: string }) {
  return <SharedScopeBadge scopeId={scopeId} label={getScopeLabel(scopeId)} />;
}
