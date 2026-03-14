import { cn } from "@/lib/utils";

const ACCENT_STYLES = {
  blue: {
    ring: "border-blue-200",
    wash: "from-blue-50 via-white to-slate-50",
    stroke: "#2563EB",
    muted: "#BFDBFE",
    node: "#0F172A",
  },
  emerald: {
    ring: "border-emerald-200",
    wash: "from-emerald-50 via-white to-slate-50",
    stroke: "#059669",
    muted: "#A7F3D0",
    node: "#0F172A",
  },
  slate: {
    ring: "border-slate-200",
    wash: "from-slate-100 via-white to-slate-50",
    stroke: "#334155",
    muted: "#CBD5E1",
    node: "#0F172A",
  },
} as const;

/**
 * WHY:   The reskinned workspace needs a vector-first media surface instead of relying on generic photography.
 * WHAT:  Renders an abstract branded panel with optional metadata and a photo/avatar fallback.
 * HOW:   Uses inline SVG signal geometry plus a gradient wash so server pages can render it without extra assets.
 */
export default function BrandVectorPanel({
  title,
  subtitle,
  accent = "blue",
  imageSrc,
  imageAlt,
  imageMode = "vector",
  size = "default",
  className,
}: {
  title: string;
  subtitle?: string;
  accent?: keyof typeof ACCENT_STYLES;
  imageSrc?: string;
  imageAlt?: string;
  imageMode?: "vector" | "photo";
  size?: "default" | "large";
  className?: string;
}) {
  const style = ACCENT_STYLES[accent];
  const heightClass = size === "large" ? "min-h-[280px]" : "min-h-[220px]";

  return (
    <div
      className={cn(
        "relative overflow-hidden border bg-white",
        style.ring,
        className,
      )}
    >
      {imageMode === "photo" && imageSrc ? (
        <div className={cn("relative h-full overflow-hidden bg-slate-200", heightClass)}>
          <img src={imageSrc} alt={imageAlt ?? title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-white/10" />
        </div>
      ) : (
        <div className={cn("relative bg-gradient-to-br", heightClass, style.wash)}>
          <svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <rect x="0" y="0" width="520" height="260" fill="transparent" />
            <path d="M90 190 L170 120 L255 150 L335 82 L430 110" fill="none" stroke={style.muted} strokeWidth="18" strokeLinecap="round" />
            <path d="M90 190 L170 120 L255 150 L335 82 L430 110" fill="none" stroke={style.stroke} strokeWidth="4" strokeLinecap="round" />
            <path d="M120 74 L120 186" fill="none" stroke={style.muted} strokeWidth="2" strokeDasharray="8 8" />
            <path d="M396 58 L396 204" fill="none" stroke={style.muted} strokeWidth="2" strokeDasharray="8 8" />
            <circle cx="90" cy="190" r="12" fill={style.node} />
            <circle cx="170" cy="120" r="11" fill={style.stroke} />
            <circle cx="255" cy="150" r="10" fill={style.node} />
            <circle cx="335" cy="82" r="12" fill={style.stroke} />
            <circle cx="430" cy="110" r="10" fill={style.node} />
            <circle cx="385" cy="176" r="9" fill={style.stroke} opacity="0.88" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-5 pb-5 pt-12">
            <div className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-700">Anan Signal</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</div>
            {subtitle ? <div className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">{subtitle}</div> : null}
          </div>
        </div>
      )}
    </div>
  );
}
