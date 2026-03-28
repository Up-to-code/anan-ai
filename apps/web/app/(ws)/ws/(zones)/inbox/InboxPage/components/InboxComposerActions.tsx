"use client";

import { useMemo, useState } from "react";
import { Building2, FileUp, Paperclip, Plus, Search, Send, Tag, X } from "lucide-react";
import type { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from "react";
import { AttachmentStageCard } from "@/app/(ws)/ws/_components/attachments/AttachmentStageCard";
import {
  getQuickActionUnavailableMessage,
  resolveComposerLanguage,
} from "@/app/(ws)/ws/_components/attachments/attachmentCopy";
import {
  COMPOSER_ATTACHMENT_ACCEPT,
} from "@/app/(ws)/ws/_components/attachments/attachmentPresentation";
import type { UploadedFileReference } from "@/server/contracts/files";

export type ComposerProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
  shortDescription?: string;
  organizationName?: string | null;
  publicationState?: "published" | "draft" | "archived";
};

export type InboxShareAction = "file" | "project" | "offer";

export type ComposerOfferFormState = {
  propertyId: string;
  title: string;
  description: string;
  price: string;
  attachments: UploadedFileReference[];
};

const fieldClass =
  "w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)] bg-[var(--workspace-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_86%,transparent)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_26%,transparent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)]";

const secondaryButtonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-elevated)] px-3 py-2 text-xs font-bold text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-panel)] disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_34%,transparent)] bg-[var(--workspace-highlight)] px-3 py-2 text-xs font-bold text-[var(--primary-foreground)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] disabled:bg-[var(--workspace-elevated)] disabled:text-[var(--workspace-muted)]";

const ghostButtonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-transparent px-3 py-2 text-xs font-bold text-[var(--workspace-muted)] transition hover:bg-[color:color-mix(in_srgb,var(--workspace-panel)_72%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]";

function formatProjectVisibility(project: ComposerProjectOption) {
  return project.publicationState === "published" ? "عام" : "خاص";
}

function formatProjectPrice(project: ComposerProjectOption) {
  if (!project.price) return null;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(project.price);
}

function getInboxShareActionMeta(action: InboxShareAction) {
  if (action === "file") {
    return {
      icon: FileUp,
      title: "إرفاق ملف",
      description: "أرسل ملفًا مع ملاحظة قصيرة.",
    };
  }

  if (action === "project") {
    return {
      icon: Building2,
      title: "إرسال عقار أو شقة",
      description: "اختر أصلًا واحدًا مع تعليق موجز.",
    };
  }

  return {
    icon: Tag,
    title: "إنشاء عرض خاص",
    description: "أنشئ عرضًا سريعًا ثم أرسله مباشرة من المحادثة.",
  };
}

export function buildDefaultOfferForm(projectOptions: ComposerProjectOption[]): ComposerOfferFormState {
  return {
    propertyId: projectOptions[0]?.id ?? "",
    title: projectOptions[0]?.title ? `عرض خاص على ${projectOptions[0].title}` : "",
    description: "",
    price: projectOptions[0]?.price ? String(projectOptions[0].price) : "",
    attachments: [],
  };
}

export function InboxQuickShareMenu({
  activeAction,
  canCreateOffer,
  canShareProjects,
  onSelectAction,
}: {
  activeAction: InboxShareAction | null;
  canCreateOffer: boolean;
  canShareProjects: boolean;
  onSelectAction: (action: InboxShareAction) => void;
}) {
  const actions: InboxShareAction[] = ["offer", "project", "file"];
  const language = resolveComposerLanguage();

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {actions.map((action) => {
        const meta = getInboxShareActionMeta(action);
        const Icon = meta.icon;
        const isDisabled =
          (action === "offer" && !canCreateOffer) ||
          (action === "project" && !canShareProjects);
        const disabledReason =
          action === "offer" || action === "project"
            ? getQuickActionUnavailableMessage(action, language)
            : null;

        return (
          <button
            key={action}
            type="button"
            onClick={() => onSelectAction(action)}
            disabled={isDisabled}
            className={`flex min-h-[88px] items-start gap-3 rounded-2xl border px-3 py-3 text-right transition ${
              activeAction === action
                ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] text-[var(--workspace-highlight)]"
                : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-panel)]"
            } disabled:cursor-not-allowed disabled:opacity-55`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black">{meta.title}</span>
              <span className="mt-1 block text-[11px] font-medium text-[var(--workspace-muted)]">
                {isDisabled ? disabledReason : meta.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function InboxInlineSharePanel({
  activeAction,
  fileInputRef,
  handleUploadFile,
  isUploading,
  onClose,
  onSubmit,
  projectNote,
  projectOptions,
  selectedFile,
  selectedProjectId,
  setSelectedFile,
  setProjectNote,
  setSelectedProjectId,
  setShareFileNote,
  shareFileNote,
  onOpenProjectPicker,
}: {
  activeAction: Exclude<InboxShareAction, "offer">;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  handleUploadFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  projectNote: string;
  projectOptions: ComposerProjectOption[];
  selectedFile: UploadedFileReference | null;
  selectedProjectId: string;
  setSelectedFile: Dispatch<SetStateAction<UploadedFileReference | null>>;
  setProjectNote: Dispatch<SetStateAction<string>>;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setShareFileNote: Dispatch<SetStateAction<string>>;
  shareFileNote: string;
  onOpenProjectPicker: () => void;
}) {
  const meta = getInboxShareActionMeta(activeAction);
  const selectedProject = projectOptions.find((project) => project.id === selectedProjectId) ?? null;

  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
            {meta.title}
          </div>
          <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
            {meta.description}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={ghostButtonClass}
          aria-label="إغلاق لوحة المشاركة"
        >
          <X className="h-3.5 w-3.5" />
          إغلاق
        </button>
      </div>

      {activeAction === "project" ? (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">العقار أو المشروع</span>
            <button type="button" onClick={onOpenProjectPicker} className={`${fieldClass} flex min-h-[88px] items-center justify-between text-right`}>
              <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                {selectedProject?.imageUrl ? (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)]">
                    <Building2 className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block break-words text-sm font-black text-[var(--workspace-bubble-other-foreground)] [overflow-wrap:anywhere]">
                    {selectedProject?.title ?? "اختر مشروعًا"}
                  </span>
                  <span className="mt-1 line-clamp-2 block break-words text-xs text-[var(--workspace-muted)] [overflow-wrap:anywhere]">
                    {selectedProject ? `${selectedProject.location} · ${formatProjectVisibility(selectedProject)}` : "افتح المعرض المرئي لاختيار المشروع."}
                  </span>
                </span>
              </span>
              <span className="shrink-0 pr-2 text-xs font-bold text-[var(--workspace-highlight)]">اختيار</span>
            </button>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">ملاحظة</span>
            <textarea
              rows={3}
              value={projectNote}
              onChange={(event) => setProjectNote(event.target.value)}
              placeholder="مثال: هذا الخيار أقرب لطلبه"
              className={`${fieldClass} min-h-[88px] resize-y leading-6`}
            />
          </label>
          <div className="flex items-end justify-end">
            <button type="button" onClick={() => void onSubmit()} className={primaryButtonClass}>
              <Send className="h-3.5 w-3.5" />
              إرسال
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {selectedFile ? (
            <AttachmentStageCard
              attachment={selectedFile}
              helperLabel="سيبقى الملف في الأعلى حتى ترسله داخل المحادثة."
              onRemove={() => setSelectedFile(null)}
            />
          ) : null}
          <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept={COMPOSER_ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(event) => void handleUploadFile(event)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={secondaryButtonClass}
            >
              <Paperclip className="h-3.5 w-3.5" />
              {isUploading ? "جارٍ رفع الملف..." : selectedFile ? "تغيير الملف" : "اختيار ملف"}
            </button>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">ملاحظة</span>
            <textarea
              rows={3}
              value={shareFileNote}
              onChange={(event) => setShareFileNote(event.target.value)}
              placeholder={selectedFile ? selectedFile.name : "أضف وصفًا قصيرًا للملف"}
              className={`${fieldClass} min-h-[88px] resize-y leading-6`}
            />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={() => void onSubmit()} className={primaryButtonClass}>
              <Send className="h-3.5 w-3.5" />
              إرسال
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InboxProjectPickerModal({
  isOpen,
  onClose,
  onSelectProject,
  projectOptions,
  selectedProjectId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  projectOptions: ComposerProjectOption[];
  selectedProjectId: string;
}) {
  const [query, setQuery] = useState("");
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return projectOptions;
    }

    return projectOptions.filter((project) =>
      [
        project.title,
        project.location,
        project.shortDescription,
        project.organizationName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [projectOptions, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-6 sm:items-center">
      <div className="w-full max-w-4xl rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_68%,transparent)] bg-[var(--workspace-panel)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-black text-[var(--workspace-bubble-other-foreground)]">اختر مشروعًا للمشاركة</div>
            <div className="mt-1 text-sm text-[var(--workspace-muted)]">اختيار بصري أسرع من القائمة النصية.</div>
            <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
              ابحث أو اعرض مشاريع أخرى إذا كان المطور يملك قائمة طويلة.
            </div>
          </div>
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            <X className="h-4 w-4" />
            إغلاق
          </button>
        </div>

        <div className="relative mt-4">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث بالاسم أو الموقع أو الجهة"
            className={`${fieldClass} pr-10`}
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--workspace-muted)]" />
        </div>

        <div className="mt-4 grid max-h-[60vh] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  onSelectProject(project.id);
                  onClose();
                }}
                className={`overflow-hidden rounded-xl border text-right transition ${
                  isSelected
                    ? "border-[var(--workspace-highlight)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)]"
                    : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] hover:bg-[var(--workspace-panel)]"
                }`}
              >
                <div className="aspect-[4/3] w-full bg-[var(--workspace-panel)]">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--workspace-muted)]">
                      <Building2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 break-words text-sm font-black text-[var(--workspace-bubble-other-foreground)] [overflow-wrap:anywhere]">{project.title}</div>
                      <div className="mt-1 text-xs text-[var(--workspace-muted)]">{project.location}</div>
                    </div>
                    <span className="shrink-0 rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-2 py-1 text-[10px] font-bold text-[var(--workspace-muted)]">
                      {formatProjectVisibility(project)}
                    </span>
                  </div>
                  <div className="line-clamp-2 text-xs leading-5 text-[var(--workspace-muted)]">
                    {project.shortDescription ?? "بدون وصف إضافي"}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-[var(--workspace-muted)]">
                    <span className="truncate">{project.organizationName ?? "مساحة العمل الحالية"}</span>
                    <span>{formatProjectPrice(project) ? `${formatProjectPrice(project)} ر.س` : "بدون سعر"}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {filteredProjects.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] px-4 py-8 text-center text-sm text-[var(--workspace-muted)]">
              لا توجد مشاريع مطابقة لهذا البحث.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InboxOfferModal({
  conversationLabel,
  fileInputRef,
  handleUploadOfferAttachments,
  handleSelectOfferProject,
  isOpen,
  isSending,
  isUploading,
  offerForm,
  onClose,
  onSubmit,
  projectOptions,
  setOfferForm,
}: {
  conversationLabel: string;
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  handleUploadOfferAttachments: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleSelectOfferProject: (projectId: string) => void;
  isOpen: boolean;
  isSending: boolean;
  isUploading: boolean;
  offerForm: ComposerOfferFormState;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  projectOptions: ComposerProjectOption[];
  setOfferForm: Dispatch<SetStateAction<ComposerOfferFormState>>;
}) {
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const selectedProject = projectOptions.find((project) => project.id === offerForm.propertyId) ?? null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_68%,transparent)] bg-[var(--workspace-panel)] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-black text-[var(--workspace-bubble-other-foreground)]">
              إنشاء وإرسال عرض سريع
            </div>
            <div className="mt-1 text-sm font-medium text-[var(--workspace-muted)]">
              إلى {conversationLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={ghostButtonClass}
            aria-label="إغلاق نافذة إنشاء العرض"
          >
            <X className="h-4 w-4" />
            إغلاق
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">العقار أو المشروع</span>
            <button
              type="button"
              onClick={() => setIsProjectPickerOpen(true)}
              className={`${fieldClass} flex min-h-[88px] items-center justify-between text-right`}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                {selectedProject?.imageUrl ? (
                  <img src={selectedProject.imageUrl} alt={selectedProject.title} className="h-14 w-14 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)]">
                    <Building2 className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block break-words text-sm font-black text-[var(--workspace-bubble-other-foreground)] [overflow-wrap:anywhere]">
                    {selectedProject?.title ?? "اختر مشروعًا"}
                  </span>
                  <span className="mt-1 line-clamp-2 block break-words text-xs text-[var(--workspace-muted)] [overflow-wrap:anywhere]">
                    {selectedProject
                      ? `${selectedProject.location} · ${formatProjectVisibility(selectedProject)}`
                      : "ابحث أو اختر بصريًا من المشاريع المتاحة."}
                  </span>
                </span>
              </span>
              <span className="shrink-0 pr-2 text-xs font-bold text-[var(--workspace-highlight)]">اختيار</span>
            </button>
          </div>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">السعر</span>
            <input
              type="text"
              inputMode="numeric"
              value={offerForm.price}
              onChange={(event) =>
                setOfferForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              placeholder="مثال: 2500000"
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">عنوان العرض</span>
            <input
              type="text"
              value={offerForm.title}
              onChange={(event) =>
                setOfferForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="مثال: عرض خاص على وحدة جاهزة للتسليم"
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">ملاحظة</span>
            <textarea
              rows={4}
              value={offerForm.description}
              onChange={(event) =>
                setOfferForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="اكتب الرسالة المختصرة التي تصاحب العرض."
              className={`${fieldClass} min-h-[120px] resize-none`}
            />
          </label>
        </div>

        <div
          className="mt-4 rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] p-4"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(event) => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (!files?.length) return;
            const target = { files, value: "" } as EventTarget & HTMLInputElement;
            void handleUploadOfferAttachments({ target } as ChangeEvent<HTMLInputElement>);
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                مرفقات العرض
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
                اسحب الملفات هنا أو اخترها يدويًا.
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={COMPOSER_ATTACHMENT_ACCEPT}
              multiple
              className="hidden"
              onChange={(event) => void handleUploadOfferAttachments(event)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={secondaryButtonClass}
            >
              <Plus className="h-3.5 w-3.5" />
              {isUploading ? "جارٍ رفع المرفقات..." : "إضافة مرفقات"}
            </button>
          </div>
          {offerForm.attachments.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {offerForm.attachments.map((attachment) => {
                return (
                  <AttachmentStageCard
                    key={`${attachment.key}-${attachment.name}`}
                    attachment={attachment}
                    helperLabel="لن يتم إرسال هذه المرفقات حتى تضغط زر إنشاء وإرسال."
                    onRemove={() =>
                      setOfferForm((current) => ({
                        ...current,
                        attachments: current.attachments.filter((entry) => entry.key !== attachment.key),
                      }))
                    }
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-medium text-[var(--workspace-muted)]">
            سيتم إنشاء العرض ثم إرساله مباشرة داخل المحادثة.
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onClose} className={ghostButtonClass}>
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={isSending || isUploading || !offerForm.propertyId || offerForm.price.trim().length === 0}
              className={primaryButtonClass}
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? "جاري الإرسال..." : "إنشاء وإرسال"}
            </button>
          </div>
        </div>
      </div>

      <InboxProjectPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectProject={(projectId) => {
          handleSelectOfferProject(projectId);
          setIsProjectPickerOpen(false);
        }}
        projectOptions={projectOptions}
        selectedProjectId={offerForm.propertyId}
      />
    </div>
  );
}
