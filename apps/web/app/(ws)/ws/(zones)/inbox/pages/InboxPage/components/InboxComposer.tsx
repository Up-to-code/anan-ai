"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Building2,
  FileText,
  Loader2,
  Paperclip,
  SendHorizontal,
  ShieldCheck,
  Smile,
} from "lucide-react";
import {
  COMPOSER_ATTACHMENT_ACCEPT,
  validateSupportedAttachmentFiles,
} from "@/app/(ws)/ws/_components/attachments/attachmentPresentation";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { OfferActionResult } from "@/server/contracts/offers";
import {
  buildDefaultOfferForm,
  InboxInlineSharePanel,
  InboxOfferModal,
  InboxProjectPickerModal,
  InboxQuickShareMenu,
  type ComposerOfferFormState,
  type ComposerProjectOption,
  type InboxShareAction,
} from "./InboxComposerActions";

type ShareActionResult = { error: string | null; didMutate: boolean };

function buildOfferPayload(offerForm: ComposerOfferFormState) {
  return {
    propertyId: offerForm.propertyId,
    price: Number(offerForm.price.replace(/[^\d.]/g, "")) || 0,
    message: offerForm.title.trim() || undefined,
    description: offerForm.description.trim() || undefined,
    attachments: offerForm.attachments ?? [],
  };
}

async function executeShareAction(params: {
  activeAction: Exclude<InboxShareAction, "offer"> | null;
  selectedFile: UploadedFileReference | null;
  shareFileNote: string;
  selectedProjectId: string;
  projectNote: string;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
}): Promise<ShareActionResult> {
  if (params.activeAction === "file") {
    if (!params.selectedFile) return { error: "MISSING_FILE", didMutate: false };
    await params.onShareFile(params.selectedFile, params.shareFileNote.trim() || undefined);
    return { error: null, didMutate: true };
  }

  if (params.activeAction === "project") {
    if (!params.selectedProjectId) return { error: "MISSING_PROJECT", didMutate: false };
    await params.onShareProject(params.selectedProjectId, params.projectNote.trim() || undefined);
    return { error: null, didMutate: true };
  }

  return { error: null, didMutate: false };
}

/**
 * WHY:   Composer keyboard behavior should stay testable without a browser-specific harness.
 * WHAT:  Resolves whether a given key press should trigger an inbox send action.
 * HOW:   Treats Enter as submit only when Shift is not pressed, leaving all other combinations as normal typing.
 */
export function getInboxComposerKeyAction(key: string, shiftKey: boolean) {
  if (key === "Enter" && !shiftKey) {
    return "send";
  }
  return "none";
}

/**
 * WHY:   The thread composer should expose one stable rule for when sending is allowed.
 * WHAT:  Returns whether the current draft should disable the send action.
 * HOW:   Disables send when a mutation is in flight or the trimmed draft is empty.
 */
export function isInboxComposerSendDisabled(draft: string, isSending = false) {
  return isSending || draft.trim().length === 0;
}

function ShareButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] transition-all duration-300 active:scale-95 shadow-sm",
        "bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50",
        "dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-white dark:hover:border-white/[0.2] dark:hover:bg-white/[0.06]"
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <span className="truncate">{label}</span>
    </button>
  );
}

/**
 * WHY:   Broker↔developer inbox threads need one practical composer that keeps messaging and sharing lightweight.
 * WHAT:  Renders the simplified textarea, compact share menu, and quick offer modal for a selected conversation. (Refined: Modern & Clean).
 * HOW:   Keeps text replies primary, opens one share flow at a time, and routes all business actions through focused callbacks.
 */
