"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/convexApi";
import { BuyerRailCard, ResponsiveBuyerShell } from "../../components/layout";
import { MobileButton, MobileIconButton, MobileIcons } from "../../components/ui";
import { formatCurrency, getPropertyHeroImage, getPropertyLocationLabel, normalizeBuyerProperty } from "../../lib/mobileWebData";

/**
 * WHY:   Property detail on client web should mirror the mobile buyer decision surface while exposing richer desktop context.
 * WHAT:  Renders the responsive property detail route with a desktop journey rail and mobile bottom actions.
 * HOW:   Reads the buyer property from the existing mobile feed query, normalizes it, and reuses the same property copy, media, and action semantics across breakpoints.
 */
export default function PropertyDetailScreen({ propertyId }: { propertyId: string }) {
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const result = useQuery(api.user_zone.mobile.feed.getPropertyDetail, { propertyId: propertyId as never });

  if (result === undefined) {
    return <PropertyState title="جاري تحميل العقار" body="نجهز تفاصيل الوحدة بنفس تنسيق التطبيق." />;
  }

  if (!result) {
    return <PropertyState title="الوحدة غير متاحة" body="عد إلى البحث أو المحادثة الرئيسية لاختيار وحدة أخرى." />;
  }

  const property = normalizeBuyerProperty(result);
  const assistantHref = threadId ? `/app?threadId=${threadId}&propertyId=${property.id}` : `/app?propertyId=${property.id}`;

  const header = (
    <div className="flex items-center justify-between px-5 pb-4 pt-5 md:px-6 lg:border-b lg:border-slate-100 lg:px-6 lg:py-5 dark:lg:border-slate-800">
      <span className="block h-10 w-10" aria-hidden="true" />
      <h1 className="text-[18px] font-black text-slate-900 dark:text-slate-50">تفاصيل العقار</h1>
      <MobileIconButton icon={ArrowLeft} href="/search" label="رجوع" tone="panel" />
    </div>
  );

  const main = (
    <div className="min-h-0 flex-1 overflow-y-auto pb-10">
      <div className="relative bg-slate-200 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getPropertyHeroImage(property)} alt={property.title} className="h-[320px] w-full object-cover md:h-[400px]" />
        <div className="absolute right-6 top-5 lg:hidden">
          <MobileIconButton icon={ArrowLeft} href="/search" label="رجوع" tone="light" className="border-0 shadow-md" />
        </div>
      </div>

      <div className="space-y-6 px-6 pb-6 pt-6 md:px-8 lg:px-8">
        <section
          data-testid="client-property-detail"
          className="rounded-[32px] border border-slate-200 bg-white px-5 py-5 text-right dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex flex-col gap-4 md:flex-row-reverse md:items-start md:justify-between">
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
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
              <MobileIcons.User className="h-5 w-5" />
            </div>
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
                <img src={image} alt={property.title} className="h-[160px] w-[220px] rounded-[24px] object-cover md:h-[190px] md:w-[280px]" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const desktopRail = (
    <>
      <BuyerRailCard title="رحلة القرار" eyebrow="مختصر الوحدة">
        <p className="text-3xl font-black text-blue-600">{formatCurrency(property.price)}</p>
        <div className="grid grid-cols-2 gap-2 text-[12px] font-black text-slate-500 dark:text-slate-400">
          <span className="rounded-full bg-slate-50 px-3 py-2 text-center dark:bg-slate-950">{property.beds} غرف</span>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-center dark:bg-slate-950">{property.baths} حمامات</span>
          <span className="col-span-2 rounded-full bg-slate-50 px-3 py-2 text-center dark:bg-slate-950">
            {getPropertyLocationLabel(property)}
          </span>
          <span className="col-span-2 rounded-full bg-slate-50 px-3 py-2 text-center dark:bg-slate-950">
            {property.sqft ?? 0} قدم
          </span>
        </div>
        <MobileButton label="واصل في المحادثة" href={assistantHref} className="w-full" testId="client-property-finance-cta" />
        <MobileButton label="حاسبة التمويل العقاري" href={`/finance?propertyId=${property.id}`} variant="secondary" className="w-full" />
        <MobileButton label="المستشار" href={assistantHref} variant="secondary" className="w-full" />
      </BuyerRailCard>

      <BuyerRailCard title="لماذا هذا المسار؟" eyebrow="الإجراء التالي">
        <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
          استخدم المحادثة لمراجعة التمويل والعائد والتحقق ثم انتقل إلى المستشار من نفس السياق.
        </p>
      </BuyerRailCard>
    </>
  );

  const mobileBottomBar = (
    <div className="sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent px-6 pb-5 pt-10 dark:from-slate-950 dark:via-slate-950/95">
      <div className="flex flex-row-reverse gap-4">
        <MobileButton label="واصل في المحادثة" href={assistantHref} className="flex-1" testId="client-property-finance-cta" />
        <MobileButton label="المستشار" href={assistantHref} variant="secondary" className="flex-1" />
      </div>
    </div>
  );

  return <ResponsiveBuyerShell header={header} main={main} desktopRail={desktopRail} mobileBottomBar={mobileBottomBar} />;
}

function PropertyState({ title, body }: { title: string; body: string }) {
  return (
    <ResponsiveBuyerShell
      main={
        <div className="flex min-h-dvh items-center justify-center px-6">
          <div className="w-full rounded-[32px] border border-slate-200 bg-white px-8 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{title}</h1>
            <p className="mt-3 text-[15px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">{body}</p>
          </div>
        </div>
      }
    />
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
