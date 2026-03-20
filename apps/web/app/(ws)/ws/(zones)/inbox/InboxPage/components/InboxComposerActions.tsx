"use client";

import type { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from "react";
import { Paperclip } from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";

export type ComposerProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
};

export type ComposerDealOption = {
  id: string;
  title: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number;
  contactName?: string | null;
};

export type ComposerAction = "file" | "project" | "deal" | "offer";

export type ComposerOfferFormState = {
  propertyId: string;
  title: string;
  description: string;
  price: string;
};

const BUSINESS_ACTIONS: Array<{ id: ComposerAction; label: string }> = [
  { id: "file", label: "مشاركة ملف" },
  { id: "project", label: "مشاركة مشروع" },
  { id: "deal", label: "مشاركة صفقة" },
  { id: "offer", label: "عرض خاص" },
];

type InboxComposerActionsProps = {
  activeAction: ComposerAction | null;
  canUseBusinessActions: boolean;
  dealNote: string;
  dealOptions: ComposerDealOption[];
  fileInputRef: MutableRefObject<HTMLInputElement | null>;
  handleUploadFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  isSending: boolean;
  isUploading: boolean;
  offerForm: ComposerOfferFormState;
  onShareAction: () => Promise<void>;
  projectNote: string;
  projectOptions: ComposerProjectOption[];
  selectedDealId: string;
  selectedFile: UploadedFileReference | null;
  selectedProjectId: string;
  setActiveAction: Dispatch<SetStateAction<ComposerAction | null>>;
  setDealNote: Dispatch<SetStateAction<string>>;
  setOfferForm: Dispatch<SetStateAction<ComposerOfferFormState>>;
  setProjectNote: Dispatch<SetStateAction<string>>;
  setSelectedDealId: Dispatch<SetStateAction<string>>;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  setShareFileNote: Dispatch<SetStateAction<string>>;
  shareFileNote: string;
};

function getActionButtonClass(isActive: boolean) {
  return `border px-3 py-2 text-xs font-bold transition ${isActive
    ? "border-slate-900 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
    }`;
}

function ActionToggleButtons({ activeAction, setActiveAction }: Pick<InboxComposerActionsProps, "activeAction" | "setActiveAction">) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {BUSINESS_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => setActiveAction((current) => (current === action.id ? null : action.id))}
          className={getActionButtonClass(activeAction === action.id)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function FileActionFields({
  fileInputRef,
  handleUploadFile,
  isUploading,
  selectedFile,
  setShareFileNote,
  shareFileNote,
}: Pick<InboxComposerActionsProps, "fileInputRef" | "handleUploadFile" | "isUploading" | "selectedFile" | "setShareFileNote" | "shareFileNote">) {
  return (
    <>
      <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => void handleUploadFile(event)} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {isUploading ? "جارٍ رفع الملف..." : "اختر ملفًا"}
        </button>
        {selectedFile ? <span className="text-xs font-medium text-slate-600">{selectedFile.name}</span> : null}
      </div>
      <input
        type="text"
        value={shareFileNote}
        onChange={(event) => setShareFileNote(event.target.value)}
        placeholder="ملاحظة قصيرة مع الملف"
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
    </>
  );
}

function ProjectActionFields({
  projectNote,
  projectOptions,
  selectedProjectId,
  setProjectNote,
  setSelectedProjectId,
}: Pick<InboxComposerActionsProps, "projectNote" | "projectOptions" | "selectedProjectId" | "setProjectNote" | "setSelectedProjectId">) {
  return (
    <>
      <select
        value={selectedProjectId}
        onChange={(event) => setSelectedProjectId(event.target.value)}
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      >
        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>{project.title} - {project.location}</option>
        ))}
      </select>
      <input
        type="text"
        value={projectNote}
        onChange={(event) => setProjectNote(event.target.value)}
        placeholder="ماذا تريد أن توضّح حول هذا المشروع؟"
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
    </>
  );
}

function DealActionFields({
  dealNote,
  dealOptions,
  selectedDealId,
  setDealNote,
  setSelectedDealId,
}: Pick<InboxComposerActionsProps, "dealNote" | "dealOptions" | "selectedDealId" | "setDealNote" | "setSelectedDealId">) {
  return (
    <>
      <select
        value={selectedDealId}
        onChange={(event) => setSelectedDealId(event.target.value)}
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      >
        {dealOptions.map((deal) => (
          <option key={deal.id} value={deal.id}>{deal.title} - {deal.contactName ?? deal.stage}</option>
        ))}
      </select>
      <input
        type="text"
        value={dealNote}
        onChange={(event) => setDealNote(event.target.value)}
        placeholder="ملاحظة قصيرة مع الصفقة"
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
    </>
  );
}

function OfferActionFields({ offerForm, projectOptions, setOfferForm }: Pick<InboxComposerActionsProps, "offerForm" | "projectOptions" | "setOfferForm">) {
  return (
    <>
      <select
        value={offerForm.propertyId}
        onChange={(event) => {
          const next = projectOptions.find((project) => project.id === event.target.value);
          setOfferForm((current) => ({ ...current, propertyId: event.target.value, price: next?.price ? String(next.price) : current.price }));
        }}
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      >
        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>{project.title} - {project.location}</option>
        ))}
      </select>
      <input
        type="text"
        value={offerForm.title}
        onChange={(event) => setOfferForm((current) => ({ ...current, title: event.target.value }))}
        placeholder="عنوان العرض"
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
      <textarea
        rows={3}
        value={offerForm.description}
        onChange={(event) => setOfferForm((current) => ({ ...current, description: event.target.value }))}
        placeholder="وصف مختصر لهذا العرض الخاص"
        className="w-full resize-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
      <input
        type="text"
        value={offerForm.price}
        onChange={(event) => setOfferForm((current) => ({ ...current, price: event.target.value }))}
        placeholder="السعر"
        className="w-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none"
      />
    </>
  );
}

function ActionFooter({ activeAction, isSending, isUploading, onShareAction, setActiveAction }: Pick<InboxComposerActionsProps, "activeAction" | "isSending" | "isUploading" | "onShareAction" | "setActiveAction">) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => setActiveAction(null)}
        className="border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
      >
        إغلاق
      </button>
      <button
        type="button"
        disabled={isSending || isUploading}
        onClick={() => void onShareAction()}
        className="border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:border-blue-600 hover:bg-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {activeAction === "offer" ? "إنشاء العرض" : "إرسال البطاقة"}
      </button>
    </div>
  );
}

function ActiveActionFields(props: InboxComposerActionsProps & { activeAction: ComposerAction }) {
  switch (props.activeAction) {
    case "file":
      return <FileActionFields {...props} />;
    case "project":
      return <ProjectActionFields {...props} />;
    case "deal":
      return <DealActionFields {...props} />;
    case "offer":
      return <OfferActionFields {...props} />;
    default:
      return null;
  }
}

export function InboxComposerActions(props: InboxComposerActionsProps) {
  const { activeAction, canUseBusinessActions } = props;
  if (!canUseBusinessActions) {
    return null;
  }

  return (
    <div className="mb-3 border border-slate-200 bg-slate-50 p-3">
      <ActionToggleButtons activeAction={activeAction} setActiveAction={props.setActiveAction} />
      {activeAction ? (
        <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3">
          <ActiveActionFields {...props} activeAction={activeAction} />
          <ActionFooter {...props} activeAction={activeAction} />
        </div>
      ) : null}
    </div>
  );
}
