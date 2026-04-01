"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Building2, FileText, Handshake, Upload, UserRoundSearch, X } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OfferAllowedAudience, OfferCaseType } from "@/server/contracts/offers";
import type { OfferPropertyOption } from "./offerTypes";

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
  clientNeed: string;
};

type SubmitPayload = {
  propertyId: string;
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
  };
  attachments: UploadedFileReference[];
};

type CreateOfferFormProps = {
  properties: OfferPropertyOption[];
  pageTitle?: string;
  pageDescription?: string;
  submitLabel?: string;
  backHref?: string;
  initialData?: Partial<FormState> & {
    attachments?: UploadedFileReference[];
  };
  onSubmit: (data: SubmitPayload) => Promise<{ redirectTo: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
};

function buildInitialState(
  properties: OfferPropertyOption[],
  initialData?: CreateOfferFormProps["initialData"],
): FormState {
  const defaultProperty = initialData?.propertyId ?? properties[0]?.id ?? "";
  const property = properties.find((item) => item.id === defaultProperty);
  return {
    propertyId: defaultProperty,
    mode: initialData?.mode ?? "open_offer",
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? property?.expectedPrice ?? "",
    allowedAudience: initialData?.allowedAudience ?? "both",
    commissionText: initialData?.commissionText ?? "",
    permitStatus: initialData?.permitStatus ?? "",
    productStatus: initialData?.productStatus ?? "",
    recipientEmail: initialData?.recipientEmail ?? "",
    recipientPhone: initialData?.recipientPhone ?? "",
    clientName: initialData?.clientName ?? "",
    clientPhone: initialData?.clientPhone ?? "",
    clientBudget: initialData?.clientBudget ?? "",
    clientNeed: initialData?.clientNeed ?? "",
  };
}

function buildSubmitPayload(form: FormState, attachments: UploadedFileReference[]): SubmitPayload {
  return {
    propertyId: form.propertyId,
    mode: form.mode,
    title: form.title.trim(),
    description: form.description.trim(),
    price: form.price,
    allowedAudience: form.allowedAudience,
    commissionText: form.commissionText.trim() || undefined,
    permitStatus: form.permitStatus.trim() || undefined,
    productStatus: form.productStatus.trim() || undefined,
    recipientEmail: form.mode === "open_offer" ? undefined : form.recipientEmail.trim() || undefined,
    recipientPhone: form.mode === "open_offer" ? undefined : form.recipientPhone.trim() || undefined,
    clientContext:
      form.mode === "collaboration_case"
        ? {
            clientName: form.clientName.trim(),
            clientPhone: form.clientPhone.trim() || undefined,
            clientBudget: form.clientBudget.trim() || undefined,
            clientNeed: form.clientNeed.trim(),
          }
        : undefined,
    attachments,
  };
}

export default function CreateOfferForm({
  properties,
  pageTitle,
  pageDescription,
  submitLabel,
  backHref = "/ws/offers",
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

  const copy = {
    brand: locale === "fr" ? "Offres 2.0" : locale === "en" ? "Offers 2.0" : "العروض 2.0",
    pageTitle: pageTitle ?? (locale === "fr" ? "Créer un nouveau cas d'offre" : locale === "en" ? "Create a new offer case" : "إنشاء حالة عروض جديدة"),
    pageDescription: pageDescription ?? (locale === "fr" ? "Commencez par l'actif immobilier puis construisez le package, la relation et la collaboration souhaitée." : locale === "en" ? "Start from the property asset, then build the package, relationship, and collaboration you need." : "ابدأ من الأصل العقاري ثم ابنِ فوقه الحزمة والعلاقة والتعاون المطلوب."),
    back: locale === "fr" ? "Retour" : locale === "en" ? "Back" : "العودة",
    saveFailed: locale === "fr" ? "Impossible d'enregistrer le cas." : locale === "en" ? "Could not save the case." : "تعذر حفظ الحالة.",
    uploadFailed: locale === "fr" ? "Impossible de téléverser les fichiers." : locale === "en" ? "Could not upload the files." : "تعذر رفع الملفات.",
    property: locale === "fr" ? "Actif immobilier" : locale === "en" ? "Property asset" : "الأصل العقاري",
    caseTitle: locale === "fr" ? "Titre du cas" : locale === "en" ? "Case title" : "عنوان الحالة",
    caseTitlePlaceholder: locale === "fr" ? "Exemple : Pack de partage rapide pour un projet" : locale === "en" ? "Example: Fast sharing package for a project" : "مثال: حزمة مشاركة سريعة لمشروع كذا",
    offeredValue: locale === "fr" ? "Valeur proposée" : locale === "en" ? "Offered value" : "القيمة المطروحة",
    practicalDescription: locale === "fr" ? "Description pratique" : locale === "en" ? "Practical description" : "الوصف العملي",
    practicalDescriptionPlaceholder: locale === "fr" ? "Quel est le besoin ? Qu'est-ce qui rend ce package utile ? Et quelles sont les conditions de collaboration ?" : locale === "en" ? "What is needed? What makes this package useful? And what are the collaboration terms?" : "ما المطلوب؟ ما الذي يجعل هذه الحزمة مفيدة؟ وما شروط التعاون؟",
    commission: locale === "fr" ? "Commission / part" : locale === "en" ? "Commission / share" : "العمولة / الحصة",
    commissionPlaceholder: locale === "fr" ? "Exemple : 2.5% + bonus" : locale === "en" ? "Example: 2.5% + bonus" : "مثال: 2.5% + مكافأة",
    permitStatus: locale === "fr" ? "Statut du permis" : locale === "en" ? "Permit status" : "حالة التصريح",
    permitPlaceholder: locale === "fr" ? "Exemple : Prêt à partager" : locale === "en" ? "Example: Ready to share" : "مثال: جاهز للمشاركة",
    productStatus: locale === "fr" ? "Statut du produit" : locale === "en" ? "Product status" : "حالة المنتج",
    productPlaceholder: locale === "fr" ? "Exemple : Prêt à conclure" : locale === "en" ? "Example: Ready to close" : "مثال: جاهز للإغلاق",
    allowedAudience: locale === "fr" ? "Audience autorisée" : locale === "en" ? "Allowed audience" : "الجمهور المسموح",
    propertyCard: locale === "fr" ? "Fiche de l'actif" : locale === "en" ? "Asset card" : "بطاقة الأصل",
    noExtraDescription: locale === "fr" ? "Aucune description supplémentaire." : locale === "en" ? "No extra description." : "بدون وصف إضافي.",
    targetParty: locale === "fr" ? "Partie ciblée" : locale === "en" ? "Target party" : "الطرف المستهدف",
    recipientEmail: locale === "fr" ? "E-mail de la partie ciblée" : locale === "en" ? "Target party email" : "البريد الإلكتروني للطرف المستهدف",
    recipientPhone: locale === "fr" ? "Téléphone de la partie ciblée" : locale === "en" ? "Target party phone number" : "رقم الهاتف للطرف المستهدف",
    clientFile: locale === "fr" ? "Dossier client" : locale === "en" ? "Client file" : "ملف العميل",
    clientName: locale === "fr" ? "Nom du client" : locale === "en" ? "Client name" : "اسم العميل",
    clientPhone: locale === "fr" ? "Téléphone du client" : locale === "en" ? "Client phone" : "هاتف العميل",
    clientBudget: locale === "fr" ? "Budget du client" : locale === "en" ? "Client budget" : "ميزانية العميل",
    clientNeed: locale === "fr" ? "Quel est le besoin réel du client ?" : locale === "en" ? "What is the client's actual need?" : "ما الاحتياج الفعلي للعميل؟",
    uploadAttachments: locale === "fr" ? "Téléverser les pièces jointes" : locale === "en" ? "Upload attachments" : "رفع المرفقات",
    uploadingFiles: locale === "fr" ? "Téléversement des fichiers" : locale === "en" ? "Uploading files" : "جارٍ رفع الملفات",
    archive: locale === "fr" ? "Archiver le cas" : locale === "en" ? "Archive case" : "أرشفة الحالة",
    archiving: locale === "fr" ? "Archivage..." : locale === "en" ? "Archiving..." : "جارٍ الأرشفة",
    saving: locale === "fr" ? "Enregistrement..." : locale === "en" ? "Saving..." : "جارٍ الحفظ",
    submit: submitLabel ?? (locale === "fr" ? "Enregistrer et continuer" : locale === "en" ? "Save and continue" : "حفظ ومتابعة"),
  };

  const modeCards: Array<{
    value: OfferCaseType;
    label: string;
    description: string;
    icon: typeof Building2;
  }> = [
    {
      value: "open_offer",
      label: locale === "fr" ? "Offre ouverte" : locale === "en" ? "Open offer" : "عرض مفتوح",
      description: locale === "fr" ? "Stock disponible pour le réseau selon l'audience visée." : locale === "en" ? "Inventory available to the network based on the chosen audience." : "مخزون متاح للشبكة حسب جمهور العرض.",
      icon: Building2,
    },
    {
      value: "private_offer",
      label: locale === "fr" ? "Partage privé" : locale === "en" ? "Private share" : "مشاركة خاصة",
      description: locale === "fr" ? "Partager l'inventaire directement avec une partie précise." : locale === "en" ? "Share inventory directly with a specific party." : "مشاركة مخزون مع طرف محدد مباشرة.",
      icon: BriefcaseBusiness,
    },
    {
      value: "collaboration_case",
      label: locale === "fr" ? "Cas de collaboration" : locale === "en" ? "Collaboration case" : "حالة تعاون",
      description: locale === "fr" ? "Client réel + besoin clair + partenaire d'exécution ciblé." : locale === "en" ? "Real client + clear need + targeted execution partner." : "عميل حقيقي + احتياج واضح + طرف تنفيذي مستهدف.",
      icon: Handshake,
    },
  ];

  const audienceOptions: Array<{ value: OfferAllowedAudience; label: string }> = [
    { value: "both", label: locale === "fr" ? "Courtiers et promoteurs" : locale === "en" ? "Brokers and developers" : "وسطاء ومطورون" },
    { value: "brokers", label: locale === "fr" ? "Courtiers seulement" : locale === "en" ? "Brokers only" : "وسطاء فقط" },
    { value: "developers", label: locale === "fr" ? "Promoteurs seulement" : locale === "en" ? "Developers only" : "مطوّرون فقط" },
  ];

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

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.brand}</div>
            <h1 className="mt-2 text-3xl font-black text-foreground">{copy.pageTitle}</h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">{copy.pageDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </button>
        </header>

        <form
          className="grid gap-8"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            startTransition(async () => {
              try {
                const result = await onSubmit(buildSubmitPayload(form, attachments));
                router.push(result.redirectTo);
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : copy.saveFailed);
              }
            });
          }}
        >
          <section className="grid gap-4 lg:grid-cols-3">
            {modeCards.map((card) => {
              const Icon = card.icon;
              const isActive = form.mode === card.value;
              return (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, mode: card.value }))}
                  className={isActive
                    ? `rounded-3xl border border-foreground bg-foreground p-5 ${isRtl ? "text-right" : "text-left"} text-background shadow-sm`
                    : `rounded-3xl border border-border bg-card p-5 ${isRtl ? "text-right" : "text-left"} text-foreground shadow-sm`}
                >
                  <Icon className="h-6 w-6" />
                  <div className="mt-4 text-lg font-black">{card.label}</div>
                  <div className={isActive ? "mt-2 text-[13px] leading-6 text-background/80" : "mt-2 text-[13px] leading-6 text-muted-foreground"}>
                    {card.description}
                  </div>
                </button>
              );
            })}
          </section>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.property}</label>
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

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.caseTitle}</label>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.caseTitlePlaceholder}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.offeredValue}</label>
                  <input
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.practicalDescription}</label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] leading-7 text-foreground"
                  placeholder={copy.practicalDescriptionPlaceholder}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.commission}</label>
                  <input
                    value={form.commissionText}
                    onChange={(event) => setForm((current) => ({ ...current, commissionText: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.commissionPlaceholder}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.permitStatus}</label>
                  <input
                    value={form.permitStatus}
                    onChange={(event) => setForm((current) => ({ ...current, permitStatus: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.permitPlaceholder}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.productStatus}</label>
                  <input
                    value={form.productStatus}
                    onChange={(event) => setForm((current) => ({ ...current, productStatus: event.target.value }))}
                    className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-[14px] font-bold text-foreground"
                    placeholder={copy.productPlaceholder}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.allowedAudience}</label>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {audienceOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, allowedAudience: option.value }))}
                      className={form.allowedAudience === option.value
                        ? "rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background"
                        : "rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground"}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{copy.propertyCard}</div>
                {selectedProperty ? (
                  <div className="mt-4 overflow-hidden rounded-3xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedProperty.image} alt={selectedProperty.title} className="h-52 w-full object-cover" />
                    <div className="grid gap-2 p-4">
                      <div className="text-lg font-black text-foreground">{selectedProperty.title}</div>
                      <div className="text-[13px] text-muted-foreground">{selectedProperty.location}</div>
                      <div className="text-[13px] font-bold text-foreground">{selectedProperty.shortDescription ?? copy.noExtraDescription}</div>
                    </div>
                  </div>
                ) : null}
              </div>

              {form.mode !== "open_offer" ? (
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    <UserRoundSearch className="h-4 w-4" />
                    {copy.targetParty}
                  </div>
                  <div className="mt-4 grid gap-4">
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

              {form.mode === "collaboration_case" ? (
                <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-6 shadow-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">{copy.clientFile}</div>
                  <div className="mt-4 grid gap-4">
                    <input
                      value={form.clientName}
                      onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                      className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientName}
                    />
                    <input
                      value={form.clientPhone}
                      onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))}
                      className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientPhone}
                    />
                    <input
                      value={form.clientBudget}
                      onChange={(event) => setForm((current) => ({ ...current, clientBudget: event.target.value }))}
                      className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-[14px] font-bold text-foreground"
                      placeholder={copy.clientBudget}
                    />
                    <textarea
                      rows={4}
                      value={form.clientNeed}
                      onChange={(event) => setForm((current) => ({ ...current, clientNeed: event.target.value }))}
                      className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-[14px] leading-7 text-foreground"
                      placeholder={copy.clientNeed}
                    />
                  </div>
                </div>
              ) : null}

              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-[13px] font-bold text-foreground transition hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? copy.uploadingFiles : copy.uploadAttachments}
                </button>
                {attachments.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
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
          </div>

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
            ) : <span />}
            <button
              type="submit"
              disabled={isPending || isUploading}
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
