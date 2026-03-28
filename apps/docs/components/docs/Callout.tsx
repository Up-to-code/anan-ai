import type { DocsCallout } from "@/lib/docs/types";
import { CircleCheckBig, Info, TriangleAlert } from "lucide-react";

const toneMap = {
  info: {
    className: "border border-blue-600/20 bg-blue-500/5 text-blue-900 shadow-sm backdrop-blur-md dark:bg-blue-500/10 dark:text-blue-100 dark:border-blue-500/20",
    iconClassName: "text-blue-600 dark:text-blue-400",
    icon: Info,
  },
  warning: {
    className: "border border-amber-500/20 bg-amber-500/5 text-amber-900 shadow-sm backdrop-blur-md dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-500/20",
    iconClassName: "text-amber-600 dark:text-amber-400",
    icon: TriangleAlert,
  },
  success: {
    className: "border border-emerald-500/20 bg-emerald-500/5 text-emerald-900 shadow-sm backdrop-blur-md dark:bg-emerald-500/10 dark:text-emerald-100 dark:border-emerald-500/20",
    iconClassName: "text-emerald-600 dark:text-emerald-400",
    icon: CircleCheckBig,
  },
} as const;

export default function Callout({ callout }: { callout: DocsCallout }) {
  const tone = toneMap[callout.tone];
  const Icon = tone.icon;

  return (
    <div className={`relative flex items-start gap-4 rounded-2xl p-5 ${tone.className}`}>
      <Icon className={`mt-[3px] h-6 w-6 shrink-0 ${tone.iconClassName}`} strokeWidth={2.5} />
      <div className="flex flex-col gap-2">
        <h5 className="text-xs font-black uppercase tracking-widest leading-none opacity-80">{callout.title}</h5>
        <div className="text-sm font-medium leading-relaxed opacity-90">{callout.body}</div>
      </div>
    </div>
  );
}
