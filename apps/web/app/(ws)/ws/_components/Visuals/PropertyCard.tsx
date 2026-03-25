import Link from "next/link";
import { cn } from "@/lib/utils";

type PropertyCardSpec = {
  label: string;
  value: string;
};

/**
 * WHY:   Multiple workspace zones need one reusable real-estate card instead of bespoke text blocks.
 * WHAT:  Renders a clean, minimal property card with image, key info, specs, and optional footer.
 * HOW:   Uses a simple photo hero with a tighter layout that keeps attention on the item itself.
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
  const content = (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300",
        density === "flexible" ? "w-full" : density === "detail" ? "w-full max-w-sm" : "w-full max-w-xs",
      )}
    >
      <div className="h-44 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-full w-full object-cover" />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 text-right">
            <h2 className="truncate text-base font-semibold leading-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{location}</p>
          </div>
          <div className="shrink-0 text-sm font-semibold text-slate-900">{priceLabel}</div>
        </div>

        {summary ? <p className="line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p> : null}

        {specs.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4">
            {specs.slice(0, 4).map((spec) => (
              <div key={spec.label}>
                <div className="text-[11px] text-slate-500">{spec.label}</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{spec.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {publicationBadge ? <div className="text-xs text-slate-500">{publicationBadge}</div> : null}

        {footer ? <div className="border-t border-slate-100 pt-3">{footer}</div> : null}
      </div>
    </article>
  );

  if (!href) return content;
  return <Link href={href} className="block">{content}</Link>;
}
