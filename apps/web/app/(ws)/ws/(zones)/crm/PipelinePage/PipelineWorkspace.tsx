"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PersonCard from "../../../_components/Visuals/PersonCard";
import type { CrmClientRecord, PipelineStage } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

type PipelineWorkspaceProps = {
  initialClients: CrmClientRecord[];
  onStageChange?: (input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" | "lost" }) => Promise<void>;
  onFollowUpChange?: (input: { dealId: string; nextFollowUpAt: number }) => Promise<void>;
  onCreateClient?: (input: { name: string }) => Promise<void>;
};

const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "جديد",
  qualified: "مؤهل",
  proposal: "عرض",
  won: "مغلق",
  lost: "خسارة",
};
const STAGE_ORDER = Object.keys(STAGE_LABELS) as PipelineStage[];
const FOLLOW_UP_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeStyle: "short",
});

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateTimeLocalValue(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatFollowUpLabel(timestamp?: number): string {
  if (!timestamp) return "بدون متابعة محددة";
  return FOLLOW_UP_FORMATTER.format(new Date(timestamp));
}

function getFollowUpStatus(timestamp?: number): "overdue" | "soon" | "scheduled" | "none" {
  if (!timestamp) return "none";
  const now = Date.now();
  if (timestamp < now) return "overdue";
  if (timestamp <= now + DAY_IN_MS) return "soon";
  return "scheduled";
}

/**
 * WHY:   CRM needs a real pipeline board that reflects persisted deals instead of route-local mutations.
 * WHAT:  Renders the draggable deal board and delegates all writes to server actions passed from the route.
 * HOW:   Uses optimistic local stage updates for responsiveness, then refreshes from the server after each mutation.
 */
export default function PipelineWorkspace({
  initialClients,
  onStageChange,
  onFollowUpChange,
  onCreateClient,
}: PipelineWorkspaceProps) {
  const [clients, setClients] = useState(initialClients);
  const [activeFilter, setActiveFilter] = useState("all");
  const [draftName, setDraftName] = useState("");
  const [followUpDraftById, setFollowUpDraftById] = useState<Record<string, string>>(
    () =>
      initialClients.reduce<Record<string, string>>((acc, client) => {
        acc[client.id] = toDateTimeLocalValue(client.nextFollowUpAt);
        return acc;
      }, {}),
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const visibleClients = useMemo(
    () =>
      clients.filter((client) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "unlinked") return !client.project && !client.broker;
        if (activeFilter === "project-only") return Boolean(client.project) && !client.broker;
        if (activeFilter === "fully-linked") return Boolean(client.project) && Boolean(client.broker);
        if (activeFilter === "vip") return client.badges?.includes("vip");
        return true;
      }),
    [clients, activeFilter],
  );
  const clientsByStage = useMemo(() => {
    const grouped = STAGE_ORDER.reduce<Record<PipelineStage, CrmClientRecord[]>>(
      (acc, stage) => ({ ...acc, [stage]: [] }),
      {} as Record<PipelineStage, CrmClientRecord[]>,
    );
    for (const client of visibleClients) grouped[client.stage].push(client);
    return grouped;
  }, [visibleClients]);

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة العملاء"
        title="خط الأنابيب"
        description="بطاقات الأشخاص تمثل الصفقات الحقيقية في CRM، مع تحريك المراحل من نفس المصدر."
        actions={
          <div className="flex items-center gap-3">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.currentTarget.value)}
              placeholder="اسم صفقة أو عميل جديد"
              className="w-64 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                    router.refresh();
                  });
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-xs font-black tracking-[0.18em] text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              إضافة صفقة
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

        <div className="grid gap-4 lg:grid-cols-5">
          {STAGE_ORDER.map((stage) => (
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
                const stageMap: Record<PipelineStage, "new" | "contacted" | "negotiation" | "won" | "lost"> = {
                  new: "new",
                  qualified: "contacted",
                  proposal: "negotiation",
                  won: "won",
                  lost: "lost",
                };

                setClients((current) =>
                  current.map((client) => (client.id === draggedId ? { ...client, stage } : client)),
                );

                startTransition(() => {
                  void onStageChange({ dealId: draggedId, stage: stageMap[stage] }).then(() => router.refresh());
                });
                setDraggedId(null);
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-950">{STAGE_LABELS[stage]}</h2>
                <span className="text-xs font-black text-slate-400">
                  {clientsByStage[stage].length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {clientsByStage[stage].map((client) => {
                    const followUpStatus = getFollowUpStatus(client.nextFollowUpAt);
                    const followUpLabel =
                      followUpStatus === "overdue"
                        ? "متأخرة"
                        : followUpStatus === "soon"
                          ? "خلال 24 ساعة"
                          : followUpStatus === "scheduled"
                            ? "مجدولة"
                            : "بدون موعد";
                    const followUpTone =
                      followUpStatus === "overdue"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : followUpStatus === "soon"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : followUpStatus === "scheduled"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500";

                    return (
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
                            <div className={`inline-flex border px-2 py-1 text-[10px] font-black tracking-[0.14em] ${followUpTone}`}>
                              متابعة: {followUpLabel}
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                                المتابعة القادمة
                              </label>
                              <input
                                type="datetime-local"
                                value={followUpDraftById[client.id] ?? ""}
                                onChange={(event) =>
                                  setFollowUpDraftById((current) => ({
                                    ...current,
                                    [client.id]: event.currentTarget.value,
                                  }))
                                }
                                className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
                              />
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[11px] font-medium text-slate-500">{formatFollowUpLabel(client.nextFollowUpAt)}</div>
                                <button
                                  type="button"
                                  disabled={!onFollowUpChange || isPending || !followUpDraftById[client.id]}
                                  onClick={() => {
                                    const draftValue = followUpDraftById[client.id];
                                    const nextFollowUpAt = Date.parse(draftValue ?? "");
                                    if (!draftValue || Number.isNaN(nextFollowUpAt) || !onFollowUpChange) return;
                                    setClients((current) =>
                                      current.map((entry) =>
                                        entry.id === client.id
                                          ? { ...entry, nextFollowUpAt }
                                          : entry,
                                      ),
                                    );
                                    startTransition(() => {
                                      void onFollowUpChange({ dealId: client.id, nextFollowUpAt }).then(() => router.refresh());
                                    });
                                  }}
                                  className="border border-slate-300 bg-white px-3 py-2 text-[10px] font-black tracking-[0.16em] text-slate-700 transition hover:border-blue-600 hover:text-blue-700 disabled:opacity-50"
                                >
                                  حفظ المتابعة
                                </button>
                              </div>
                            </div>
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
                    );
                })}

                {clientsByStage[stage].length === 0 ? (
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
