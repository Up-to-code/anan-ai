import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/_core/lib/utils";
import { useRole } from "@/_core/hooks/useRole";
import { getDashboardBasePath } from "@/_core/router/paths";
import { useLocale } from "@/shared_logic/i18n/useLocale";

export function AgentSwitcher() {
  const role = useRole();
  const { localizePath } = useLocale();
  const location = useLocation();

  const href = localizePath(`${getDashboardBasePath(role)}/assistant`);
  const isActive = location.pathname.startsWith(href);

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-label={isActive ? "وضع الذكاء (فعّال)" : "وضع الذكاء"}
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      <span>Anan-AI Mode</span>
    </Link>
  );
}
