import Link from "next/link";
import { cn } from "@/lib/utils";

type PropertyCardSpec = {
  label: string;
  value: string;
};

/**
 * WHY:   Multiple workspace zones need one reusable real-estate card instead of bespoke text blocks.
 * WHAT:  Renders a clean, minimal property card with image, key info, specs, and optional footer.
 * HOW:   Uses a simple photo hero with smooth hover transitions and a tight content layout.
 */
export default function PropertyCard({
  href,
  image,
  title,
  location,
  priceLabel,
  summary,
  specs,
  footer,
  publicationBadge,
  density = "compact",
}: {
  href?: string;
  image: string;
  title: string;
  location: string;
  priceLabel: string;
  summary: string;
  specs: PropertyCardSpec[];
  footer?: React.ReactNode;
  publicationBadge?: React.ReactNode;
  density?: "compact" | "detail" | "flexible";
}) {
  const Content = (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-sm transition-all duration-500 hover:shadow-md hover:border-slate-300",
        density === "flexible" ? "w-full" : density === "detail" ? "w-full max-w-sm" : "w-full max-w-xs",
      )}
    >
      {/* Hero image with smooth zoom */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Price pill - floating slightly */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-sm">
          {priceLabel}
        </div>

        {/* Publication badge */}
        {publicationBadge ? (
          <div className="absolute top-3 right-3">{publicationBadge}</div>
        ) : null}
      </div>

      {/* Content area */}
      <div className="space-y-4 p-5">
        <div className="text-right">
          <h2 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{title}</h2>
          <p className="mt-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{location}</p>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 text-right font-medium">
          {summary}
        </p>

        {/* Specs row - very minimal */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50/80 p-2 text-right">
          {specs.slice(0, 4).map((spec) => (
            <div key={spec.label} className="px-2">
              <div className="text-[9px] font-bold text-slate-400">{spec.label}</div>
              <div className="text-[11px] font-bold text-slate-700">{spec.value}</div>
            </div>
          ))}
        </div>

        {/* Action footer */}
        {footer ? (
          <div className="pt-3 border-t border-slate-100">
            {footer}
          </div>
        ) : null}
      </div>
    </article>
  );

  if (!href) return Content;
  return <Link href={href} className="block">{Content}</Link>;
}
