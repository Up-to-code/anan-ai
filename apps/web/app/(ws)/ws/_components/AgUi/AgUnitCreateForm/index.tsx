"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Eye,
  FileText,
  Hash,
  ImagePlus,
  Layers,
  MapPin,
  Ruler,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { UnitCreateActionResult, UnitCreateFormData } from "@/app/(ws)/ws/(zones)/projects/shared/forms/unitFormSubmission";
import { LocationPicker } from "@anan/location-map/react";
import type { LocationValue } from "@anan/location-map";
import ZonePageIntro from "../../ZoneShell/ZonePageIntro";
import { FieldLabel, FileRow, ReviewRow, SectionCard, SelectInput, TextArea, TextInput, UploadTile } from "../AgPropertyForm/controls";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { uploadedFileReferenceSchema } from "@/server/contracts/files";
import {
  CreationFlowActions,
  CreationFlowProgress,
  expertStaggerContainer as staggerContainer,
  expertStaggerItem as staggerItem,
  expertStepVariants as stepVariants,
} from "../AgCreationFlow";

type UnitCreateFormProps = {
  mode?: "standalone" | "project_child";
  initialData?: Partial<UnitCreateFormData>;
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  onSave: (data: UnitCreateFormData) => Promise<UnitCreateActionResult>;
  onCancel?: () => void;
};

const TOTAL_STEPS = 5;
const UNIT_STEPS = [
  { key: "identity", title: "هوية الوحدة", summary: "اسم الوحدة وموقعها ونوعها وحالة العرض" },
  { key: "space", title: "المساحة والمواصفات", summary: "المساحة والغرف والدور والإطلالة والتسليم" },
  { key: "pricing", title: "السعر والمقارنة", summary: "السعر وخطة الدفع وموقع الوحدة من السوق" },
  { key: "services", title: "الخدمات والجاهزية", summary: "الخدمات والميديا والرخصة والملفات الخاصة" },
  { key: "review", title: "مراجعة الخبير", summary: "ملخص الوحدة وتأكيد الحفظ" },
];
const UNIT_TYPE_OPTIONS = [
  ["apartment", "شقة", Building2],
  ["villa", "فيلا", Building2],
  ["duplex", "دوبلكس", Layers],
  ["studio", "استوديو", Building2],
  ["penthouse", "بنتهاوس", Building2],
  ["townhouse", "تاون هاوس", Building2],
  ["commercial", "تجاري", Building2],
] as const;
const UNIT_SERVICE_OPTIONS = ["موقف", "مصعد", "أمن", "مطبخ", "تكييف", "شرفة", "نادي", "قرب الخدمات"];
const UNIT_STATUS_OPTIONS = [
  { value: "available", label: "متاحة" },
  { value: "reserved", label: "محجوزة" },
  { value: "sold", label: "مباعة" },
  { value: "draft", label: "مسودة" },
] as const;

function createInitialUnitData(initialData?: Partial<UnitCreateFormData>): UnitCreateFormData {
  return {
    name: initialData?.name ?? "",
    location: initialData?.location ?? "",
    locationDetails: initialData?.locationDetails ?? null,
    unitType: initialData?.unitType ?? "apartment",
    listingType: initialData?.listingType ?? "sale",
    price: initialData?.price ?? "",
    area: initialData?.area ?? "",
    rooms: initialData?.rooms ?? "",
    baths: initialData?.baths ?? "",
    floor: initialData?.floor ?? "",
    view: initialData?.view ?? "",
    status: initialData?.status ?? "available",
    description: initialData?.description ?? "",
    adLicenseNumber: initialData?.adLicenseNumber ?? "",
    paymentPlanTitle: initialData?.paymentPlanTitle ?? "",
    downPayment: initialData?.downPayment ?? "",
    handoverAt: initialData?.handoverAt ?? "",
    parkingSpaces: initialData?.parkingSpaces ?? "",
    priceComparison: initialData?.priceComparison ?? "unknown",
    comparisonNotes: initialData?.comparisonNotes ?? "",
    expertNotes: initialData?.expertNotes ?? "",
    services: initialData?.services ?? [],
    images: initialData?.images ?? [],
    privatePermitFiles: initialData?.privatePermitFiles ?? [],
  };
}

function StepIntro({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={staggerItem}>
      <FieldLabel>{step}</FieldLabel>
      <h2 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--workspace-muted)]">{description}</p>
    </motion.div>
  );
}

