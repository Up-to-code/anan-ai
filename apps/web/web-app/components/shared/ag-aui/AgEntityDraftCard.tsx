import { BadgeCheck, Building2, Sparkles, UserRound } from "lucide-react";

type DraftField = {
  label: string;
  value: string;
  emphasized?: boolean;
};

export default function AgEntityDraftCard({
  title,
  subtitle,
  fields,
  kind = "project",
}: {
  title: string;
  subtitle: string;
  fields: DraftField[];
  kind?: "project" | "offer" | "person";
}) {
  const Icon = kind === "person" ? UserRound : kind === "offer" ? BadgeCheck : Building2;

  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-black tracking-[0.28em] text-blue-700">
            مسودة جاهزة للمراجعة
          </div>
          <h3 className="text-base font-black text-slate-950">{title}</h3>
          <p className="text-xs font-medium leading-6 text-slate-500">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center border border-blue-100 bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {fields.map((field) => (
          <div key={field.label} className="border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] font-black tracking-[0.22em] text-slate-400">{field.label}</div>
            <div
              className={
                field.emphasized
                  ? "mt-1 text-sm font-black text-slate-950"
                  : "mt-1 text-sm font-bold text-slate-700"
              }
            >
              {field.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-[10px] font-black tracking-[0.22em] text-blue-700">
        <Sparkles className="h-3.5 w-3.5" />
        هذه المسودة يمكن تعديلها أو اعتمادها مباشرة
      </div>
    </section>
  );
}
