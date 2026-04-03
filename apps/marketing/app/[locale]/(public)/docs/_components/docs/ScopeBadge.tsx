import { getScopeLabel } from "@/lib/docs/registry";
import { Badge } from "../vendor/ui/badge";
import { Card, CardContent } from "../vendor/ui/card";

export default function ScopeBadge({ scopeId }: { scopeId: string }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="px-3 py-2">
        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[11px] uppercase tracking-[0.14em] text-primary">
          {scopeId}
        </Badge>
        <div className="mt-2 text-xs text-foreground/85">{getScopeLabel(scopeId)}</div>
      </CardContent>
    </Card>
  );
}
