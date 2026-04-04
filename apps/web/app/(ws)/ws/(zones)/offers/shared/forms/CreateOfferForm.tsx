"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  FileText,
  Handshake,
  MessageCircle,
  Upload,
  UserRoundSearch,
  X,
} from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OfferAllowedAudience, OfferCaseType } from "@/server/contracts/offers";
import type { OrganizationSummary } from "@/server/contracts/organizations";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { OfferPropertyOption } from "../../types/offerTypes";
import { buildWhatsAppHref } from "../lib/offerViewModel";

type FormState = {
  propertyId: string;
  mode: OfferCaseType;
  title: string;
  description: string;
  price: string;
  allowedAudience: OfferAllowedAudience;
  commissionText: string;
  permitStatus: string;
  productStatus: string;
  recipientEmail: string;
  recipientPhone: string;
  clientName: string;
  clientPhone: string;
  clientBudget: string;
  clientBudgetMin: string;
  clientBudgetMax: string;
  clientLocation: string;
  clientArea: string;
  clientBedsMin: string;
  clientBathsMin: string;
  clientSqftMin: string;
  clientSqftMax: string;
  clientNeed: string;
};

type SubmitPayload = {
  propertyId?: string;
  mode: OfferCaseType;
  title: string;
  description: string;
  price: string;
  allowedAudience: OfferAllowedAudience;
  commissionText?: string;
  permitStatus?: string;
  productStatus?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  clientContext?: {
    clientName: string;
    clientPhone?: string;
    clientBudget?: string;
    clientNeed: string;
    budgetMin?: number;
    budgetMax?: number;
    location?: string;
    area?: string;
    bedsMin?: number;
    bathsMin?: number;
    sqftMin?: number;
    sqftMax?: number;
  };
  attachments: UploadedFileReference[];
};

