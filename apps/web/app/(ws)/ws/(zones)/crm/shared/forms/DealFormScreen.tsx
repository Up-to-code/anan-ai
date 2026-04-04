"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { DealRelationType } from "@/server/contracts/deals";
import type {
  DealFormBrokerOption,
  DealFormClientOption,
  DealFormProjectOption,
} from "../../types/crmTypes";

type DealFormData = {
  name: string;
  phone: string;
  budget: string;
  preference: string;
  propertyId: string;
  relationType: DealRelationType;
  crmClientId: string;
  relatedBrokerId: string;
  nextFollowUpAt: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  notes: string;
};

function matchesText(value: string, query: string) {
  if (!query.trim()) return true;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function ProjectPicker({
  projects,
  selectedProjectId,
  query,
  onQueryChange,
  onSelect,
}: {
  projects: DealFormProjectOption[];
  selectedProjectId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (projectId: string) => void;
}) {
  const { locale } = useWebLocale();
  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        [project.title, project.location, project.summary, project.priceLabel].some((value) =>
          matchesText(value, query),
        ),
      ),
    [projects, query],
  );
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
          {locale === "fr" ? "Projet lié" : locale === "en" ? "Linked project" : "المشروع المرتبط"}
        </label>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={locale === "fr" ? "Rechercher par nom, lieu ou description" : locale === "en" ? "Search by name, location, or description" : "ابحث بالاسم أو الموقع أو الوصف"}
          className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-[14px] font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
        />
      </div>

      {selectedProject ? (
        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedProject.image} alt={selectedProject.title} className="h-20 w-24 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 text-right">
              <div className="text-sm font-black text-foreground">{selectedProject.title}</div>
              <div className="mt-1 text-xs font-bold text-muted-foreground">{selectedProject.location}</div>
              <div className="mt-2 text-xs font-medium leading-6 text-foreground/80">{selectedProject.summary}</div>
              <div className="mt-2 text-[11px] font-black tracking-[0.12em] text-blue-700">{selectedProject.priceLabel}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-muted/5 p-3">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`w-full rounded-2xl border px-4 py-3 text-right text-sm font-bold transition ${
            !selectedProjectId ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
          }`}
        >
          {locale === "fr" ? "Sans projet" : locale === "en" ? "No project" : "بدون مشروع"}
        </button>
        {filteredProjects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            className={`w-full rounded-2xl border p-3 text-right transition ${
              selectedProjectId === project.id ? "border-blue-600 bg-blue-50" : "border-border bg-card hover:border-foreground/20"
            }`}
          >
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image} alt={project.title} className="h-16 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-foreground">{project.title}</div>
                <div className="mt-1 text-[12px] font-bold text-muted-foreground">{project.location}</div>
                <div className="mt-2 line-clamp-2 text-[12px] font-medium leading-5 text-foreground/80">{project.summary}</div>
                <div className="mt-2 text-[11px] font-black tracking-[0.12em] text-blue-700">{project.priceLabel}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RelationTypeTabs({
  value,
  onChange,
}: {
  value: DealRelationType;
  onChange: (value: DealRelationType) => void;
}) {
  const { locale } = useWebLocale();
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("internal_client")}
        className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
          value === "internal_client" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
        }`}
      >
        {locale === "fr" ? "Client interne" : locale === "en" ? "Internal client" : "عميل داخلي"}
      </button>
      <button
        type="button"
        onClick={() => onChange("broker_managed")}
        className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
          value === "broker_managed" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
        }`}
      >
        {locale === "fr" ? "Client via courtier" : locale === "en" ? "Broker-managed client" : "عميل عبر وسيط"}
      </button>
    </div>
  );
}

function InternalClientPicker({
  clients,
  selectedClientId,
  query,
  onQueryChange,
  onSelect,
}: {
  clients: DealFormClientOption[];
  selectedClientId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (clientId: string) => void;
}) {
  const { locale } = useWebLocale();
  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        [client.name, client.phone ?? "", client.notes ?? ""].some((value) => matchesText(value, query)),
      ),
    [clients, query],
  );
  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={locale === "fr" ? "Rechercher par nom ou téléphone du client" : locale === "en" ? "Search by client name or phone" : "ابحث باسم العميل أو هاتفه"}
        className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-[14px] font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
      />
      {selectedClient ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-right">
          <div className="text-sm font-black text-foreground">{selectedClient.name}</div>
          <div className="mt-1 text-xs font-bold text-muted-foreground">{selectedClient.phone ?? (locale === "fr" ? "Sans téléphone" : locale === "en" ? "No phone" : "بدون هاتف")}</div>
          <div className="mt-2 text-xs font-medium leading-6 text-foreground/80">{selectedClient.notes ?? (locale === "fr" ? "Fiche interne prête à être liée." : locale === "en" ? "Internal record ready to link." : "سجل داخلي جاهز للربط.")}</div>
        </div>
      ) : null}
      <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-muted/5 p-3">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={`w-full rounded-2xl border px-4 py-3 text-right text-sm font-bold transition ${
            !selectedClientId ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
          }`}
        >
          {locale === "fr" ? "Créer ou utiliser un nouveau client à partir du nom saisi" : locale === "en" ? "Create or use a new client from the entered name" : "إنشاء/استخدام عميل جديد من الاسم المكتوب"}
        </button>
        {filteredClients.map((client) => (
          <button
            key={client.id}
            type="button"
            onClick={() => onSelect(client.id)}
            className={`w-full rounded-2xl border p-3 text-right transition ${
              selectedClientId === client.id ? "border-emerald-600 bg-emerald-50" : "border-border bg-card hover:border-foreground/20"
            }`}
          >
            <div className="text-sm font-black text-foreground">{client.name}</div>
            <div className="mt-1 text-[12px] font-bold text-muted-foreground">{client.phone ?? (locale === "fr" ? "Sans téléphone" : locale === "en" ? "No phone" : "بدون هاتف")}</div>
            <div className="mt-2 line-clamp-2 text-[12px] font-medium leading-5 text-foreground/80">{client.notes ?? (locale === "fr" ? "Client interne." : locale === "en" ? "Internal client." : "عميل داخلي.")}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BrokerPicker({
  brokers,
  selectedBrokerId,
  query,
  onQueryChange,
  onSelect,
}: {
  brokers: DealFormBrokerOption[];
  selectedBrokerId: string;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (brokerId: string) => void;
}) {
  const { locale } = useWebLocale();
  const filteredBrokers = useMemo(
    () =>
      brokers.filter((broker) =>
        [broker.name, broker.description ?? "", broker.phone ?? ""].some((value) => matchesText(value, query)),
      ),
    [brokers, query],
  );
  const selectedBroker = brokers.find((broker) => broker.id === selectedBrokerId) ?? null;

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={locale === "fr" ? "Rechercher par nom du courtier" : locale === "en" ? "Search by broker name" : "ابحث باسم الوسيط"}
        className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3 text-[14px] font-medium text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
      />
      {selectedBroker ? (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-right">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-foreground">{selectedBroker.name}</div>
              <div className="mt-1 text-xs font-bold text-muted-foreground">{selectedBroker.phone ?? (locale === "fr" ? "Sans téléphone" : locale === "en" ? "No phone" : "بدون هاتف")}</div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-white px-3 py-2 text-sm font-black text-blue-700">
              {selectedBroker.avatarLabel}
            </div>
          </div>
          <div className="mt-3 text-xs font-medium leading-6 text-foreground/80">
            {selectedBroker.description ?? (locale === "fr" ? "Le suivi du courtier apparaîtra ici une fois lié au client." : locale === "en" ? "The broker follow-up status will appear here once linked to the client." : "سيتم عرض حالة متابعة الوسيط لهذا العميل عند الربط.")}
          </div>
          <div className="mt-2 text-[11px] font-black tracking-[0.12em] text-blue-700">
            {selectedBroker.stateLabel ?? (locale === "fr" ? "Le statut du courtier apparaîtra sur la carte" : locale === "en" ? "Broker status will appear on the card" : "حالة الوسيط ستظهر في البطاقة")}
          </div>
        </div>
      ) : null}
      <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-muted/5 p-3">
        {filteredBrokers.map((broker) => (
          <button
            key={broker.id}
            type="button"
            onClick={() => onSelect(broker.id)}
            className={`w-full rounded-2xl border p-3 text-right transition ${
              selectedBrokerId === broker.id ? "border-blue-600 bg-blue-50" : "border-border bg-card hover:border-foreground/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-foreground">{broker.name}</div>
                <div className="mt-1 text-[12px] font-bold text-muted-foreground">{broker.phone ?? (locale === "fr" ? "Sans téléphone" : locale === "en" ? "No phone" : "بدون هاتف")}</div>
                <div className="mt-2 line-clamp-2 text-[12px] font-medium leading-5 text-foreground/80">{broker.description ?? (locale === "fr" ? "Courtier disponible pour la liaison." : locale === "en" ? "Broker available for linking." : "وسيط متاح للربط.")}</div>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-white px-3 py-2 text-sm font-black text-blue-700">
                {broker.avatarLabel}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * WHY:   CRM create/edit pages need one client-side screen that can submit server actions and keep the workspace UX consistent.
 * WHAT:  Renders the deal fields shared between create and edit, including visual project and relationship selectors.
 * HOW:   Stores form state locally, previews the selected project/client/broker, calls the provided server actions, and redirects using the returned workspace paths.
 */
export default function DealFormScreen({
  pageTitle,
  pageDescription,
  submitLabel,
  cancelHref,
  projects,
  clients,
  brokers,
  initialData,
  onSubmit,
  onArchive,
}: {
  pageTitle: string;
  pageDescription: string;
  submitLabel: string;
  cancelHref: string;
  projects: DealFormProjectOption[];
  clients: DealFormClientOption[];
  brokers: DealFormBrokerOption[];
  initialData: DealFormData;
  onSubmit: (data: DealFormData) => Promise<{ redirectTo: string }>;
  onArchive?: () => Promise<{ redirectTo: string }>;
}) {
  const { locale, dictionary } = useWebLocale();
  const stageOptions: Array<{ value: DealFormData["stage"]; label: string }> = [
    { value: "new", label: locale === "fr" ? "Nouveau" : locale === "en" ? "New" : "جديد" },
    { value: "contacted", label: locale === "fr" ? "Contacté" : locale === "en" ? "Contacted" : "تم التواصل" },
    { value: "negotiation", label: locale === "fr" ? "Négociation" : locale === "en" ? "Negotiation" : "مفاوضة" },
    { value: "won", label: locale === "fr" ? "Conclu" : locale === "en" ? "Won" : "مغلقة" },
    { value: "lost", label: locale === "fr" ? "Perdu" : locale === "en" ? "Lost" : "خسارة" },
  ];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [archivePending, startArchiveTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [projectQuery, setProjectQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [form, setForm] = useState<DealFormData>(initialData);

  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/[0.02] md:p-10">
          <div className="space-y-1 text-right">
            <h1 className="text-2xl font-black tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-[14px] font-medium text-muted-foreground">{pageDescription}</p>
          </div>

          <form
            className="mt-8 grid gap-8"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              startTransition(async () => {
                try {
                  const result = await onSubmit(form);
                  router.push(result.redirectTo);
                } catch (submitError) {
                  setError(submitError instanceof Error ? submitError.message : (locale === "fr" ? "Impossible d'enregistrer l'opportunité maintenant." : locale === "en" ? "Could not save the deal right now." : "تعذر حفظ الصفقة الآن."));
                }
              });
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <ProjectPicker
                  projects={projects}
                  selectedProjectId={form.propertyId}
                  query={projectQuery}
                  onQueryChange={setProjectQuery}
                  onSelect={(propertyId) => setForm((current) => ({ ...current, propertyId }))}
                />

                <div className="space-y-4">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {locale === "fr" ? "Type de relation" : locale === "en" ? "Relation type" : "نوع الربط"}
                  </label>
                  <RelationTypeTabs
                    value={form.relationType}
                    onChange={(relationType) =>
                      setForm((current) => ({
                        ...current,
                        relationType,
                        crmClientId: relationType === "internal_client" ? current.crmClientId : "",
                        relatedBrokerId: relationType === "broker_managed" ? current.relatedBrokerId : "",
                      }))
                    }
                  />
                  {form.relationType === "internal_client" ? (
                    <InternalClientPicker
                      clients={clients}
                      selectedClientId={form.crmClientId}
                      query={personQuery}
                      onQueryChange={setPersonQuery}
                      onSelect={(crmClientId) => {
                        const selectedClient = clients.find((client) => client.id === crmClientId);
                        setForm((current) => ({
                          ...current,
                          crmClientId,
                          relatedBrokerId: "",
                          name: current.name || selectedClient?.name || current.name,
                          phone: current.phone || selectedClient?.phone || current.phone,
                        }));
                      }}
                    />
                  ) : (
                    <BrokerPicker
                      brokers={brokers}
                      selectedBrokerId={form.relatedBrokerId}
                      query={personQuery}
                      onQueryChange={setPersonQuery}
                      onSelect={(relatedBrokerId) =>
                        setForm((current) => ({
                          ...current,
                          relatedBrokerId,
                          crmClientId: "",
                        }))
                      }
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Nom du client / titre de l'opportunité" : locale === "en" ? "Client name / deal title" : "اسم العميل / عنوان الصفقة"}</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    required
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Téléphone" : locale === "en" ? "Phone number" : "رقم الهاتف"}</label>
                    <input
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                      className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{dictionary.crm.budget}</label>
                    <input
                      value={form.budget}
                      onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                      className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Étape" : locale === "en" ? "Stage" : "المرحلة"}</label>
                    <select
                      value={form.stage}
                      onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as DealFormData["stage"] }))}
                      className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                    >
                      {stageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Suivi" : locale === "en" ? "Follow-up time" : "موعد المتابعة"}</label>
                    <input
                      type="datetime-local"
                      value={form.nextFollowUpAt}
                      onChange={(event) => setForm((current) => ({ ...current, nextFollowUpAt: event.target.value }))}
                      className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Description / intérêt" : locale === "en" ? "Description / interest" : "الوصف / الاهتمام"}</label>
                  <textarea
                    rows={4}
                    value={form.preference}
                    onChange={(event) => setForm((current) => ({ ...current, preference: event.target.value }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">{locale === "fr" ? "Notes" : locale === "en" ? "Notes" : "الملاحظات"}</label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-[13px] font-bold text-rose-600">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-2xl bg-foreground px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-background shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {pending ? (locale === "fr" ? "Enregistrement..." : locale === "en" ? "Saving..." : "جارٍ الحفظ...") : submitLabel}
              </button>
              <Link
                href={cancelHref}
                className="flex-1 rounded-2xl border border-border px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]"
              >
                {locale === "fr" ? "Annuler" : locale === "en" ? "Cancel" : "إلغاء"}
              </Link>
              {onArchive ? (
                <button
                  type="button"
                  disabled={archivePending}
                  onClick={() => {
                    setError(null);
                    startArchiveTransition(async () => {
                      try {
                        const result = await onArchive();
                        router.push(result.redirectTo);
                      } catch (archiveError) {
                        setError(archiveError instanceof Error ? archiveError.message : (locale === "fr" ? "Impossible d'archiver l'opportunité maintenant." : locale === "en" ? "Could not archive the deal right now." : "تعذر أرشفة الصفقة الآن."));
                      }
                    });
                  }}
                  className="rounded-2xl border border-rose-500/30 px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 transition-all hover:bg-rose-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {archivePending ? (locale === "fr" ? "Archivage..." : locale === "en" ? "Archiving..." : "جارٍ الأرشفة...") : (locale === "fr" ? "Archiver l'opportunité" : locale === "en" ? "Archive deal" : "أرشفة الصفقة")}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
