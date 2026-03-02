import { Bell, ChevronLeft, Menu } from "lucide-react";
import { useAppStore } from "@/_core/store/useAppStore";
import { useUserData } from "@/_core/hooks/useUserData";

export function Header() {
  const { toggleSidebar } = useAppStore();
  const { role } = useUserData();

  const roleLabel = role === "broker" ? "وسيط عقاري" : role === "RED" ? "مطور عقاري" : "عضو";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 active:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-500">لوحة التحكم</span>
          <ChevronLeft className="h-4 w-4 text-slate-300" />
          <span className="font-bold text-slate-900">{roleLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
          title="الإشعارات"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