export default function InboxComposer({
  activeShareAction,
  canUseBusinessActions = false,
  conversation,
  initialValue = "",
  isSending = false,
  onCreatePrivateOfferDraft,
  onPublishConversationOffer,
  onSend,
  onShareActionChange,
  onShareFile,
  onShareProject,
  projectOptions,
  sendError,
}: {
  activeShareAction: InboxShareAction | null;
  canUseBusinessActions?: boolean;
  conversation: ConversationDetail;
  initialValue?: string;
  isSending?: boolean;
  onCreatePrivateOfferDraft: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<OfferActionResult | void | null>;
  onPublishConversationOffer: (offerId: string) => Promise<OfferActionResult | void | null>;
  onSend: (message: string) => Promise<void>;
  onShareActionChange: (action: InboxShareAction | null) => void;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  projectOptions: ComposerProjectOption[];
  sendError?: string | null;
}) {
  const { dictionary, isRtl, direction } = useWebLocale();
  const [draft, setDraft] = useState(initialValue);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<ComposerOfferFormState>(() => buildDefaultOfferForm(projectOptions));
  const [projectNote, setProjectNote] = useState("");
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFileReference | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(projectOptions[0]?.id ?? "");
  const [shareFileNote, setShareFileNote] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offerFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startUpload: startFileUpload, isUploading: isFileUploading } = useUploadThing("crmDocuments");
  const { startUpload: startOfferUpload, isUploading: isOfferUploading } = useUploadThing("offerAttachments");

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
  }, [draft]);

  useEffect(() => {
    setDraft(initialValue);
    setLocalError(null);
    setIsShareMenuOpen(false);
    setSelectedFile(null);
    setShareFileNote("");
    setProjectNote("");
    setIsProjectPickerOpen(false);
    setSelectedProjectId(projectOptions[0]?.id ?? "");
    setOfferForm(buildDefaultOfferForm(projectOptions));
  }, [conversation.id, initialValue, projectOptions]);

  useEffect(() => {
    if (!selectedProjectId && projectOptions[0]?.id) {
      setSelectedProjectId(projectOptions[0].id);
    }
  }, [projectOptions, selectedProjectId]);

  useEffect(() => {
    if (!offerForm.propertyId && projectOptions[0]?.id) {
      setOfferForm(buildDefaultOfferForm(projectOptions));
    }
  }, [offerForm.propertyId, projectOptions]);

  const handleSubmit = async () => {
    if (isInboxComposerSendDisabled(draft, isSending)) {
      return;
    }

    const message = draft.trim();
    setLocalError(null);
    try {
      await onSend(message);
      setDraft("");
    } catch {
      setLocalError(dictionary.inbox.sendMessageFailed);
    }
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setLocalError(null);
    const validationError = validateSupportedAttachmentFiles(files);
    if (validationError) {
      setLocalError(validationError);
      event.target.value = "";
      return;
    }
    try {
      const uploaded = await startFileUpload([files[0]]);
      setSelectedFile((uploaded?.[0]?.serverData as UploadedFileReference | undefined) ?? null);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : dictionary.inbox.fileUploadFailed);
    } finally {
      event.target.value = "";
    }
  };

  const handleUploadOfferAttachments = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setLocalError(null);
    const validationError = validateSupportedAttachmentFiles(files);
    if (validationError) {
      setLocalError(validationError);
      event.target.value = "";
      return;
    }
    try {
      const uploaded = await startOfferUpload(files);
      const nextAttachments = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setOfferForm((current) => ({
        ...current,
        attachments: [...current.attachments, ...nextAttachments],
      }));
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : dictionary.inbox.offerUploadFailed);
    } finally {
      event.target.value = "";
    }
  };

  const resetShareState = () => {
    setSelectedFile(null);
    setShareFileNote("");
    setProjectNote("");
    onShareActionChange(null);
    setIsShareMenuOpen(false);
    setIsProjectPickerOpen(false);
  };

  const handleShareAction = async () => {
    setLocalError(null);
    try {
      const result = await executeShareAction({
        activeAction:
          activeShareAction === "file" || activeShareAction === "project"
            ? activeShareAction
            : null,
        selectedFile,
        shareFileNote,
        selectedProjectId,
        projectNote,
        onShareFile,
        onShareProject,
      });

      if (result.error) {
        setLocalError(
          result.error === "MISSING_FILE"
            ? dictionary.inbox.chooseFileFirst
            : result.error === "MISSING_PROJECT"
              ? dictionary.inbox.chooseProjectFirst
              : result.error,
        );
        return;
      }

      if (result.didMutate) {
        resetShareState();
      }
    } catch {
      // Parent surfaces stable server errors through `sendError`.
    }
  };

  const handleSubmitOffer = async () => {
    if (!offerForm.propertyId || !offerForm.price.trim()) {
      setLocalError(dictionary.inbox.chooseProjectAndPriceFirst);
      return;
    }

    setLocalError(null);
    try {
      const created = await onCreatePrivateOfferDraft(buildOfferPayload(offerForm));
      if (created && typeof created === "object" && "offerId" in created) {
        await onPublishConversationOffer(created.offerId);
      }
      setOfferForm(buildDefaultOfferForm(projectOptions));
      onShareActionChange(null);
      setIsShareMenuOpen(false);
    } catch {
      // Parent surfaces stable server errors through `sendError`.
    }
  };

  const handleSelectOfferProject = (projectId: string) => {
    const project = projectOptions.find((entry) => entry.id === projectId) ?? null;
    setOfferForm((current) => ({
      ...current,
      propertyId: projectId,
      title:
        current.title.trim().length === 0 || current.title.startsWith("عرض خاص على ")
          ? project?.title
            ? `عرض خاص على ${project.title}`
            : current.title
          : current.title,
      price: project?.price ? String(project.price) : current.price,
    }));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (getInboxComposerKeyAction(event.key, event.shiftKey) === "send") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const inlineShareAction =
    activeShareAction === "file" || activeShareAction === "project" ? activeShareAction : null;

  const handleComposerDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length === 0) {
      return;
    }

    const validationError = validateSupportedAttachmentFiles(files);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    const target = { files: event.dataTransfer.files, value: "" } as EventTarget & HTMLInputElement;
    await handleUploadFile({ target } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <>
      <div className="border-t border-border/40 bg-background px-4 py-8 transition-all sm:px-6" dir={direction}>
        <div className="mx-auto max-w-4xl">
          {sendError || localError ? (
            <div className={cn("mb-4 rounded-3xl border border-red-500/10 bg-red-50/50 backdrop-blur-xl px-6 py-4 text-[13px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400 shadow-sm transition-all duration-500", isRtl ? "text-right" : "text-left")}>
              {sendError || localError}
            </div>
          ) : null}

          {canUseBusinessActions ? (
            <div className={cn("mb-6 flex flex-wrap gap-2", isRtl ? "flex-row-reverse" : "flex-row")}>
              <ShareButton
                icon={FileText}
                label={dictionary.inbox.shareFile}
                onClick={() => onShareActionChange("file")}
              />
              <ShareButton
                icon={ShieldCheck}
                label={dictionary.inbox.sharePrivateOffer}
                onClick={() => onShareActionChange("offer")}
              />
              <ShareButton
                icon={Building2}
                label={dictionary.inbox.shareProject}
                onClick={() => onShareActionChange("project")}
              />
            </div>
          ) : null}

          {inlineShareAction ? (
            <div className="mb-4">
              <InboxInlineSharePanel
                activeAction={inlineShareAction}
                fileInputRef={fileInputRef}
                handleUploadFile={handleUploadFile}
                isUploading={isFileUploading}
                onClose={resetShareState}
                onSubmit={handleShareAction}
                projectNote={projectNote}
                projectOptions={projectOptions}
                selectedFile={selectedFile}
                selectedProjectId={selectedProjectId}
                setSelectedFile={setSelectedFile}
                setProjectNote={setProjectNote}
                setSelectedProjectId={setSelectedProjectId}
                setShareFileNote={setShareFileNote}
                shareFileNote={shareFileNote}
                onOpenProjectPicker={() => setIsProjectPickerOpen(true)}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative rounded-2xl transition-all duration-500",
              "bg-white/40 backdrop-blur-3xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]",
              "dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-none",
              "focus-within:bg-white/60 dark:focus-within:bg-white/[0.06] focus-within:border-white/60 dark:focus-within:border-white/20 focus-within:shadow-2xl focus-within:shadow-black/[0.02]",
              isDraggingFiles && "border-blue-400 bg-blue-50/70 dark:border-blue-400/50 dark:bg-blue-500/10",
              isSending && "opacity-50 grayscale cursor-not-allowed",
            )}
            onDragEnter={(event) => {
              event.preventDefault();
              if (isSending) return;
              setIsDraggingFiles(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (isSending) return;
              event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setIsDraggingFiles(false);
            }}
            onDrop={(event) => void handleComposerDrop(event)}
          >
            {isDraggingFiles ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-blue-500/8 backdrop-blur-[2px]">
                <div className="rounded-full border border-blue-300 bg-white px-5 py-2 text-[12px] font-black text-blue-700 shadow-sm dark:border-blue-500/30 dark:bg-slate-950 dark:text-blue-200">
                  {dictionary.inbox.dropAttachment}
                </div>
              </div>
            ) : null}
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={dictionary.inbox.composerPlaceholder}
              disabled={isSending}
              dir={isRtl ? "rtl" : "ltr"}
              className={cn(
                "w-full resize-none bg-transparent px-8 py-6 text-[15px] font-semibold leading-relaxed outline-none ring-0 appearance-none transition-colors",
                "text-slate-900 placeholder:text-slate-400/50",
                "dark:text-white dark:[-webkit-text-fill-color:white] dark:placeholder:text-white/20 caret-current",
                isRtl ? "text-right" : "text-left",
              )}
            />
            <div className={cn("flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-1", isRtl ? "flex-row-reverse" : "flex-row")}>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSending || !draft.trim()}
                className={cn(
                  "flex h-11 shrink-0 items-center gap-2 rounded-xl px-5 text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-500 active:scale-95 shadow-lg",
                  draft.trim() 
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:shadow-xl hover:-translate-y-0.5" 
                    : "bg-slate-200 text-slate-400 opacity-50 grayscale dark:bg-white/5 dark:text-white/10"
                )}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                <span>{isSending ? dictionary.inbox.sending : dictionary.inbox.send}</span>
              </button>

              <div className={cn("flex items-center gap-1.5", isRtl ? "flex-row-reverse pr-1" : "flex-row pl-1")}>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all duration-500 hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all duration-500 hover:bg-slate-100/50 hover:text-slate-900 dark:text-white/30 dark:hover:bg-white/5 dark:hover:text-white"
                  aria-label={dictionary.inbox.attachFile}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={COMPOSER_ATTACHMENT_ACCEPT}
                  className="hidden"
                  onChange={(event) => void handleUploadFile(event)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <InboxOfferModal
        conversationLabel={conversation.otherUser.name}
        fileInputRef={offerFileInputRef}
        handleUploadOfferAttachments={handleUploadOfferAttachments}
        handleSelectOfferProject={handleSelectOfferProject}
        isOpen={activeShareAction === "offer"}
        isSending={isSending}
        isUploading={isOfferUploading}
        offerForm={offerForm}
        onClose={() => onShareActionChange(null)}
        onSubmit={handleSubmitOffer}
        projectOptions={projectOptions}
        setOfferForm={setOfferForm}
      />

      <InboxProjectPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectProject={setSelectedProjectId}
        projectOptions={projectOptions}
        selectedProjectId={selectedProjectId}
      />
    </>
  );
}
