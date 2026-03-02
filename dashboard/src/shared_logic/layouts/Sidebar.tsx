import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  KanbanSquare,
  Users,
  PanelRightClose,
  Settings,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/_core/lib/utils";
import { useAppStore } from "@/_core/store/useAppStore";
import { useRole } from "@/_core/hooks/useRole";
import { getDashboardBasePath } from "@/_core/router/paths";
import { useLocale } from "@/shared_logic/i18n/useLocale";
import { t } from "@/shared_logic/i18n/dictionary";
import { useUserData } from "@/_core/hooks/useUserData";

const getMainNavItems = (locale: "ar" | "en" | "fr", basePrefix: string) => {
  return [
    { name: t(locale, "nav.overview", "نظرة عامة"), href: `${basePrefix}`, icon: Home },
    { name: t(locale, "nav.projects", "العروض والمشاريع"), href: `${basePrefix}/projects`, icon: Building2 },
    { name: t(locale, "nav.crm", "إدارة العلاقات (CRM)"), href: `${basePrefix}/crm`, icon: KanbanSquare },
    { name: t(locale, "nav.organization", "فريق العمل"), href: `${basePrefix}/organization`, icon: Users },
  ];
};

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const location = useLocation();
  const role = useRole();
  const { locale, localizePath } = useLocale();
  const { user, isVerified } = useUserData();

  const basePrefix = getDashboardBasePath(role);
  const navItems = getMainNavItems(locale, basePrefix);
  const settingsHref = `${basePrefix}/settings`;
  const assistantHref = `${basePrefix}/assistant`;
  const canUseAssistant = role === "broker" || role === "RED";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && isSidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, setSidebarOpen]);

  const getActive = (href: string) => {
    const localizedHref = localizePath(href);
    return (
      location.pathname === localizedHref ||
      (localizedHref !== localizePath("/dashboard") && location.pathname.startsWith(localizedHref))
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-slate-800 bg-slate-950 text-slate-100 transition-transform duration-300",
          isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-b border-slate-800 p-4">
          <div className="mb-4 flex h-8 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <span className="text-white font-bold text-lg">ع</span>
              </div>
              <span className="text-lg font-bold">{t(locale, "brand.name", "ai-عنان")}</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
            >
              <PanelRightClose className="h-5 w-5" />
            </button>
          </div>

          <Link
            to={localizePath(settingsHref)}
            className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
              {(user?.name ?? user?.email ?? "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{user?.name ?? "مستخدم عنان"}</p>
              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-300">
                {isVerified ? (
                  <>
                    <BadgeCheck className="h-3 w-3 text-emerald-400" />
                    موثق
                  </>
                ) : (
                  "بانتظار التوثيق"
                )}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navItems.map((item) => {
            const localizedHref = localizePath(item.href);
            const isActive = getActive(item.href);
            return (
              <Link
                key={item.name}
                to={localizedHref}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-200",
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-800 px-3 py-4">
          {canUseAssistant && (
            <Link
              to={localizePath(assistantHref)}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
                getActive(assistantHref)
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-white/5 hover:text-white",
              )}
            >
              <Sparkles className="h-5 w-5" />
              <span>Anan-AI Mode</span>
            </Link>
          )}
          <Link
            to={localizePath(settingsHref)}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
              getActive(settingsHref)
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings className="h-5 w-5 text-slate-400 group-hover:text-slate-200" />
            <span>{t(locale, "nav.settings", "الإعدادات")}</span>
          </Link>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
