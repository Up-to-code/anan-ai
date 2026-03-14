import Link from "next/link";
import BrokerPresenceChip from "../../_components/Visuals/BrokerPresenceChip";
import type { OfferMarketplaceItem } from "./offerTypes";
import { ArrowLeft } from "lucide-react";

export default function OfferCards({
  items,
}: {
  items: OfferMarketplaceItem[];
}) {
  return (
    <div className="flex flex-col border border-slate-200 bg-white w-full">
      {items.map((item, index) => (
        <article
          key={item.id}
          className={`group flex flex-col gap-6 p-6 transition hover:bg-slate-50 md:flex-row md:items-start md:justify-between ${index !== items.length - 1 ? 'border-b border-slate-100' : ''}`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-3 relative">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-950 truncate transition-colors group-hover:text-blue-600">{item.title}</h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 bg-slate-50 px-3 py-1">
                {item.demandLabel ?? item.ownerLabel}
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-3xl">
              <span className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">{item.project.title}</span> • {item.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-6 items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">السعر التقديري</span>
                <span className="text-sm font-black text-slate-950 mt-1">{item.priceLabel}</span>
              </div>
              <div className="w-px h-8 bg-slate-100 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">مساحة الأصل</span>
                <span className="text-sm font-black text-slate-950 mt-1">{item.project.area}</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end w-full md:w-auto mt-4 md:mt-0">
            {item.broker && (
              <div className="w-full md:w-auto">
                <BrokerPresenceChip broker={item.broker} />
              </div>
            )}
            <Link
              href={`/ws/offers/${item.id}`}
              className="flex items-center justify-center gap-2 w-full md:w-auto border border-slate-200 bg-white px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white group/btn"
            >
              استعراض العرض
              <ArrowLeft className="h-4 w-4 text-slate-400 group-hover/btn:text-white transition-colors" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