type CreateOfferFormProps = {
  properties: OfferPropertyOption[];
  audience: WorkspaceAudience;
  organization?: OrganizationSummary | null;
  simplifiedFieldsOnly?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  submitLabel?: string;
  backHref?: string;
  settingsHref?: string;
  initialData?: Partial<FormState> & {
    attachments?: UploadedFileReference[];
  };
  onSubmit: (data: SubmitPayload) => Promise<{ redirectTo: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
};

function parseOptionalNumberInput(value: string) {
  const normalized = value.trim().replace(/[^\d.]/g, "");
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildInitialState(
  properties: OfferPropertyOption[],
  initialData?: CreateOfferFormProps["initialData"],
): FormState {
  const isClientRequestDraft = initialData?.mode === "collaboration_case";
  const defaultProperty = isClientRequestDraft
    ? (initialData?.propertyId ?? "")
    : (initialData?.propertyId ?? properties[0]?.id ?? "");
  const property = properties.find((item) => item.id === defaultProperty);

  return {
    propertyId: defaultProperty,
    mode: initialData?.mode === "collaboration_case" ? "collaboration_case" : "open_offer",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? property?.expectedPrice ?? "",
    allowedAudience: "brokers",
    commissionText: initialData?.commissionText ?? "",
    permitStatus: initialData?.permitStatus ?? "",
    productStatus: initialData?.productStatus ?? "",
    recipientEmail: initialData?.recipientEmail ?? "",
    recipientPhone: initialData?.recipientPhone ?? "",
    clientName: initialData?.clientName ?? "",
    clientPhone: initialData?.clientPhone ?? "",
    clientBudget: initialData?.clientBudget ?? "",
    clientBudgetMin: initialData?.clientBudgetMin ?? "",
    clientBudgetMax: initialData?.clientBudgetMax ?? "",
    clientLocation: initialData?.clientLocation ?? "",
    clientArea: initialData?.clientArea ?? "",
    clientBedsMin: initialData?.clientBedsMin ?? "",
    clientBathsMin: initialData?.clientBathsMin ?? "",
    clientSqftMin: initialData?.clientSqftMin ?? "",
    clientSqftMax: initialData?.clientSqftMax ?? "",
    clientNeed: initialData?.clientNeed ?? "",
  };
}

export function buildSubmitPayload(
  form: FormState,
  attachments: UploadedFileReference[],
  options?: { simplifiedFieldsOnly?: boolean; properties?: OfferPropertyOption[] },
): SubmitPayload {
  const selectedProperty = options?.properties?.find((item) => item.id === form.propertyId) ?? null;
  const isSimplified = options?.simplifiedFieldsOnly === true;
  const effectiveMode: OfferCaseType = isSimplified
    ? form.mode === "collaboration_case"
      ? "collaboration_case"
      : "open_offer"
    : form.mode;
  const isClientRequirement = effectiveMode === "collaboration_case";
  const isTargetedBrokerShare = effectiveMode === "open_offer";
  const trimmedDescription = form.description.trim();
  const trimmedLocation = form.clientLocation.trim();
  const combinedClientNeed =
    trimmedLocation.length > 0 ? `${trimmedDescription}\nالموقع المطلوب: ${trimmedLocation}` : trimmedDescription;
  const budgetMin = parseOptionalNumberInput(form.clientBudgetMin);
  const budgetMax =
    parseOptionalNumberInput(form.clientBudgetMax) ??
    (isClientRequirement ? parseOptionalNumberInput(form.price) : undefined);
  const bedsMin = parseOptionalNumberInput(form.clientBedsMin);
  const bathsMin = parseOptionalNumberInput(form.clientBathsMin);
  const sqftMin = parseOptionalNumberInput(form.clientSqftMin);
  const sqftMax = parseOptionalNumberInput(form.clientSqftMax);
  const area = form.clientArea.trim() || undefined;

  return {
    propertyId: effectiveMode === "collaboration_case" ? undefined : form.propertyId || undefined,
    mode: effectiveMode,
    title: isSimplified ? selectedProperty?.title ?? form.title.trim() : form.title.trim(),
    description: form.description.trim(),
    price: form.price,
    allowedAudience: "brokers",
    commissionText: isClientRequirement || isSimplified ? undefined : form.commissionText.trim() || undefined,
    permitStatus: isClientRequirement || isSimplified ? undefined : form.permitStatus.trim() || undefined,
    productStatus: isClientRequirement || isSimplified ? undefined : form.productStatus.trim() || undefined,
    recipientEmail: isTargetedBrokerShare && !isSimplified ? form.recipientEmail.trim() || undefined : undefined,
    recipientPhone: isTargetedBrokerShare && !isSimplified ? form.recipientPhone.trim() || undefined : undefined,
    clientContext:
      effectiveMode === "collaboration_case"
        ? {
            clientName: isSimplified ? form.title.trim() : form.clientName.trim(),
            clientPhone: form.clientPhone.trim() || undefined,
            clientBudget: isSimplified ? form.price.trim() || undefined : form.clientBudget.trim() || undefined,
            clientNeed: isSimplified ? combinedClientNeed : form.clientNeed.trim(),
            budgetMin,
            budgetMax,
            location: trimmedLocation || undefined,
            area,
            bedsMin,
            bathsMin,
            sqftMin,
            sqftMax,
          }
        : undefined,
    attachments,
  };
}

export default function CreateOfferForm({
  properties,
  audience,
  organization,
  simplifiedFieldsOnly = false,
  pageTitle,
  pageDescription,
  submitLabel,
  backHref = "/ws/offers",
  settingsHref = "/ws/settings?tab=org",
  initialData,
  onSubmit,
  onArchive,
}: CreateOfferFormProps) {
  const { locale, isRtl } = useWebLocale();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>(() => buildInitialState(properties, initialData));
  const [attachments, setAttachments] = useState<UploadedFileReference[]>(initialData?.attachments ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isArchivePending, startArchiveTransition] = useTransition();
  const { startUpload, isUploading } = useUploadThing("offerAttachments");

  const whatsappHref = buildWhatsAppHref(organization?.phone);
  const isBrokerAudience = audience === "broker";
  const isDeveloperAudience = audience === "developer";
  const effectiveMode: OfferCaseType = simplifiedFieldsOnly
    ? form.mode === "collaboration_case"
      ? "collaboration_case"
      : "open_offer"
    : form.mode;
  const isClientRequestMode = isBrokerAudience && effectiveMode === "collaboration_case";
  const requiresPropertySelection = !isClientRequestMode;
  const canTargetSpecificParty = isBrokerAudience && !isClientRequestMode && !simplifiedFieldsOnly;

  const copy = {
    pageTitle:
      pageTitle ??
      (locale === "en" ? "Create organization offer" : "إنشاء عرض باسم المنظمة"),
    pageDescription:
      pageDescription ??
      (locale === "en"
        ? "Choose the offer path that matches your organization workflow, then publish it under the organization."
        : "اختر مسار العرض المناسب لطريقة عمل منظمتك، ثم انشره باسم المنظمة وليس باسم الحساب الفردي."),
    back: locale === "en" ? "Back" : "العودة",
    saveFailed: locale === "en" ? "Could not save the offer." : "تعذر حفظ العرض.",
    uploadFailed: locale === "en" ? "Could not upload files." : "تعذر رفع الملفات.",
    property: locale === "en" ? "Property" : "العقار",
    title: locale === "en" ? "Offer title" : "العنوان",
    propertyTitlePlaceholder:
      locale === "en" ? "Example: Ready apartment for broker network" : "مثال: شقة جاهزة للمشاركة مع شبكة الوسطاء",
    clientTitlePlaceholder:
      locale === "en" ? "Example: Looking for 3-bedroom apartment in New Cairo" : "مثال: أبحث عن شقة 3 غرف في التجمع الخامس",
    value: locale === "en" ? "Value / budget" : "القيمة / الميزانية",
    description: locale === "en" ? "Offer description" : "وصف العرض",
    descriptionPlaceholder:
      locale === "en"
        ? "Explain the property, the target buyer, and how cooperation will work."
        : "اشرح العقار، العميل المناسب، وكيف سيتم التعاون أو التقسيم.",
    clientDescriptionPlaceholder:
      locale === "en"
        ? "Explain the client requirements, location, budget, and what you need from other brokers."
        : "اشرح متطلبات العميل، المنطقة، الميزانية، وما الذي تحتاجه من الوسطاء الآخرين.",
    commission: locale === "en" ? "Commission / split" : "العمولة / نسبة التقسيم",
    commissionPlaceholder: locale === "en" ? "Example: 2.5% + bonus" : "مثال: 2.5% + مكافأة",
    permitStatus: locale === "en" ? "Permit status" : "حالة التصريح",
    permitPlaceholder: locale === "en" ? "Example: Ready to share" : "مثال: جاهز للمشاركة",
    productStatus: locale === "en" ? "Availability status" : "حالة الإتاحة",
    productPlaceholder: locale === "en" ? "Example: Ready to close" : "مثال: جاهز للإغلاق",
    noProperties:
      locale === "en"
        ? "You need at least one property in your organization before creating a property offer."
        : "تحتاج إلى عقار واحد على الأقل داخل المنظمة قبل إنشاء عرض عقار.",
    propertyCard: locale === "en" ? "Selected property" : "العقار المختار",
    noExtraDescription: locale === "en" ? "No extra description." : "بدون وصف إضافي.",
    recipientEmail: locale === "en" ? "Other broker organization email" : "بريد منظمة الوسيط الأخرى",
    recipientPhone: locale === "en" ? "Other broker organization phone" : "هاتف منظمة الوسيط الأخرى",
    clientFile: locale === "en" ? "Client requirement" : "طلب العميل",
    clientName: locale === "en" ? "Client name" : "اسم العميل",
    clientPhone: locale === "en" ? "Client phone" : "هاتف العميل",
    clientBudget: locale === "en" ? "Client budget" : "ميزانية العميل",
    clientBudgetMin: locale === "en" ? "Budget from" : "الميزانية من",
    clientBudgetMax: locale === "en" ? "Budget to" : "الميزانية إلى",
    clientLocation: locale === "en" ? "Preferred location" : "الموقع المطلوب",
    clientArea: locale === "en" ? "Preferred area" : "المنطقة المطلوبة",
    clientBedsMin: locale === "en" ? "Minimum rooms" : "الحد الأدنى للغرف",
    clientBathsMin: locale === "en" ? "Minimum bathrooms" : "الحد الأدنى للحمامات",
    clientSqftMin: locale === "en" ? "Space from" : "المساحة من",
    clientSqftMax: locale === "en" ? "Space to" : "المساحة إلى",
    clientNeed: locale === "en" ? "Client need" : "احتياج العميل",
    uploadAttachments: locale === "en" ? "Upload attachments" : "رفع المرفقات",
    uploadingFiles: locale === "en" ? "Uploading files" : "جارٍ رفع الملفات",
    archive: locale === "en" ? "Archive draft" : "أرشفة المسودة",
    archiving: locale === "en" ? "Archiving..." : "جارٍ الأرشفة",
    saving: locale === "en" ? "Saving..." : "جارٍ الحفظ",
    submit: submitLabel ?? (locale === "en" ? "Save and continue" : "حفظ ومتابعة"),
  };

  const modeCards: Array<{
    value: OfferCaseType;
    label: string;
    description: string;
    icon: typeof Building2;
  }> = isDeveloperAudience
    ? [
        {
          value: "open_offer",
          label: locale === "en" ? "Create property offer" : "إنشاء عرض عقار",
          description:
            locale === "en"
              ? "Developers publish one property offer from the organization to the broker marketplace."
              : "المطور ينشر عرض عقار واحد من المنظمة إلى سوق الوسطاء.",
          icon: Building2,
        },
      ]
    : [
        {
          value: "open_offer",
          label: locale === "en" ? "Share property" : "مشاركة عقار",
          description:
            locale === "en"
              ? "You already have a property and want other brokers to bring a buyer or split the deal."
              : "لديك عقار وتريد من وسطاء آخرين جلب العميل أو مشاركة الصفقة.",
          icon: BriefcaseBusiness,
        },
        {
          value: "collaboration_case",
          label: locale === "en" ? "Client requirement" : "طلب عميل",
          description:
            locale === "en"
              ? "You have a client need and want other brokers to match it, without selecting a property now."
              : "لديك احتياج عميل وتريد من وسطاء آخرين مطابقته، بدون اختيار عقار الآن.",
          icon: Handshake,
        },
      ];

  const showModeSelection = !simplifiedFieldsOnly && modeCards.length > 1;
  const selectedProperty = properties.find((property) => property.id === form.propertyId) ?? null;

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    try {
      const uploaded = await startUpload(files);
      const nextAttachments = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setAttachments((current) => [...current, ...nextAttachments]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : copy.uploadFailed);
    } finally {
      event.target.value = "";
    }
  }

  function updateMode(nextMode: OfferCaseType) {
    setForm((current) => {
      const fallbackPropertyId = current.propertyId || properties[0]?.id || "";
      return {
        ...current,
        mode: nextMode,
        propertyId: nextMode === "collaboration_case" ? "" : fallbackPropertyId,
        recipientEmail: nextMode === "collaboration_case" ? "" : current.recipientEmail,
        recipientPhone: nextMode === "collaboration_case" ? "" : current.recipientPhone,
        allowedAudience: "brokers",
      };
    });
  }

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground">{copy.pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-muted-foreground">{copy.pageDescription}</p>
          </div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
        </header>

        {organization ? (
          <section className="rounded-[20px] border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  المنظمة المالكة للعرض
                </div>
                <div className="mt-1 text-xl font-black text-foreground">{organization.name}</div>
                <div className="mt-1 text-[13px] text-muted-foreground">
                  {organization.type === "red" ? "مطور" : "وسيط"}
                  {organization.phone ? ` • ${organization.phone}` : ""}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" />
                    واتساب
                  </a>
                ) : null}
                <Link
                  href={settingsHref}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted"
                >
                  إعدادات المنظمة
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            startTransition(async () => {
              try {
                const result = await onSubmit(
                  buildSubmitPayload(form, attachments, {
                    simplifiedFieldsOnly,
                    properties,
                  }),
                );
                router.push(result.redirectTo);
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : copy.saveFailed);
              }
            });
          }}
        >
          {!simplifiedFieldsOnly ? (
            <section className="rounded-[20px] border border-border/60 bg-card p-5 shadow-sm">
              <div className={`text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                1. نوع العرض
              </div>

              {showModeSelection ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {modeCards.map((card) => {
                      const Icon = card.icon;
                      const isActive = effectiveMode === card.value;
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => updateMode(card.value)}
                          className={isActive
                            ? "inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-bold text-background"
                            : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-bold text-foreground"}
                        >
                          <Icon className="h-4 w-4" />
                          {card.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className={`mt-3 text-[13px] leading-6 text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                    {modeCards.find((card) => card.value === effectiveMode)?.description}
                  </p>
                </>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-4">
                  <Building2 className="mt-0.5 h-5 w-5 text-foreground" />
                  <div className={isRtl ? "text-right" : "text-left"}>
                    <div className="text-[14px] font-bold text-foreground">{modeCards[0]?.label}</div>
                    <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{modeCards[0]?.description}</div>
                  </div>
                </div>
              )}
            </section>
          ) : isBrokerAudience ? (
            <section className="rounded-[20px] border border-border/60 bg-card p-5 shadow-sm">
              <div className={`text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                1. نوع الطلب
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {modeCards.map((card) => {
                  const Icon = card.icon;
                  const isActive = effectiveMode === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => updateMode(card.value)}
                      className={isActive
                        ? "inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-bold text-background"
                        : "inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-[13px] font-bold text-foreground"}
                    >
                      <Icon className="h-4 w-4" />
                      {card.label}
                    </button>
                  );
                })}
              </div>
              <p className={`mt-3 text-[13px] leading-6 text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
                {modeCards.find((card) => card.value === effectiveMode)?.description}
              </p>
            </section>
          ) : null}

          <section className="rounded-[20px] border border-border/60 bg-card p-5 shadow-sm">
            <div className={`text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}>
              {simplifiedFieldsOnly
                ? `${isBrokerAudience ? "2" : "1"}. التفاصيل الأساسية`
                : `2. ${isClientRequestMode ? "بيانات طلب العميل" : "بيانات عرض العقار"}`}
            </div>

            <div className="mt-4 grid gap-5">
              {requiresPropertySelection ? (
                properties.length > 0 ? (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.property}
                    </label>
                    <select
                      value={form.propertyId}
                      onChange={(event) => {
                        const propertyId = event.target.value;
                        const property = properties.find((item) => item.id === propertyId);
                        setForm((current) => ({
                          ...current,
                          propertyId,
                          price: property?.expectedPrice ?? current.price,
                        }));
                      }}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    >
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title} - {property.location}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-4 text-[13px] leading-6 text-muted-foreground">
                    {copy.noProperties}
                  </div>
                )
              ) : null}

              {!simplifiedFieldsOnly || isClientRequestMode ? (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {copy.title}
                  </label>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={
                      isClientRequestMode
                          ? copy.clientTitlePlaceholder
                          : copy.propertyTitlePlaceholder
                    }
                  />
                </div>
              ) : null}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {copy.value}
                </label>
                <input
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                  placeholder={isClientRequestMode ? "مثال: 5,000,000" : undefined}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {isClientRequestMode ? copy.clientNeed : copy.description}
                </label>
                <textarea
                  rows={isClientRequestMode ? 5 : 6}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] leading-7 text-foreground"
                  placeholder={isClientRequestMode ? copy.clientDescriptionPlaceholder : copy.descriptionPlaceholder}
                />
              </div>

              {!isClientRequestMode && !simplifiedFieldsOnly ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.commission}
                    </label>
                    <input
                      value={form.commissionText}
                      onChange={(event) => setForm((current) => ({ ...current, commissionText: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.commissionPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.permitStatus}
                    </label>
                    <input
                      value={form.permitStatus}
                      onChange={(event) => setForm((current) => ({ ...current, permitStatus: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.permitPlaceholder}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.productStatus}
                    </label>
                    <input
                      value={form.productStatus}
                      onChange={(event) => setForm((current) => ({ ...current, productStatus: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.productPlaceholder}
                    />
                  </div>
                </>
              ) : null}

              {simplifiedFieldsOnly && isClientRequestMode ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientBudgetMin}
                    </label>
                    <input
                      value={form.clientBudgetMin}
                      onChange={(event) => setForm((current) => ({ ...current, clientBudgetMin: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientBudgetMin}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientBudgetMax}
                    </label>
                    <input
                      value={form.clientBudgetMax}
                      onChange={(event) => setForm((current) => ({ ...current, clientBudgetMax: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientBudgetMax}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientLocation}
                    </label>
                    <input
                      value={form.clientLocation}
                      onChange={(event) => setForm((current) => ({ ...current, clientLocation: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientLocation}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientArea}
                    </label>
                    <input
                      value={form.clientArea}
                      onChange={(event) => setForm((current) => ({ ...current, clientArea: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientArea}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientBedsMin}
                    </label>
                    <input
                      value={form.clientBedsMin}
                      onChange={(event) => setForm((current) => ({ ...current, clientBedsMin: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientBedsMin}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientBathsMin}
                    </label>
                    <input
                      value={form.clientBathsMin}
                      onChange={(event) => setForm((current) => ({ ...current, clientBathsMin: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientBathsMin}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientSqftMin}
                    </label>
                    <input
                      value={form.clientSqftMin}
                      onChange={(event) => setForm((current) => ({ ...current, clientSqftMin: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientSqftMin}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      {copy.clientSqftMax}
                    </label>
                    <input
                      value={form.clientSqftMax}
                      onChange={(event) => setForm((current) => ({ ...current, clientSqftMax: event.target.value }))}
                      className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientSqftMax}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[20px] border border-border/60 bg-card p-5 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {simplifiedFieldsOnly
                ? `${isBrokerAudience ? "3" : "2"}. المعاينة والمرفقات`
                : `3. ${isClientRequestMode ? "التواصل والمرفقات" : "المعاينة والتواصل"}`}
            </div>

            {requiresPropertySelection && selectedProperty && !simplifiedFieldsOnly ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background p-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {copy.propertyCard}
                </div>
                <div className="overflow-hidden rounded-[18px] bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedProperty.image} alt={selectedProperty.title} className="h-48 w-full object-cover" />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <div className="text-lg font-black text-foreground">{selectedProperty.title}</div>
                  <div className="mt-1 text-[13px] text-muted-foreground">{selectedProperty.location}</div>
                  <div className="mt-2 text-[13px] leading-6 text-foreground">
                    {selectedProperty.shortDescription ?? copy.noExtraDescription}
                  </div>
                </div>
              </div>
            ) : null}

            {canTargetSpecificParty ? (
              <div className="mt-5 border-t border-border/60 pt-5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  <UserRoundSearch className="h-4 w-4" />
                  إرسال مباشر إلى منظمة وسيط أخرى
                </div>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  اترك هذه الحقول فارغة إذا كان العرض موجهاً إلى سوق الوسطاء بشكل عام.
                </p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={form.recipientEmail}
                    onChange={(event) => setForm((current) => ({ ...current, recipientEmail: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.recipientEmail}
                  />
                  <input
                    value={form.recipientPhone}
                    onChange={(event) => setForm((current) => ({ ...current, recipientPhone: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.recipientPhone}
                  />
                </div>
              </div>
            ) : null}

            {isClientRequestMode && !simplifiedFieldsOnly ? (
              <div className="mt-5 border-t border-border/60 pt-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {copy.clientFile}
                </div>
                <div className="mt-4 grid gap-3">
                  <input
                    value={form.clientName}
                    onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.clientName}
                  />
                  <input
                    value={form.clientPhone}
                    onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.clientPhone}
                  />
                  <input
                    value={form.clientBudget}
                    onChange={(event) => setForm((current) => ({ ...current, clientBudget: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.clientBudget}
                  />
                  <textarea
                    rows={4}
                    value={form.clientNeed}
                    onChange={(event) => setForm((current) => ({ ...current, clientNeed: event.target.value }))}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] leading-7 text-foreground"
                    placeholder={copy.clientNeed}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-5 border-t border-border/60 pt-5">
              {!simplifiedFieldsOnly ? (
                <div className="mb-4 rounded-2xl border border-border bg-background px-4 py-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    سينشر باسم
                  </div>
                  <div className="mt-2 text-[15px] font-bold text-foreground">
                    {organization?.name ?? "المنظمة الحالية"}
                  </div>
                  <div className="mt-1 text-[13px] text-muted-foreground">
                    هذا العرض يتبع المنظمة وليس الحساب الفردي.
                  </div>
                </div>
              ) : null}

              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-[13px] font-bold text-foreground transition hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? copy.uploadingFiles : copy.uploadAttachments}
              </button>

              {attachments.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.key}
                      className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                        <FileText className="h-4 w-4" />
                        {attachment.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments((current) => current.filter((item) => item.key !== attachment.key))}
                        className="rounded-full border border-border p-1 text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {onArchive ? (
              <button
                type="button"
                onClick={() =>
                  startArchiveTransition(async () => {
                    const result = await onArchive();
                    router.push(result.redirectTo);
                  })
                }
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700 transition hover:bg-rose-100"
              >
                {isArchivePending ? copy.archiving : copy.archive}
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isPending || isUploading || (requiresPropertySelection && properties.length === 0)}
              className="rounded-2xl bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-50"
            >
              {isPending ? copy.saving : copy.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
