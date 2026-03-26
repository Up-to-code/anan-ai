"use client";

import { Building2, FileUp, Paperclip, Plus, Send, Tag, X } from "lucide-react";
import type { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from "react";
import type { UploadedFileReference } from "@/server/contracts/files";

export type ComposerProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
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

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {actions.map((action) => {
        const meta = getInboxShareActionMeta(action);
        const Icon = meta.icon;
        const isDisabled =
          (action === "offer" && !canCreateOffer) ||
          (action === "project" && !canShareProjects);

        return (
          <button
            key={action}
            type="button"
            onClick={() => onSelectAction(action)}
            disabled={isDisabled}
            className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-right transition ${
              activeAction === action
                ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] text-[var(--workspace-highlight)]"
                : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-panel)]"
            } disabled:cursor-not-allowed disabled:opacity-55`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black">{meta.title}</span>
              <span className="mt-1 block text-[11px] font-medium text-[var(--workspace-muted)]">
                {isDisabled ? "لا توجد بيانات متاحة حاليًا." : meta.description}
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
  setProjectNote,
  setSelectedProjectId,
  setShareFileNote,
  shareFileNote,
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
  setProjectNote: Dispatch<SetStateAction<string>>;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setShareFileNote: Dispatch<SetStateAction<string>>;
  shareFileNote: string;
}) {
  const meta = getInboxShareActionMeta(activeAction);

  return (
    <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] p-4">
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
        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">العقار أو المشروع</span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className={fieldClass}
            >
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} · {project.location}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">ملاحظة</span>
            <input
              type="text"
              value={projectNote}
              onChange={(event) => setProjectNote(event.target.value)}
              placeholder="مثال: هذا الخيار أقرب لطلبه"
              className={fieldClass}
            />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={() => void onSubmit()} className={primaryButtonClass}>
              <Send className="h-3.5 w-3.5" />
              إرسال
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
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
            <input
              type="text"
              value={shareFileNote}
              onChange={(event) => setShareFileNote(event.target.value)}
              placeholder={selectedFile ? selectedFile.name : "أضف وصفًا قصيرًا للملف"}
              className={fieldClass}
            />
          </label>
          <div className="flex items-end">
            <button type="button" onClick={() => void onSubmit()} className={primaryButtonClass}>
              <Send className="h-3.5 w-3.5" />
              إرسال
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InboxOfferModal({
  conversationLabel,
  fileInputRef,
  handleUploadOfferAttachments,
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
  isOpen: boolean;
  isSending: boolean;
  isUploading: boolean;
  offerForm: ComposerOfferFormState;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  projectOptions: ComposerProjectOption[];
  setOfferForm: Dispatch<SetStateAction<ComposerOfferFormState>>;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl rounded-[30px] border border-[color:color-mix(in_srgb,var(--workspace-border)_68%,transparent)] bg-[var(--workspace-panel)] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-[var(--workspace-highlight)]">
              عرض خاص
            </div>
            <div className="mt-2 text-xl font-black text-[var(--workspace-bubble-other-foreground)]">
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
          <label className="grid gap-1.5">
            <span className="text-[11px] font-bold text-[var(--workspace-muted)]">العقار أو المشروع</span>
            <select
              value={offerForm.propertyId}
              onChange={(event) =>
                setOfferForm((current) => ({
                  ...current,
                  propertyId: event.target.value,
                }))
              }
              className={fieldClass}
            >
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} · {project.location}
                </option>
              ))}
            </select>
          </label>
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

        <div className="mt-4 rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                مرفقات العرض
              </div>
              <div className="mt-1 text-xs font-medium text-[var(--workspace-muted)]">
                أضف ملفات داعمة إذا احتجت.
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
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
            <div className="mt-3 flex flex-wrap gap-2">
              {offerForm.attachments.map((attachment) => (
                <span
                  key={`${attachment.key}-${attachment.name}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-1.5 text-xs font-medium text-[var(--workspace-bubble-other-foreground)]"
                >
                  <Paperclip className="h-3 w-3" />
                  {attachment.name}
                </span>
              ))}
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
    </div>
  );
}
