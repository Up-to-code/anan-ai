"use client";

import { Building2, Globe, Mail, MapPin, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { OrganizationPublicProfile } from "@/server/contracts/organizations";

/**
 * WHY:   Detailed partner visibility is key for professional collaboration in the marketplace.
 * WHAT:  A premium, flat layout showing organization metadata and a grid of their published offers.
 * HOW:   Provides deep links to specific offers while maintaining the simplified, high-contrast design aesthetic.
 */
export default function OrganizationProfileUI({
  profile,
  type,
}: {
  profile: OrganizationPublicProfile;
  type: string;
}) {
  return (
    <div className="flex min-h-full flex-col p-6 lg:p-10 gap-10">
      {/* Header / Hero */}
      <header className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-right">
        <div className="h-32 w-32 shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-center">
          {profile.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo} alt={profile.name} className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-12 w-12 text-slate-300" />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-3xl font-black text-slate-950">{profile.name}</h1>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                {type === "broker" ? "وسيط معتمد" : "مطور عقاري"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 max-w-2xl mx-auto md:mx-0">
                {profile.description || "لا يوجد وصف متوفر لهذه الجهة حالياً."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                <Globe className="h-4 w-4 text-slate-400" />
                الموقع الإلكتروني
              </a>
            )}
            {profile.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">
                <Mail className="h-4 w-4 text-slate-400" />
                {profile.contactEmail}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="h-px bg-slate-100 w-full" />

      {/* Offers Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Briefcase className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black text-slate-950">العروض المنشورة ({profile.offers.length})</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profile.offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/ws/offers/${offer.id}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-600"
            >
              <div className="mb-4 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="line-clamp-2 text-base font-black text-slate-900 group-hover:text-blue-600">
                    {offer.property?.title || "عرض عقاري"}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {offer.property?.location || offer.property?.address || "موقع غير محدد"}
                </div>

                <p className="line-clamp-2 text-xs font-medium text-slate-400 leading-relaxed">
                  {offer.description || "لا يوجد وصف تفصيلي لهذا العرض."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">السعر المعروض</span>
                  <span className="text-sm font-black text-slate-950">
                    {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(offer.price)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </div>
              </div>
            </Link>
          ))}

          {profile.offers.length === 0 && (
            <div className="col-span-full py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm font-bold text-slate-400">لا توجد عروض منشورة لهذه الجهة حالياً.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
