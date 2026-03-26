"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Calendar,
  FileText,
  Paperclip,
  SendHorizontal,
  ShieldCheck,
  Smile,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { OfferActionResult } from "@/server/contracts/offers";
import {
  buildDefaultOfferForm,
  InboxInlineSharePanel,
  InboxOfferModal,
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
    if (!params.selectedFile) return { error: "اختر ملفًا قبل الإرسال.", didMutate: false };
    await params.onShareFile(params.selectedFile, params.shareFileNote.trim() || undefined);
    return { error: null, didMutate: true };
  }

  if (params.activeAction === "project") {
    if (!params.selectedProjectId) return { error: "اختر عقارًا أو مشروعًا للمشاركة.", didMutate: false };
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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground transition-all hover:border-foreground/30 hover:bg-muted/30"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{label}</span>
    </button>
  );
}

/**
 * WHY:   Broker↔developer inbox threads need one practical composer that keeps messaging and sharing lightweight.
 * WHAT:  Renders the simplified textarea, compact share menu, and quick offer modal for a selected conversation.
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
  const [draft, setDraft] = useState(initialValue);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState<ComposerOfferFormState>(() => buildDefaultOfferForm(projectOptions));
  const [projectNote, setProjectNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<UploadedFileReference | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(projectOptions[0]?.id ?? "");
  const [shareFileNote, setShareFileNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const offerFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startUpload, isUploading } = useUploadThing("offerAttachments");

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
      setLocalError("تعذر إرسال الرسالة. يمكنك المحاولة مرة أخرى.");
    }
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setLocalError(null);
    try {
      const uploaded = await startUpload([files[0]]);
      setSelectedFile((uploaded?.[0]?.serverData as UploadedFileReference | undefined) ?? null);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "تعذر رفع الملف.");
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
    try {
      const uploaded = await startUpload(files);
      const nextAttachments = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setOfferForm((current) => ({
        ...current,
        attachments: [...current.attachments, ...nextAttachments],
      }));
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "تعذر رفع مرفقات العرض.");
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
        setLocalError(result.error);
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
      setLocalError("اختر عقارًا وحدد السعر قبل إرسال العرض.");
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (getInboxComposerKeyAction(event.key, event.shiftKey) === "send") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const inlineShareAction =
    activeShareAction === "file" || activeShareAction === "project" ? activeShareAction : null;

  return (
    <>
      <div className="border-t border-border/40 bg-background px-4 py-6 transition-all sm:px-6">
        <div className="mx-auto max-w-4xl">
          {sendError || localError ? (
            <div className="mb-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400">
              {sendError || localError}
            </div>
          ) : null}

          {canUseBusinessActions ? (
            <div className="mb-4 flex flex-wrap gap-2">
              <ShareButton
                icon={FileText}
                label="مشاركة ملف"
                onClick={() => onShareActionChange("file")}
              />
              <ShareButton
                icon={ShieldCheck}
                label="إرسال عرض"
                onClick={() => onShareActionChange("offer")}
              />
              <ShareButton
                icon={Calendar}
                label="تحديد موعد"
                onClick={() => onShareActionChange("project")}
              />
            </div>
          ) : null}

          {inlineShareAction ? (
            <div className="mb-3">
              <InboxInlineSharePanel
                activeAction={inlineShareAction}
                fileInputRef={fileInputRef}
                handleUploadFile={handleUploadFile}
                isUploading={isUploading}
                onClose={resetShareState}
                onSubmit={handleShareAction}
                projectNote={projectNote}
                projectOptions={projectOptions}
                selectedFile={selectedFile}
                selectedProjectId={selectedProjectId}
                setProjectNote={setProjectNote}
                setSelectedProjectId={setSelectedProjectId}
                setShareFileNote={setShareFileNote}
                shareFileNote={shareFileNote}
              />
            </div>
          ) : null}

          <div
            className={cn(
              "relative rounded-3xl border border-border bg-muted/10 p-2 shadow-sm transition-all focus-within:border-foreground/30 focus-within:bg-background shadow-black/5",
              isSending && "opacity-50 grayscale cursor-not-allowed",
            )}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك لوسيط العقارات..."
              disabled={isSending}
              className="w-full resize-none bg-transparent px-4 py-3.5 text-[15px] font-medium leading-relaxed text-foreground placeholder-muted-foreground/50 outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSending || !draft.trim()}
                className="flex items-center gap-2 rounded-2xl bg-foreground px-5 py-2.5 text-[13px] font-bold text-background transition-all hover:brightness-90 active:scale-95 disabled:scale-100 disabled:bg-muted disabled:text-muted-foreground"
              >
                <SendHorizontal className="h-4 w-4" />
                {isSending ? "جاري الإرسال" : "إرسال"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <InboxOfferModal
        conversationLabel={conversation.otherUser.name}
        fileInputRef={offerFileInputRef}
        handleUploadOfferAttachments={handleUploadOfferAttachments}
        isOpen={activeShareAction === "offer"}
        isSending={isSending}
        isUploading={isUploading}
        offerForm={offerForm}
        onClose={() => onShareActionChange(null)}
        onSubmit={handleSubmitOffer}
        projectOptions={projectOptions}
        setOfferForm={setOfferForm}
      />
    </>
  );
}