/**
 * WHY:   Standalone units need a focused creation path without borrowing Zayon's persistence model.
 * WHAT:  Renders a motion-led, Anan-native unit wizard and emits a server-action friendly payload.
 * HOW:   Keeps local form state client-side, validates lightweight step gates, and delegates saving to the route.
 */
export default function AgUnitCreateForm({
  initialData,
  mode = "standalone",
  title,
  description,
  submitLabel,
  cancelHref,
  onSave,
  onCancel,
}: UnitCreateFormProps) {
  const { dictionary, isRtl } = useWebLocale();
  const router = useRouter();
  const copy = dictionary.unitCreate;
  const eyebrow = mode === "project_child" ? "وحدة داخل المشروع" : copy.eyebrow;
  const [pending, startTransition] = useTransition();
  const [activeStep, setActiveStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UnitCreateFormData>(() => createInitialUnitData(initialData));
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const permitInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload: startImageUpload, isUploading: isImageUploading } = useUploadThing("propertyMedia");
  const { startUpload: startPermitUpload, isUploading: isPermitUploading } = useUploadThing("verificationDocuments");

  const setField = (field: keyof UnitCreateFormData, value: string | UnitCreateFormData["status"]) => {
    setFeedback(null);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const setLocationValue = (location: LocationValue) => {
    setFeedback(null);
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.location;
      return next;
    });
    setFormData((current) => ({
      ...current,
      location: location.label,
      locationDetails: location,
    }));
  };

  const handleNext = () => {
    if (activeStep === 1 && (!formData.name.trim() || !formData.location.trim())) {
      setFeedback(copy.feedbackIdentity);
      return;
    }
    if (activeStep === 2 && !formData.area.trim()) {
      setFeedback(copy.feedbackSpecs);
      return;
    }
    if (activeStep === 3 && !formData.price.trim()) {
      setFeedback(copy.feedbackPrice);
      return;
    }
    setFeedback(null);
    setDirection(1);
    setActiveStep((step) => Math.min(step + 1, TOTAL_STEPS));
  };

  const handlePrev = () => {
    setFeedback(null);
    setDirection(-1);
    setActiveStep((step) => Math.max(step - 1, 1));
  };

  const handleSubmit = () => {
    setFeedback(null);
    setFieldErrors({});
    startTransition(async () => {
      const result = await onSave(formData);
      if (!result.ok) {
        setFeedback(result.feedback.message);
        setFieldErrors(result.feedback.fieldErrors);
        return;
      }
      router.push(result.redirectTo);
    });
  };

  const handleFiles = async (
    event: ChangeEvent<HTMLInputElement>,
    startUpload: (files: File[]) => Promise<Array<{ serverData: unknown }> | undefined>,
    field: "images" | "privatePermitFiles",
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    try {
      const uploaded = await startUpload(files);
      const references = uploaded?.map((file) => uploadedFileReferenceSchema.parse(file.serverData)) ?? [];
      setFormData((current) => ({ ...current, [field]: [...current[field], ...references] }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : copy.uploadFailed);
    } finally {
      event.target.value = "";
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push(cancelHref);
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <ZonePageIntro eyebrow={eyebrow} title={title} description={description} />

      <div className="mx-auto mt-4 w-full max-w-3xl">
        <CreationFlowProgress steps={UNIT_STEPS} currentStepIndex={activeStep - 1} onStepChange={(index) => setActiveStep(index + 1)} />
      </div>

      <div className="mx-auto mt-8 w-full max-w-3xl overflow-visible pb-24">
        <AnimatePresence mode="wait" initial={false}>
          {feedback ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn("mb-7 rounded-[20px] bg-rose-500/10 px-5 py-4 text-[14px] font-bold text-rose-600", isRtl ? "text-right" : "text-left")}
            >
              {feedback}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="pb-8">
          <AnimatePresence mode="wait" custom={direction}>
            {activeStep === 1 ? (
            <motion.div
              key="identity"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="space-y-7" variants={staggerContainer} initial="enter" animate="center">
                <StepIntro step={copy.stepIdentity} title={copy.identityTitle} description={copy.identityDescription} />
                <motion.div variants={staggerItem}>
                  <SectionCard title={copy.identityCardTitle}>
                    <div className="grid gap-5">
                      <div className="grid gap-2">
                        <FieldLabel>{copy.nameLabel}</FieldLabel>
                        <TextInput
                          value={formData.name}
                          onChange={(value) => setField("name", value)}
                          placeholder={copy.namePlaceholder}
                          icon={<Building2 className="h-4 w-4" />}
                          error={fieldErrors.name}
                          testId="unit-name-input"
                        />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.locationLabel}</FieldLabel>
                        <TextInput
                          value={formData.location}
                          onChange={(value) => {
                            setField("location", value);
                            setFormData((current) => ({
                              ...current,
                              locationDetails: current.locationDetails ? { ...current.locationDetails, label: value } : null,
                            }));
                          }}
                          placeholder={copy.locationPlaceholder}
                          icon={<MapPin className="h-4 w-4" />}
                          error={fieldErrors.location}
                          testId="unit-location-input"
                        />
                        <LocationPicker
                          value={formData.locationDetails}
                          onChange={setLocationValue}
                          label="اختر موقع الوحدة على الخريطة"
                          placeholder={copy.locationPlaceholder}
                          fieldError={fieldErrors.location}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.unitTypeLabel}</FieldLabel>
                        <div className="grid gap-3 md:grid-cols-4">
                          {UNIT_TYPE_OPTIONS.map(([value, label, Icon]) => {
                            const active = formData.unitType === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setField("unitType", value)}
                                className={`rounded-2xl border px-4 py-4 text-right transition ${
                                  active ? "border-foreground bg-foreground text-background" : "border-border bg-muted/10 text-foreground hover:bg-muted/20"
                                }`}
                              >
                                <Icon className="mb-2 h-5 w-5" />
                                <div className="text-sm font-black">{label}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setField("listingType", "sale")}
                          className={`rounded-2xl border px-4 py-4 text-right transition ${formData.listingType === "sale" ? "border-foreground bg-foreground text-background" : "border-border bg-muted/10 text-foreground"}`}
                        >
                          <div className="text-sm font-black">{copy.listingSale}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setField("listingType", "rent")}
                          className={`rounded-2xl border px-4 py-4 text-right transition ${formData.listingType === "rent" ? "border-foreground bg-foreground text-background" : "border-border bg-muted/10 text-foreground"}`}
                        >
                          <div className="text-sm font-black">{copy.listingRent}</div>
                        </button>
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.descriptionLabel}</FieldLabel>
                        <TextArea
                          rows={5}
                          value={formData.description}
                          onChange={(value) => setField("description", value)}
                          placeholder={copy.descriptionPlaceholder}
                          error={fieldErrors.description}
                          testId="unit-description-input"
                        />
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              </motion.div>
            </motion.div>
            ) : null}

            {activeStep === 2 ? (
            <motion.div
              key="specs"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="space-y-7" variants={staggerContainer} initial="enter" animate="center">
                <StepIntro step={copy.stepSpecs} title={copy.specsTitle} description={copy.specsDescription} />
                <motion.div variants={staggerItem}>
                  <SectionCard title={copy.specsCardTitle}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="grid gap-2">
                        <FieldLabel>{copy.areaLabel}</FieldLabel>
                        <TextInput value={formData.area} onChange={(value) => setField("area", value)} placeholder={copy.areaPlaceholder} icon={<Ruler className="h-4 w-4" />} error={fieldErrors.area} testId="unit-area-input" />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.roomsLabel}</FieldLabel>
                        <TextInput value={formData.rooms} onChange={(value) => setField("rooms", value)} placeholder={copy.roomsPlaceholder} icon={<BedDouble className="h-4 w-4" />} error={fieldErrors.rooms} testId="unit-rooms-input" />
                        <div className="flex flex-wrap justify-end gap-2">
                          {["1", "2", "3", "4", "5"].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setField("rooms", value)}
                              className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
                                formData.rooms === value ? "border-foreground bg-foreground text-background" : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] hover:text-foreground"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.bathsLabel}</FieldLabel>
                        <TextInput value={formData.baths} onChange={(value) => setField("baths", value)} placeholder={copy.bathsPlaceholder} icon={<Bath className="h-4 w-4" />} error={fieldErrors.baths} testId="unit-baths-input" />
                        <div className="flex flex-wrap justify-end gap-2">
                          {["1", "2", "3", "4"].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setField("baths", value)}
                              className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
                                formData.baths === value ? "border-foreground bg-foreground text-background" : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] hover:text-foreground"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.floorLabel}</FieldLabel>
                        <TextInput value={formData.floor} onChange={(value) => setField("floor", value)} placeholder={copy.floorPlaceholder} icon={<Layers className="h-4 w-4" />} error={fieldErrors.floor} />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.viewLabel}</FieldLabel>
                        <TextInput value={formData.view} onChange={(value) => setField("view", value)} placeholder={copy.viewPlaceholder} icon={<Eye className="h-4 w-4" />} error={fieldErrors.view} />
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.parkingLabel}</FieldLabel>
                        <TextInput value={formData.parkingSpaces} onChange={(value) => setField("parkingSpaces", value)} placeholder={copy.parkingPlaceholder} />
                        <div className="flex flex-wrap justify-end gap-2">
                          {["0", "1", "2", "3"].map((value) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setField("parkingSpaces", value)}
                              className={`rounded-full border px-3 py-1.5 text-[12px] font-bold transition ${
                                formData.parkingSpaces === value ? "border-foreground bg-foreground text-background" : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] hover:text-foreground"
                              }`}
                            >
                              {value === "3" ? "3+" : value}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.handoverLabel}</FieldLabel>
                        <TextInput value={formData.handoverAt} onChange={(value) => setField("handoverAt", value)} placeholder={copy.handoverPlaceholder} icon={<Calendar className="h-4 w-4" />} />
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              </motion.div>
            </motion.div>
            ) : null}

            {activeStep === 3 ? (
            <motion.div
              key="pricing"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="space-y-7" variants={staggerContainer} initial="enter" animate="center">
                <StepIntro step={copy.stepPricing} title={copy.pricingTitle} description={copy.pricingDescription} />
                <motion.div variants={staggerItem}>
                  <SectionCard title={copy.pricingCardTitle}>
                    <div className="grid gap-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                          <FieldLabel>{copy.priceLabel}</FieldLabel>
                          <TextInput value={formData.price} onChange={(value) => setField("price", value)} placeholder={copy.pricePlaceholder} error={fieldErrors.price} testId="unit-price-input" />
                        </div>
                        <div className="grid gap-2">
                          <FieldLabel>{copy.paymentPlanLabel}</FieldLabel>
                          <TextInput value={formData.paymentPlanTitle} onChange={(value) => setField("paymentPlanTitle", value)} placeholder={copy.paymentPlanPlaceholder} icon={<FileText className="h-4 w-4" />} />
                        </div>
                        <div className="grid gap-2">
                          <FieldLabel>{copy.downPaymentLabel}</FieldLabel>
                          <TextInput value={formData.downPayment} onChange={(value) => setField("downPayment", value)} placeholder={copy.downPaymentPlaceholder} icon={<Hash className="h-4 w-4" />} />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          ["below_market", copy.priceBelowMarket],
                          ["fair_market", copy.priceFairMarket],
                          ["above_market", copy.priceAboveMarket],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setField("priceComparison", value as UnitCreateFormData["priceComparison"])}
                            className={`rounded-2xl border px-4 py-4 text-right text-sm font-black transition ${formData.priceComparison === value ? "border-foreground bg-foreground text-background" : "border-border bg-muted/10 text-foreground"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.comparisonNotesLabel}</FieldLabel>
                        <TextArea rows={3} value={formData.comparisonNotes} onChange={(value) => setField("comparisonNotes", value)} placeholder={copy.comparisonNotesPlaceholder} />
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              </motion.div>
            </motion.div>
            ) : null}

            {activeStep === 4 ? (
            <motion.div
              key="readiness"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="space-y-7" variants={staggerContainer} initial="enter" animate="center">
                <StepIntro step={copy.stepReadiness} title={copy.readinessTitle} description={copy.readinessDescription} />
                <motion.div variants={staggerItem}>
                  <SectionCard title={copy.readinessCardTitle}>
                    <div className="grid gap-5">
                      <div className="grid gap-2">
                        <FieldLabel>{copy.statusLabel}</FieldLabel>
                        <SelectInput
                          value={formData.status}
                          onChange={(value) => setField("status", value)}
                          options={UNIT_STATUS_OPTIONS}
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        {UNIT_SERVICE_OPTIONS.map((service) => {
                          const active = formData.services.includes(service);
                          return (
                            <button
                              key={service}
                              type="button"
                              onClick={() => setFormData((current) => ({
                                ...current,
                                services: active ? current.services.filter((item) => item !== service) : [...current.services, service],
                              }))}
                              className={`rounded-2xl border px-4 py-4 text-right text-sm font-black transition ${active ? "border-foreground bg-foreground text-background" : "border-border bg-muted/10 text-foreground"}`}
                            >
                              {service}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid gap-2">
                        <FieldLabel>{copy.expertNotesLabel}</FieldLabel>
                        <TextArea rows={3} value={formData.expertNotes} onChange={(value) => setField("expertNotes", value)} placeholder={copy.expertNotesPlaceholder} />
                      </div>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                          <FieldLabel>{copy.adLicenseLabel}</FieldLabel>
                          <TextInput value={formData.adLicenseNumber} onChange={(value) => setField("adLicenseNumber", value)} placeholder={copy.adLicensePlaceholder} icon={<ShieldCheck className="h-4 w-4" />} error={fieldErrors.adLicenseNumber} />
                        </div>
                      </div>
                      <div className="grid gap-4 rounded-[20px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4">
                        <div>
                          <h3 className="text-sm font-black text-foreground">{copy.mediaTitle}</h3>
                          <p className="mt-1 text-xs font-semibold leading-6 text-[var(--workspace-muted)]">{copy.mediaDescription}</p>
                        </div>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          onChange={(event) => handleFiles(event, startImageUpload, "images")}
                        />
                        <UploadTile
                          title={copy.uploadImagesTitle}
                          subtitle={isImageUploading ? copy.uploadingLabel : copy.uploadImagesDescription}
                          icon={<ImagePlus className="h-5 w-5" />}
                          disabled={isImageUploading}
                          onClick={() => imageInputRef.current?.click()}
                        />
                        {formData.images.length ? (
                          <div className="grid gap-2">
                            {formData.images.map((file, index) => (
                              <FileRow
                                key={`${file.key}-${index}`}
                                file={file}
                                onRemove={() => setFormData((current) => ({ ...current, images: current.images.filter((_, fileIndex) => fileIndex !== index) }))}
                              />
                            ))}
                          </div>
                        ) : null}
                        <input
                          ref={permitInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,application/pdf"
                          multiple
                          className="hidden"
                          onChange={(event) => handleFiles(event, startPermitUpload, "privatePermitFiles")}
                        />
                        <UploadTile
                          title={copy.uploadPermitsTitle}
                          subtitle={isPermitUploading ? copy.uploadingLabel : copy.uploadPermitsDescription}
                          icon={<Upload className="h-5 w-5" />}
                          disabled={isPermitUploading}
                          onClick={() => permitInputRef.current?.click()}
                        />
                        {formData.privatePermitFiles.length ? (
                          <div className="grid gap-2">
                            {formData.privatePermitFiles.map((file, index) => (
                              <FileRow
                                key={`${file.key}-${index}`}
                                file={file}
                                onRemove={() => setFormData((current) => ({
                                  ...current,
                                  privatePermitFiles: current.privatePermitFiles.filter((_, fileIndex) => fileIndex !== index),
                                }))}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              </motion.div>
            </motion.div>
            ) : null}

            {activeStep === 5 ? (
            <motion.div
              key="review"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div className="space-y-7" variants={staggerContainer} initial="enter" animate="center">
                <StepIntro step={copy.stepReview} title={copy.reviewTitle} description={copy.reviewDescription} />
                <motion.div variants={staggerItem}>
                  <SectionCard title={copy.reviewCardTitle}>
                    <div className="grid gap-3">
                      <ReviewRow label={copy.nameLabel} value={formData.name || copy.emptyValue} />
                      <ReviewRow label={copy.locationLabel} value={formData.location || copy.emptyValue} />
                      <ReviewRow label={copy.priceLabel} value={formData.price || copy.emptyValue} />
                      <ReviewRow label={copy.areaLabel} value={formData.area || copy.emptyValue} />
                      <ReviewRow label={copy.unitTypeLabel} value={formData.unitType || copy.emptyValue} />
                      <ReviewRow label={copy.comparisonNotesLabel} value={formData.priceComparison || copy.emptyValue} />
                      <ReviewRow label={copy.statusLabel} value={copy[`status${formData.status.charAt(0).toUpperCase()}${formData.status.slice(1)}` as keyof typeof copy] ?? formData.status} />
                    </div>
                  </SectionCard>
                </motion.div>
              </motion.div>
            </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <CreationFlowActions
          isFirstStep={activeStep === 1}
          isLastStep={activeStep === TOTAL_STEPS}
          allowFirstBack
          pending={pending}
          previousLabel={activeStep === 1 ? copy.cancelLabel : copy.previousLabel}
          nextLabel={copy.nextLabel}
          saveLabel={submitLabel}
          savingLabel={copy.savingLabel}
          onBack={activeStep === 1 ? handleCancel : handlePrev}
          onNext={handleNext}
          onSave={handleSubmit}
        />
      </div>
    </div>
  );
}
