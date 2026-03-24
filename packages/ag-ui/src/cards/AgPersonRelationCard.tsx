import { BadgeCheck, Star, UserRound } from "lucide-react";

/**
 * WHY:   Many agent turns need to anchor a person to a project or unit context using a consistent summary card.
 * WHAT:  Displays a person, role, summary, relation, and project/unit context with optional badges.
 * HOW:   Renders the person metadata in a compact profile header followed by relation detail cells.
 */
export default function AgPersonRelationCard({
  name,
  role,
  summary,
  relation,
  project,
  unit,
  badges = [],
}: {
  name: string;
  role: string;
  summary: string;
  relation: string;
  project: string;
  unit?: string;
  badges?: Array<"verified" | "vip">;
}) {
  return (
    <section className="w-full max-w-[300px] border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center bg-slate-950 text-white">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-slate-950">{name}</h3>
            {badges.includes("verified") ? (
              <span className="flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                <BadgeCheck className="h-3 w-3" />
                موثق
              </span>
            ) : null}
            {badges.includes("vip") ? (
              <span className="flex items-center gap-1 border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">
                <Star className="h-3 w-3" />
                VIP
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-[11px] font-black tracking-[0.18em] text-blue-700">{role}</div>
          <p className="mt-2 text-xs font-medium leading-6 text-slate-500">{summary}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-xs font-bold text-slate-700">
        <div className="border border-slate-200 bg-slate-50 px-3 py-2">{relation}</div>
        <div className="border border-slate-200 bg-slate-50 px-3 py-2">
          {project}
          {unit ? <span className="mr-2 text-slate-400">/ {unit}</span> : null}
        </div>
      </div>
    </section>
  );
}
