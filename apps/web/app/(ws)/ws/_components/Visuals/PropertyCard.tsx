import Link from "next/link";
import BrandVectorPanel from "../WorkspaceBrand/BrandVectorPanel";
import type { BrokerPresence } from "./BrokerPresenceChip";
import BrokerPresenceChip from "./BrokerPresenceChip";
import { cn } from "@/lib/utils";

type PropertyCardSpec = {
  label: string;
  value: string;
};

/**
 * WHY:   Multiple workspace zones need one reusable real-estate card instead of bespoke text blocks.
 * WHAT:  Renders an image-first property card with specs, summary, and optional broker presence chips.
 * HOW:   Defaults to a branded vector media panel while keeping a photo fallback path for identity-heavy cases.
 */
export default function PropertyCard({
  href,
  image,
  title,
  location,
  priceLabel,
  summary,
  specs,
  brokers,
  footer,
  mediaMode = "brand",
  density = "compact",
}: {
  href?: string;
  image: string;
  title: string;
  location: string;
  priceLabel: string;
  summary: string;
  specs: PropertyCardSpec[];
  brokers?: BrokerPresence[];
  footer?: React.ReactNode;
  mediaMode?: "brand" | "photo";
  density?: "compact" | "detail" | "flexible";
}) {
  const accent =
    brokers && brokers.some((broker) => broker.state === "client-linked")
      ? "blue"
      : brokers && brokers.some((broker) => broker.state === "qualified")
        ? "emerald"
        : "slate";

  const widthClass = density === "flexible"
    ? "w-full min-w-[300px]"
    : density === "detail"
      ? "w-full max-w-[340px]"
      : "w-full max-w-[300px]";

  const Content = (
    <article
      className={cn(
        "group relative border border-slate-200 bg-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-blue-600 hover:shadow-[0_22px_45px_-15px_rgba(0,41,255,0.08)] active:scale-[0.98] overflow-hidden",
        widthClass
      )}
    >
      <div className="overflow-hidden">
        <div className="transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110">
          <BrandVectorPanel
            title={title}
            subtitle={location}
            accent={accent}
            imageSrc={image}
            imageAlt={title}
            imageMode={mediaMode === "photo" ? "photo" : "vector"}
            size={density === "flexible" ? "large" : "default"}
          />
        </div>
      </div>

      <div className="grid gap-6 p-6">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
          <p className="text-sm font-medium leading-relaxed text-slate-600 line-clamp-2 text-right">{summary}</p>
          <div className="shrink-0 border-2 border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-none">{priceLabel}</div>
        </div>

        <div className="grid grid-cols-4 gap-px bg-slate-100/30 border border-slate-100/50 backdrop-blur-md">
          {specs.map((spec) => (
            <div key={spec.label} className="bg-white/90 px-2 py-3 text-center transition-colors duration-500 group-hover:bg-white/100">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors duration-500">{spec.label}</div>
              <div className="mt-1 text-xs font-black text-slate-950">{spec.value}</div>
            </div>
          ))}
        </div>

        {brokers && brokers.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {brokers.map((broker) => (
              <BrokerPresenceChip key={broker.id} broker={broker} />
            ))}
          </div>
        ) : null}

        {footer ? <div className="border-t border-slate-50 pt-4">{footer}</div> : null}
      </div>
    </article>
  );

  if (!href) {
    return Content;
  }

  return <Link href={href}>{Content}</Link>;
}
