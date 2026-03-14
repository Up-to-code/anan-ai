"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PersonCard from "../../../_components/Visuals/PersonCard";
import type { CrmClientRecord, PipelineStage } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

type PipelineWorkspaceProps = {
  initialClients: CrmClientRecord[];
  onStageChange?: (input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" }) => Promise<void>;
  onCreateClient?: (input: { name: string }) => Promise<void>;
};

const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "جديد",
  qualified: "مؤهل",
  proposal: "عرض",
  won: "مغلق",
};

/**
 * WHY:   CRM needs a real pipeline board that reflects persisted deals instead of route-local mutations.
 * WHAT:  Renders the draggable deal board and delegates all writes to server actions passed from the route.
 * HOW:   Uses optimistic local stage updates for responsiveness, then refreshes from the server after each mutation.
 */
export default function PipelineWorkspace({
  initialClients,
  onStageChange,
  onCreateClient,
}: PipelineWorkspaceProps) {
  const [clients, setClients] = useState(initialClients);
  const [activeFilter, setActiveFilter] = useState("all");
  const [draftName, setDraftName] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshPage() {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  const visibleClients = clients.filter((client) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unlinked") return !client.project && !client.broker;
    if (activeFilter === "project-only") return Boolean(client.project) && !client.broker;
    if (activeFilter === "fully-linked") return Boolean(client.project) && Boolean(client.broker);
    if (activeFilter === "vip") return client.badges?.includes("vip");
    return true;
  });

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة العملاء"
        title="خط الأنابيب"
        description="بطاقات الأشخاص تمثل الصفقات الحقيقية في CRM، مع تحريك المراحل من نفس المصدر."
        actions={
          <div className="flex items-center gap-2">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.currentTarget.value)}
              placeholder="اسم صفقة أو عميل جديد"
              className="border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
            />
            <button
              type="button"
              disabled={!onCreateClient || isPending}
              onClick={() => {
                const trimmedName = draftName.trim();
                if (!trimmedName || !onCreateClient) return;
                startTransition(() => {
                  void onCreateClient({ name: trimmedName }).then(() => {
                    setDraftName("");
                    refreshPage();
                  });
                });
              }}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              إضافة بطاقة
            </button>
          </div>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <FilterChipBar
          chips={[
            { key: "all", label: "الكل" },
            { key: "unlinked", label: "بدون روابط" },
            { key: "project-only", label: "مشروع فقط" },
            { key: "fully-linked", label: "مشروع + وسيط" },
            { key: "vip", label: "VIP" },
          ]}
          activeKey={activeFilter}
          onChange={setActiveFilter}
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {(Object.keys(STAGE_LABELS) as PipelineStage[]).map((stage) => (
            <section
              key={stage}
              className={`space-y-3 border p-4 transition duration-200 ${
                dragOverStage === stage
                  ? "border-blue-400 bg-blue-50/50 outline-dashed outline-2 outline-offset-[-2px] outline-blue-300"
                  : "border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                if (dragOverStage === stage) setDragOverStage(null);
              }}
              onDrop={() => {
                setDragOverStage(null);
                if (!draggedId || !onStageChange) return;
                const stageMap: Record<PipelineStage, "new" | "contacted" | "negotiation" | "won"> = {
                  new: "new",
                  qualified: "contacted",
                  proposal: "negotiation",
                  won: "won",
                };

                setClients((current) =>
                  current.map((client) => (client.id === draggedId ? { ...client, stage } : client)),
                );

                startTransition(() => {
                  void onStageChange({ dealId: draggedId, stage: stageMap[stage] }).then(() => refreshPage());
                });
                setDraggedId(null);
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-950">{STAGE_LABELS[stage]}</h2>
                <span className="text-xs font-black text-slate-400">
                  {visibleClients.filter((client) => client.stage === stage).length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {visibleClients
                  .filter((client) => client.stage === stage)
                  .map((client) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={() => setDraggedId(client.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <PersonCard
                        person={{
                          id: client.id,
                          type: client.personType,
                          name: client.name,
                          title: client.personType === "broker" ? "وسيط" : "عميل",
                          avatarImage: client.avatarImage,
                          avatarLabel: client.avatarLabel,
                          location: client.project?.location,
                          summary: client.preference,
                          stageLabel: STAGE_LABELS[client.stage],
                          badges: client.badges,
                          relation: {
                            project: client.project
                              ? {
                                  id: client.project.id,
                                  title: client.project.title,
                                  location: client.project.location,
                                }
                              : null,
                            unit: client.unit,
                            summary: client.notes,
                          },
                        }}
                        footer={
                          <div className="space-y-3 border-t border-slate-200 pt-3">
                            <div className="text-xs font-medium text-slate-500">{client.budgetLabel}</div>
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/ws/crm/clients/${client.id}`}
                                className="border border-blue-500 bg-blue-500 px-3 py-2 text-[10px] font-black tracking-[0.18em] text-white"
                              >
                                فتح
                              </Link>
                            </div>
                            <div className="text-[11px] font-medium text-slate-500">
                              تعديل العلاقات والمستندات يتم من سجل الصفقة الفعلي وليس من محاكاة محلية.
                            </div>
                          </div>
                        }
                      />
                    </div>
                  ))}

                {visibleClients.filter((client) => client.stage === stage).length === 0 ? (
                  <BrandEmptyState title="لا توجد بطاقات" description="اسحب بطاقة إلى هذا العمود أو أنشئ بطاقة جديدة." />
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
