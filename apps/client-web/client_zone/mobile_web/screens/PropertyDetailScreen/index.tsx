"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { MobileViewport, MobileIconButton, MobileButton } from "../../components/ui";
import { normalizeBuyerProperty, formatCurrency, getPropertyHeroImage, getPropertyLocationLabel } from "../../lib/mobileWebData";
import { ArrowLeft, Bath, BedDouble, MapPin, Ruler } from "lucide-react";

/**
 * WHY:   Property detail on client web should present the exact same buyer decision surface used in the mobile application.
 * WHAT:  Renders the mobile-style property detail screen with hero image, facts, summary, broker card, gallery, and sticky journey actions.
 * HOW:   Reads the buyer property from Convex, normalizes it into the shared shape, and keeps all navigation inside the mobile-web flow.
 */
export default function PropertyDetailScreen({ propertyId }: { propertyId: string }) {
  const result = useQuery(api.user_zone.mobile.feed.getPropertyDetail, { propertyId: propertyId as never });

  if (result === undefined) {
    return <PropertyState title="جاري تحميل العقار" body="نجهز تفاصيل الوحدة بنفس تنسيق التطبيق." />;
  }

  if (!result) {
    return <PropertyState title="الوحدة غير متاحة" body="عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى." />;
  }

  const property = normalizeBuyerProperty(result);

  return (
    <MobileViewport className="relative">
      <div className="flex-1 overflow-y-auto pb-36">
        <div className="relative bg-slate-200 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getPropertyHeroImage(property)} alt={property.title} className="h-[360px] w-full object-cover" />
          <div className="absolute right-6 top-5">
            <MobileIconButton icon={ArrowLeft} href="/search" label="رجوع" tone="light" className="border-0 shadow-md" />
          </div>
        </div>

        <div className="space-y-6 px-6 pb-10 pt-6">
          <section className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-row-reverse items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-[26px] leading-tight font-black text-slate-900 dark:text-slate-50">{property.title}</h1>
                <div className="mt-2 flex flex-row-reverse items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[14px] font-bold">{getPropertyLocationLabel(property)}</span>
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600">{formatCurrency(property.price)}</p>
            </div>

            <div className="mt-6 flex flex-row-reverse flex-wrap gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
              <DetailFact icon={BedDouble} label={`${property.beds} غرف`} />
              <DetailFact icon={Bath} label={`${property.baths} حمامات`} />
              <DetailFact icon={Ruler} label={`${property.sqft ?? 0} قدم`} />
            </div>

            <div className="mt-6 space-y-3">
              <MobileButton label="واصل في المحادثة" href={`/app?propertyId=${property.id}`} className="w-full" testId="client-property-finance-cta" />
              <MobileButton label="حاسبة التمويل العقاري" href={`/finance?propertyId=${property.id}`} variant="secondary" className="w-full" />
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 text-right dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-slate-50">قراءة سريعة</h2>
            <p className="text-[15px] leading-8 font-medium text-slate-500 dark:text-slate-400">
              {property.aiSummary ?? "هذا العقار متاح الآن عبر تجربة الموبايل الحية. افتح المحادثة لمراجعة التمويل والعائد والتحويل إلى مستشار."}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-right text-lg font-black text-slate-900 dark:text-slate-50">المسوق العقاري</h2>
            <Link
              href={`/broker/${property.owner.id}?propertyId=${property.id}`}
              className="flex flex-row-reverse items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-4 text-right transition active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPropertyHeroImage(property)}
                alt={property.owner.name}
                className="h-[60px] w-[60px] rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-[16px] font-black text-slate-900 dark:text-slate-50">{property.owner.name}</p>
                <p className="text-[13px] font-medium text-slate-500">
                  {property.owner.agencyLabel ?? (property.owner.type === "broker" ? "وسيط موثق" : "مطور موثق")}
                </p>
              </div>
            </Link>
          </section>

          <section className="py-2">
            <h2 className="mb-6 text-right text-lg font-black text-slate-900 dark:text-slate-50">الصور الداخلية</h2>
            <div className="flex flex-row-reverse gap-4 overflow-x-auto pb-1">
              {property.media.map((image) => (
                <Link key={image} href={`/gallery?propertyId=${property.id}`} className="shrink-0 transition active:opacity-80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={property.title} className="h-[160px] w-[220px] rounded-[24px] object-cover" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-6 pb-5 pt-10 dark:from-slate-950 dark:via-slate-950/95">
        <div className="flex flex-row-reverse gap-4">
          <MobileButton label="حجز زيارة" href={`/app?propertyId=${property.id}`} className="flex-1" />
          <MobileButton label="المستشار" href={`/app?propertyId=${property.id}`} variant="secondary" className="flex-1" />
        </div>
      </div>
    </MobileViewport>
  );
}

function PropertyState({ title, body }: { title: string; body: string }) {
  return (
    <MobileViewport className="items-center justify-center px-6">
      <div className="w-full rounded-[32px] border border-slate-200 bg-white px-8 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">{body}</p>
      </div>
    </MobileViewport>
  );
}

function DetailFact({ icon: Icon, label }: { icon: typeof BedDouble; label: string }) {
  return (
    <div className="flex flex-row-reverse items-center gap-2.5 rounded-full border border-slate-100 bg-slate-50 px-5 py-3 text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
      <Icon className="h-4 w-4 text-slate-400" />
      <span className="text-[14px] font-black">{label}</span>
    </div>
  );
}
