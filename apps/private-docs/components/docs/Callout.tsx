import type { DocsCallout } from "@/lib/docs/types";
import { CircleCheckBig, Info, TriangleAlert } from "lucide-react";

const toneMap = {
  info: {
    className: "border-2 border-blue-600 bg-white text-slate-900",
    iconClassName: "text-blue-600",
    icon: Info,
  },
  warning: {
    className: "border-2 border-amber-500 bg-white text-slate-900",
    iconClassName: "text-amber-500",
    icon: TriangleAlert,
  },
  success: {
    className: "border-2 border-emerald-500 bg-white text-slate-900",
    iconClassName: "text-emerald-500",
    icon: CircleCheckBig,
  },
} as const;

export default function Callout({ callout }: { callout: DocsCallout }) {
  const tone = toneMap[callout.tone];
  const Icon = tone.icon;

  return (
    <div className={`relative flex items-start gap-4 rounded-none p-5 ${tone.className}`}>
      <Icon className={`mt-[3px] h-6 w-6 shrink-0 ${tone.iconClassName}`} strokeWidth={2.5} />
      <div className="flex flex-col gap-2">
        <h5 className="text-xs font-black uppercase tracking-widest leading-none text-slate-900">{callout.title}</h5>
        <div className="text-sm font-medium leading-relaxed text-slate-600">{callout.body}</div>
      </div>
    </div>
  );
}
