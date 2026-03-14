"use client";

import { X, Folder, UserMinus } from "lucide-react";

/**
 * WHY:   A broker can work on multiple projects simultaneously. Users need to see and manage all of them.
 * WHAT:  Modal showing all projects a specific broker is linked to, with remove action per project.
 * HOW:   Controlled with open/onClose. Calls onRemoveFromProject(projectId) for removal.
 */

export type BrokerProjectLink = {
  projectId: string;
  projectTitle: string;
  projectLocation: string;
  stageLabel: string;
  unitLabel?: string | null;
  clientName?: string | null;
};

export default function AgBrokerProjectsModal({
  open,
  onClose,
  brokerName,
  brokerTitle,
  brokerAvatarImage,
  brokerAvatarLabel,
  projects,
  onRemoveFromProject,
}: {
  open: boolean;
  onClose: () => void;
  brokerName: string;
  brokerTitle?: string;
  brokerAvatarImage?: string;
  brokerAvatarLabel: string;
  projects: BrokerProjectLink[];
  onRemoveFromProject?: (projectId: string) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white shadow-[0_32px_80px_rgba(15,23,42,0.25)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="border-b border-slate-100 px-8 py-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden bg-slate-100">
              {brokerAvatarImage ? (
                <img src={brokerAvatarImage} alt={brokerName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl font-black text-slate-400">
                  {brokerAvatarLabel}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase mb-1">
                مشاريع الوسيط
              </div>
              <h2 className="text-xl font-black text-slate-950">{brokerName}</h2>
              {brokerTitle && (
                <div className="mt-0.5 text-sm font-bold text-slate-500">{brokerTitle}</div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-950 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Project count */}
        <div className="px-8 py-4 border-b border-slate-50 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-bold text-slate-600">
              {projects.length === 0
                ? "لا يوجد مشاريع مرتبطة"
                : `مرتبط بـ ${projects.length} ${projects.length === 1 ? "مشروع" : "مشاريع"}`}
            </span>
            <div className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-0.5">
              {projects.length}
            </div>
          </div>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-6">
          {projects.length === 0 ? (
            <div className="py-12 text-center">
              <Folder className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                لم يُربط هذا الوسيط بأي مشروع حتى الآن
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((proj) => (
                <div
                  key={proj.projectId}
                  className="flex items-start gap-4 border border-slate-100 bg-white p-5 hover:border-blue-200 transition"
                >
                  <div className="shrink-0 h-10 w-10 bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Folder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-sm font-black text-slate-950">{proj.projectTitle}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{proj.projectLocation}</div>
                    <div className="flex items-center justify-end gap-3 mt-2 flex-wrap">
                      <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-slate-600">
                        {proj.stageLabel}
                      </span>
                      {proj.unitLabel && (
                        <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-blue-700">
                          وحدة: {proj.unitLabel}
                        </span>
                      )}
                      {proj.clientName && (
                        <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-700">
                          عميل: {proj.clientName}
                        </span>
                      )}
                    </div>
                  </div>
                  {onRemoveFromProject && (
                    <button
                      type="button"
                      onClick={() => onRemoveFromProject(proj.projectId)}
                      title="إزالة من هذا المشروع"
                      className="shrink-0 flex items-center gap-1.5 border border-slate-200 px-3 py-2 text-[10px] font-black text-slate-400 hover:border-red-400 hover:text-red-600 transition"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      إزالة
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-8 py-4 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-950 transition"
          >
            إغلاق
          </button>
          <span className="text-[10px] font-bold text-slate-400">
            سجلات الوسيط — منطقة المشاريع
          </span>
        </div>
      </div>
    </div>
  );
}
