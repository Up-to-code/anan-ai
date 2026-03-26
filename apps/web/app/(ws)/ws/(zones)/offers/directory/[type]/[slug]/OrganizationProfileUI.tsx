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
    <div className="flex min-h-full flex-col p-6 lg:p-12 gap-12 bg-background">
      {/* Header / Hero */}
      <header className="relative flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-right rounded-3xl border border-border bg-card p-8 md:p-12 shadow-xl shadow-black/[0.02]">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-[32px] border border-border/40 bg-background p-6 shadow-sm">
          {profile.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={profile.logo} alt={profile.name} className="h-full w-full object-contain" />
          ) : (
            <Building2 className="h-14 w-14 text-muted-foreground/30" />
          )}
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4">
              <h1 className="text-3xl font-black tracking-tight text-foreground">{profile.name}</h1>
              <span className="inline-flex w-fit mx-auto md:mx-0 rounded-xl border border-border/40 bg-muted/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {type === "broker" ? "وسيط معتمد" : "مطور عقاري"}
              </span>
            </div>
            <p className="text-[15px] font-medium leading-relaxed text-muted-foreground max-w-3xl mx-auto md:mx-0">
                {profile.description || "لا يوجد وصف متوفر لهذه الجهة حالياً."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-2">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2.5 text-[13px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all">
                <Globe className="h-4 w-4 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                الموقع الإلكتروني
              </a>
            )}
            {profile.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="group flex items-center gap-2.5 text-[13px] font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all">
                <Mail className="h-4 w-4 text-muted-foreground/40 group-hover:scale-110 transition-transform" />
                {profile.contactEmail}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="h-px bg-border/40 w-full" />

      {/* Offers Section */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">العروض المنشورة ({profile.offers.length})</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profile.offers.map((offer) => (
            <Link
              key={offer.id}
              href={`/ws/offers/${offer.id}`}
              className="group flex flex-col rounded-[32px] border border-border bg-card p-8 shadow-xl shadow-black/[0.02] transition-all hover:border-foreground/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="mb-6 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="line-clamp-2 text-[17px] font-black tracking-tight text-foreground transition-colors group-hover:text-foreground/80">
                    {offer.property?.title || "عرض عقاري"}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground/60">
                  <MapPin className="h-3.5 w-3.5" />
                  {offer.property?.location || offer.property?.address || "موقع غير محدد"}
                </div>

                <p className="line-clamp-3 text-[14px] font-medium text-muted-foreground/70 leading-relaxed">
                  {offer.description || "لا يوجد وصف تفصيلي لهذا العرض."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border/40">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">السعر المعروض</span>
                  <span className="text-base font-black text-foreground mt-0.5">
                    {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(offer.price)}
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/10 text-muted-foreground transition-all group-hover:bg-foreground group-hover:text-background">
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </div>
              </div>
            </Link>
          ))}

          {profile.offers.length === 0 && (
            <div className="col-span-full rounded-[32px] border border-dashed border-border/60 bg-muted/10 py-24 text-center">
              <p className="text-[15px] font-black text-muted-foreground/40 uppercase tracking-widest">لا توجد عروض منشورة لهذه الجهة حالياً.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
