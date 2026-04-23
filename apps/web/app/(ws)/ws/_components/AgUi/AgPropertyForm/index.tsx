"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import ZonePageIntro from "../../ZoneShell/ZonePageIntro";
import { AgPropertyFormHeaderActions } from "../AgPropertyFormHeaderActions";
import { AgPropertyFormSafetyOverlay } from "../AgPropertyFormSafetyOverlay";
import {
  CreationFlowActions,
  CreationFlowMotionStep,
  CreationFlowProgress,
  expertStaggerContainer,
  expertStaggerItem,
} from "../AgCreationFlow";
import { FieldLabel } from "./controls";
import { useAgPropertyForm } from "./useAgPropertyForm";
import type { AgPropertyFormProps } from "./types";
import {
  BasicStep,
  GalleryStep,
  ReviewStep,
  SpecsStep,
} from "./steps";

function ProjectStepIntro({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={expertStaggerItem}>
      <FieldLabel>{step}</FieldLabel>
      <h2 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--workspace-muted)]">{description}</p>
    </motion.div>
  );
}

/**
 * WHY:   Project create and edit need one simplified, Safari-safe flow instead of long split-column forms.
 * WHAT:  Renders a seven-step Saudi dossier wizard for identity, ownership, units, payment, compliance, media, and readiness review.
 * HOW:   Keeps all form state local, delegates wizard side effects to a local hook, and splits step rendering into focused local modules.
 */
export default function AgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  title,
  description,
  submitLabel,
  onSave,
  onCancel,
  cancelHref,
  onDelete,
  onRevokeViewer,
}: AgPropertyFormProps) {
  const { locale } = useWebLocale();
  const [direction, setDirection] = useState(1);
  const form = useAgPropertyForm({ propertyId, initialData, brokers, onSave });
  const resolvedTitle =
    title ??
    (locale === "fr"
      ? "Gerer le projet"
      : locale === "en"
        ? "Manage project"
        : "إدارة المشروع");
  const resolvedDescription =
    description ??
    (locale === "fr"
      ? "Creez une page projet claire et facile a mettre a jour avec images, description et acces prive."
      : locale === "en"
        ? "Create a clear, easy-to-update project page with images, description, and private sharing details."
        : "أنشئ صفحة مشروع واضحة وسهلة التحديث مع صور، وصف، ومعلومات المشاركة الخاصة.");
  const resolvedSubmitLabel =
    submitLabel ??
    (locale === "fr"
      ? "Enregistrer le projet"
      : locale === "en"
        ? "Save project"
        : "حفظ المشروع");
  const eyebrow =
    form.isEditMode
      ? locale === "fr"
        ? "Modifier le projet"
        : locale === "en"
          ? "Edit project"
          : "تعديل المشروع"
      : locale === "fr"
        ? "Nouveau projet"
        : locale === "en"
          ? "Create project"
          : "إنشاء مشروع جديد";

  const renderCurrentStepFields = () => {
    if (form.activeStep.key === "identity") {
      return <BasicStep formState={form.formState} fieldErrors={form.submissionFeedback?.fieldErrors ?? {}} setFormState={form.setFormState} />;
    }
    if (form.activeStep.key === "scale") {
      return (
        <SpecsStep
          adLicenseLabel={form.adLicenseLabel}
          adLicenseTone={form.adLicenseTone}
          fieldErrors={form.submissionFeedback?.fieldErrors ?? {}}
          formState={form.formState}
          handleLicenseFiles={form.handleLicenseFiles}
          handleLicenseSubmit={form.handleLicenseSubmit}
          isLicenseUploading={form.isLicenseUploading}
          licenseDocs={form.licenseDocs}
          licenseError={form.licenseError}
          licenseInputRef={form.licenseInputRef}
          licenseSubmitted={form.licenseSubmitted}
          licenseSubmitting={form.licenseSubmitting}
          propertyId={propertyId}
          setFormState={form.setFormState}
          setLicenseDocs={form.setLicenseDocs}
        />
      );
    }
    if (form.activeStep.key === "services") {
      return (
        <GalleryStep
          fieldErrors={form.submissionFeedback?.fieldErrors ?? {}}
          formState={form.formState}
          handleImageSelection={form.handleImageSelection}
          inputRef={form.inputRef}
          isUploading={form.isUploading}
          mockDataEnabled={form.mockDataEnabled}
          moveImage={form.moveImage}
          previewAspectClass={form.previewAspectClass}
          previewObjectClass={form.previewObjectClass}
          removeImage={form.removeImage}
          setCoverImageKey={form.setCoverImageKey}
          setFormState={form.setFormState}
          uploadError={form.uploadError}
        />
      );
    }
    return (
        <ReviewStep
          formState={form.formState}
          savePending={form.savePending}
          selectedBroker={form.selectedBroker}
          setShowSafetyConfirm={form.setShowSafetyConfirm}
          submitLabel={resolvedSubmitLabel}
        />
    );
  };

  const handleStepChange = (index: number) => {
    setDirection(index > form.currentStepIndex ? 1 : -1);
    form.setCurrentStepIndex(index);
  };

  const handleBack = () => {
    setDirection(-1);
    form.setCurrentStepIndex((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    setDirection(1);
    form.setCurrentStepIndex((current) => Math.min(form.stepDefinitions.length - 1, current + 1));
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-16">
      {form.showSafetyConfirm ? (
        <AgPropertyFormSafetyOverlay
          savePending={form.savePending}
          onConfirm={form.handleConfirm}
          onClose={() => form.setShowSafetyConfirm(false)}
        />
      ) : null}

      <ZonePageIntro
        eyebrow={eyebrow}
        title={resolvedTitle}
        description={resolvedDescription}
        actions={form.isEditMode ? <AgPropertyFormHeaderActions onCancel={onCancel} cancelHref={cancelHref} onDelete={onDelete} /> : undefined}
      />

      <div className="mx-auto mt-4 w-full max-w-4xl px-4 sm:px-6">
        <CreationFlowProgress
          steps={form.stepDefinitions}
          currentStepIndex={form.currentStepIndex}
          onStepChange={handleStepChange}
        />
      </div>

      <div className="mx-auto mt-8 w-full max-w-4xl overflow-visible px-4 pb-24 sm:px-6">
        {form.submissionFeedback ? (
          <div className="mb-7 rounded-[20px] bg-rose-500/10 px-5 py-4 text-right text-[14px] font-bold text-rose-600">
            {form.submissionFeedback.message}
          </div>
        ) : null}

        <div className="pb-8">
          <CreationFlowMotionStep stepKey={form.activeStep.key} direction={direction}>
            <motion.div className="space-y-7" variants={expertStaggerContainer} initial="enter" animate="center">
              <ProjectStepIntro
                step={`${locale === "en" ? "Step" : locale === "fr" ? "Etape" : "الخطوة"} ${form.currentStepIndex + 1}`}
                title={form.activeStep.title}
                description={form.activeStep.summary}
              />
              {renderCurrentStepFields()}
            </motion.div>
          </CreationFlowMotionStep>
        </div>

        <CreationFlowActions
          isFirstStep={form.currentStepIndex === 0}
          isLastStep={form.isLastStep}
          pending={form.savePending}
          previousLabel="رجوع"
          nextLabel="متابعة"
          saveLabel={resolvedSubmitLabel}
          savingLabel={locale === "fr" ? "Enregistrement..." : locale === "en" ? "Saving..." : "جارٍ الحفظ..."}
          onBack={handleBack}
          onNext={handleNext}
          onSave={() => form.setShowSafetyConfirm(true)}
        />
      </div>
    </div>
  );
}
