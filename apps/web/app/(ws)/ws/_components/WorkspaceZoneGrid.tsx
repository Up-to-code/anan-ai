import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AIMotionLogo } from "./AIMotion";
import type { ZoneDescriptor } from "../_lib/zones";

/**
 * WHY:   The workspace launcher needs a visual map of the available zones before the user starts a task or chat.
 * WHAT:  Renders the AI mark plus a grid of quick-access cards for the visible workspace zones.
 * HOW:   Receives server-approved zone descriptors and projects them into branded route cards with stable copy.
 */
export default function WorkspaceZoneGrid({
  organizationName,
  userName,
  zones,
}: {
  organizationName: string;
  userName: string | null;
  zones: ZoneDescriptor[];
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((zone) => {
          const Icon = zone.icon;

          return (
            <Link
              key={zone.key}
              href={zone.href}
              className="group border border-slate-200 bg-white p-5 text-right transition hover:border-blue-600 hover:shadow-[0_16px_35px_-18px_rgba(37,99,235,0.45)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center border border-slate-200 bg-slate-50 text-slate-900 transition group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    {organizationName}
                  </div>
                  <h3 className="text-lg font-black text-slate-950">{zone.label}</h3>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium leading-7 text-slate-600">{zone.description}</p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                <span>{userName ? `جاهز لـ ${userName}` : "جاهز للتنفيذ"}</span>
                <span className="inline-flex items-center gap-2 text-blue-600">
                  افتح المسار
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
        <AIMotionLogo state="idle" size="compact" />
        <span>اسأل أنان، أو ابدأ بإنشاء عرض، أو ابحث في مشاريعك...</span>
      </div>
    </div>
  );
}
