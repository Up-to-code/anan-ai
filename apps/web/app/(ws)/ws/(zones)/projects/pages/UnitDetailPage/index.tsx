"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  Eye,
  FileText,
  MapPin,
  MessageSquareMore,
  Ruler,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { WorkspaceProjectUnitDetail } from "../../types/projectTypes";

const statusLabels: Record<string, string> = {
  available: "متاحة",
  reserved: "محجوزة",
  sold: "مباعة",
  draft: "مسودة",
};

function formatHandover(value?: number) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(value));
}

function UnitFact({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-[var(--workspace-muted)]">{label}</div>
          <div className="mt-2 text-lg font-black text-foreground">{value}</div>
        </div>
      </div>
      {helper ? <p className="mt-3 text-[13px] leading-6 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function DetailPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-5 shadow-sm lg:p-6">
      <div className="text-right">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * WHY:   Project-backed inventory needs a focused unit view that feels as polished as the project surface.
 * WHAT:  Renders one read-only unit detail page with Zayon-inspired hero, scorecards, technical facts, and action context.
 * HOW:   Receives server-mapped unit data only, using unit floor plans first and project media as a visual fallback.
 */
export default function UnitDetailPage({ unit }: { unit: WorkspaceProjectUnitDetail }) {
  const heroImage = unit.galleryImages[0]?.url ?? unit.projectImage;
  const gallery = unit.galleryImages.slice(0, 4);
  const statusLabel = statusLabels[unit.status ?? ""] ?? unit.status ?? "غير محدد";
  const scorecards = [
    { icon: WalletCards, label: "السعر", value: unit.priceLabel ?? "غير محدد", helper: unit.paymentPlanLabel ?? "لم يتم ربط خطة دفع مفصلة بعد." },
    { icon: Ruler, label: "المساحة", value: unit.area ?? "غير محدد", helper: "مساحة الوحدة الصافية أو مساحة النموذج حسب ملف المشروع." },
    { icon: BedDouble, label: "الغرف", value: typeof unit.bedrooms === "number" ? `${unit.bedrooms} غرف` : "غير محدد" },
    { icon: Bath, label: "الحمامات", value: typeof unit.bathrooms === "number" ? `${unit.bathrooms} حمامات` : "غير محدد" },
  ];
  const technicalFacts = [
    { icon: Building2, label: "المشروع", value: unit.projectTitle, helper: unit.projectLocation },
    { icon: Eye, label: "الإطلالة", value: unit.view ?? "غير محدد", helper: "تساعد فريق المبيعات على المقارنة بين الوحدات بسرعة." },
    { icon: Building2, label: "الدور", value: unit.floor ?? "غير محدد", helper: unit.unitKind === "unit_type" ? "هذه بطاقة نموذج وحدة وليست وحدة مفردة." : "وحدة مستقلة داخل مخزون المشروع." },
    { icon: CalendarClock, label: "التسليم", value: formatHandover(unit.handoverAt), helper: "موعد التسليم المتوقع حسب ملف الوحدة." },
    { icon: ShieldCheck, label: "الجاهزية", value: unit.readinessLabel, helper: unit.complianceLabel ?? "لا توجد ملفات امتثال مرتبطة ظاهرة حالياً." },
    { icon: FileText, label: "رخصة الإعلان", value: unit.adLicenseLabel ?? "غير محدد", helper: "تعكس حالة الرخصة على مستوى المشروع المرتبط." },
  ];

  return (
    <main className="min-h-full bg-background/60 pb-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/ws/projects/${unit.projectId}`}
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للمشروع
          </Link>
          <div className="flex flex-wrap justify-end gap-2">
            <span className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-3 py-1 text-[11px] font-bold text-foreground">
              {unit.unitKind === "unit_type" ? "نموذج وحدة" : "وحدة مستقلة"}
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              {statusLabel}
            </span>
          </div>
        </nav>

        <section className="overflow-hidden rounded-[30px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm">
          <div className="grid min-h-[460px] lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="relative min-h-[320px] overflow-hidden">
              <img src={heroImage} alt={unit.label} className="h-full min-h-[320px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-5 right-5 left-5 flex flex-wrap items-end justify-between gap-4 text-white">
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-[11px] font-bold backdrop-blur">
                    <MapPin className="h-3.5 w-3.5" />
                    {unit.projectLocation}
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight lg:text-5xl">{unit.label}</h1>
                </div>
              </div>
            </div>

            <aside className="flex flex-col justify-between gap-6 p-6 text-right lg:p-8">
              <div>
                <div className="text-[12px] font-black text-[var(--workspace-muted)]">بطاقة الوحدة</div>
                <h2 className="mt-2 text-2xl font-black text-foreground">{unit.projectTitle}</h2>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{unit.summary}</p>
              </div>

              <div className="grid gap-3">
                <Link
                  href="/ws/inbox"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-[13px] font-black text-background transition hover:bg-foreground/90"
                >
                  <MessageSquareMore className="h-4 w-4" />
                  فتح محادثة حول الوحدة
                </Link>
                <Link
                  href={`/ws/projects/${unit.projectId}/analytics`}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-[13px] font-black text-foreground transition hover:bg-[var(--workspace-accent-soft)]"
                >
                  <Eye className="h-4 w-4" />
                  قراءة أداء المشروع
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scorecards.map((fact) => (
            <UnitFact key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} helper={fact.helper} />
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <DetailPanel title="تفاصيل الوحدة الفنية" description="البيانات التي يحتاجها الخبير العقاري قبل المقارنة أو إرسال الوحدة.">
              <div className="grid gap-4 md:grid-cols-2">
                {technicalFacts.map((fact) => (
                  <UnitFact key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} helper={fact.helper} />
                ))}
              </div>
            </DetailPanel>

            <DetailPanel title="مخططات وصور الوحدة" description="يعرض مخطط الوحدة عند توفره، أو صور المشروع كمرجع بصري.">
              <div className="grid gap-3 md:grid-cols-2">
                {gallery.map((image) => (
                  <a
                    key={image.key}
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block overflow-hidden rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]"
                  >
                    <img src={image.url} alt={image.name} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                  </a>
                ))}
              </div>
            </DetailPanel>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <DetailPanel title="قراءة الخبير" description="ملخص سريع لما يجعل هذه الوحدة قابلة للبيع أو تحتاج استكمال.">
              <div className="space-y-3">
                <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                  <div className="mt-3 text-[14px] font-black text-foreground">جاهزية العرض</div>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {unit.priceLabel && unit.area
                      ? "الوحدة تحمل سعر ومساحة واضحين، ويمكن مقارنتها بسهولة داخل الفريق."
                      : "أضف السعر والمساحة لتحويل الوحدة إلى أصل أكثر جاهزية للتوزيع."}
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
                  <div className="text-[12px] font-bold text-[var(--workspace-muted)]">الدفع والامتثال</div>
                  <p className="mt-2 text-[14px] font-black text-foreground">{unit.paymentPlanLabel ?? "خطة الدفع غير مكتملة"}</p>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{unit.complianceLabel ?? "ملفات الامتثال ستظهر هنا عند ربطها بالمشروع."}</p>
                </div>
              </div>
            </DetailPanel>
          </aside>
        </div>
      </div>
    </main>
  );
}
