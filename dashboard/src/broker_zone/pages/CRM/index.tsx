import { useRole } from "@/_core/hooks/useRole";
import { useState } from "react";
import {
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { cn } from "@/_core/lib/utils";
import { toast } from "sonner";
import { CRM_STAGE_META, type DealStage } from "@/shared_logic/crm/types";
import { useCrmBoard } from "@/shared_logic/crm/hooks/useCrmBoard";
import { useConvexBootstrapState } from "@/_core/hooks/useConvexBootstrapState";

/**
 * WHY:   Provides the central Kanban dashboard for tracking business deals and opportunities.
 * WHAT:  Renders a drag-and-drop board of deals grouped by pipeline stage.
 * HOW:   Acts as the Orchestrator for the CRM view. Uses `useCrmBoard` and `useConvexBootstrapState`.
 */
export default function CRM() {
  const role = useRole();
  const { shouldRunProtectedQueries } = useConvexBootstrapState();
  const { deals, isLoading, createDeal, updateDealStage, updateDealNotes } = useCrmBoard();
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    if (!shouldRunProtectedQueries) return;
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId) return;

    try {
      await updateDealStage(dealId, targetStage);
      toast.success("تم نقل الصفقة");
    } catch {
      toast.error("تعذر نقل الصفقة");
    }
  };

  const handleSaveNotes = async (dealId: string) => {
    if (!shouldRunProtectedQueries) return;
    try {
      await updateDealNotes(dealId, notesText);
      toast.success("تم حفظ الملاحظات");
      setEditingNotes(null);
    } catch {
      toast.error("تعذر حفظ الملاحظات");
    }
  };

  const handleCreateQuickDeal = async () => {
    if (!shouldRunProtectedQueries) {
      toast.info("يتم تهيئة الجلسة، حاول بعد ثوانٍ.");
      return;
    }
    try {
      await createDeal({
        title: "صفقة جديدة",
        stage: "new",
        description: "تم إنشاؤها من لوحة CRM",
      });
      toast.success("تم إنشاء صفقة جديدة");
    } catch {
      toast.error("تعذر إنشاء الصفقة");
    }
  };

  return (
    <div className="space-y-8">
      <div className="px-1 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة الصفقات</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {role === "RED"
              ? "تابع تقدّم الوسطاء على مشاريعك"
              : "تابع صفقاتك وتحديث حالتها مباشرة من قاعدة البيانات"}
          </p>
        </div>
        <button
          onClick={handleCreateQuickDeal}
          disabled={!shouldRunProtectedQueries}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          صفقة جديدة
        </button>
      </div>

      {isLoading ? (
        <div className="h-52 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500">
          جاري تحميل الصفقات...
        </div>
      ) : deals.length === 0 ? (
        <div className="h-52 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 text-sm font-medium">
          لا توجد صفقات بعد. ابدأ بإضافة صفقة جديدة أو انتظر اكتمال التوثيق.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {CRM_STAGE_META.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.key);
            return (
              <div
                key={stage.key}
                className="min-w-[280px] flex-1 flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn("h-2.5 w-2.5 rounded-full", stage.color)} />
                  <span className="text-xs font-bold text-slate-700">{stage.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal._id)}
                      className="bg-white rounded-xl border border-slate-200 p-4 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-all"
                    >
                      <h4 className="text-sm font-bold text-slate-900 mb-1">{deal.title}</h4>
                      {deal.description && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{deal.description}</p>
                      )}

                      {deal.value ? (
                        <div className="text-sm font-black text-blue-600 mb-2">
                          {deal.value.toLocaleString("ar-SA")} ر.س
                        </div>
                      ) : null}

                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {deal.brokerName && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                            وسيط: {deal.brokerName}
                          </span>
                        )}
                        {deal.redName && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                            مطور: {deal.redName}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setExpandedDeal(expandedDeal === deal._id ? null : deal._id)}
                        className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mt-1 hover:text-blue-700 transition-colors"
                      >
                        {expandedDeal === deal._id ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> إخفاء التفاصيل
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> عرض التفاصيل
                          </>
                        )}
                      </button>

                      {expandedDeal === deal._id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              ملاحظات
                            </div>
                            {editingNotes === deal._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  rows={3}
                                  placeholder="أضف ملاحظة..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveNotes(deal._id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                                  >
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {deal.notes ? (
                                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mb-1">{deal.notes}</p>
                                ) : (
                                  <p className="text-xs text-slate-400 italic mb-1">لا توجد ملاحظات</p>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingNotes(deal._id);
                                    setNotesText(deal.notes ?? "");
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                                >
                                  {deal.notes ? "تعديل" : "إضافة ملاحظة"}
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              المستندات
                            </div>
                            {deal.documentIds && deal.documentIds.length > 0 ? (
                              <div className="space-y-1">
                                {deal.documentIds.map((_, i) => (
                                  <div
                                    key={i}
                                    className="text-xs text-blue-600 font-medium flex items-center gap-1"
                                  >
                                    <FileText className="h-3 w-3" />
                                    مستند {i + 1}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">لا توجد مستندات</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
                      اسحب صفقة هنا
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
