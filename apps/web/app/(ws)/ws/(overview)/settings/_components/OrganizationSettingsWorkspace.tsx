"use client";

import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";
import type { OrganizationSummary } from "@/server/contracts/organizations";

function resolveOrganizationStatusLabel(
  status: OrganizationSummary["status"],
  locale: "ar" | "en" | "fr",
) {
  if (status === "active") {
    return locale === "fr" ? "Actif" : locale === "en" ? "Active" : "نشط";
  }
  if (status === "pending") {
    return locale === "fr" ? "En attente" : locale === "en" ? "Pending" : "قيد الانتظار";
  }
  return locale === "fr" ? "Indisponible" : locale === "en" ? "Unavailable" : "غير متوفر";
}

/**
 * WHY:   Organization settings need one focused client controller for the current organization profile.
 * WHAT:  Renders identity metadata plus an editable form for organization details.
 * HOW:   Keeps localized UI state on the client while delegating persistence to the provided server action.
 */
export default function OrganizationSettingsWorkspace({
  organization,
  canManage,
  onSave,
}: {
  organization: OrganizationSummary | null;
  canManage: boolean;
  onSave: (input: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    phone?: string;
  }) => Promise<{ ok: true; message: string } | { ok: false; message: string }>;
}) {
  const { locale, dictionary, direction, isRtl } = useWebLocale();
  const [name, setName] = useState(organization?.name ?? "");
  const [description, setDescription] = useState(organization?.description ?? "");
  const [website, setWebsite] = useState(organization?.website ?? "");
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail ?? "");
  const [phone, setPhone] = useState(organization?.phone ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!organization) {
    return (
      <section className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6" dir={direction}>
        <h2 className="text-lg font-bold text-foreground">{dictionary.settings.organizationSettingsTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{dictionary.settings.organizationNoOrganization}</p>
      </section>
    );
  }

  const summaryItems = [
    { label: dictionary.settings.organizationSlug, value: organization.slug, valueDir: "ltr" as const },
    { label: dictionary.settings.organizationStatus, value: resolveOrganizationStatusLabel(organization.status, locale) },
    {
      label: dictionary.settings.organizationType,
      value: organization.type === "red" ? dictionary.settings.organizationTypeDeveloper : dictionary.settings.organizationTypeBroker,
    },
    {
      label: dictionary.settings.organizationVerified,
      value: organization.isVerified ? dictionary.settings.organizationVerifiedYes : dictionary.settings.organizationVerifiedNo,
    },
  ];

  return (
    <section className="space-y-5 pb-12" dir={direction}>
      <div className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
        <div className={cn("space-y-1", isRtl ? "text-right" : "text-left")}>
          <h2 className="text-lg font-bold text-foreground">{dictionary.settings.organizationSettingsTitle}</h2>
          <p className="text-sm text-muted-foreground">{dictionary.settings.organizationSettingsDescription}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-[18px] bg-background/65 px-4 py-3">
              <div className="text-[11px] font-semibold text-muted-foreground">{item.label}</div>
              <div className="mt-1 text-[13px] font-bold text-foreground" dir={item.valueDir ?? direction}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

          <form
            className="mt-6 space-y-6"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!canManage) {
                setStatus(dictionary.settings.organizationManagerRequired);
                return;
              }

              setIsSaving(true);
              const result = await onSave({
                name,
                description: description.trim().length > 0 ? description : undefined,
                website: website.trim().length > 0 ? website : undefined,
                contactEmail: contactEmail.trim().length > 0 ? contactEmail : undefined,
                phone: phone.trim().length > 0 ? phone : undefined,
              });
              setStatus(result.message);
              setIsSaving(false);
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.organizationNameLabel}</label>
                <input
                  type="text"
                  name="organizationName"
                  autoComplete="organization"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!canManage || isSaving}
                  className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.organizationDescriptionLabel}</label>
                <textarea
                  name="organizationDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={!canManage || isSaving}
                  rows={4}
                  className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-[12px] font-medium text-muted-foreground">{dictionary.settings.organizationDescriptionHint}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.organizationWebsiteLabel}</label>
                <input
                  type="url"
                  name="organizationWebsite"
                  autoComplete="url"
                  spellCheck={false}
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  disabled={!canManage || isSaving}
                  placeholder="https://example.com"
                  dir="ltr"
                  className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.organizationEmailLabel}</label>
                <input
                  type="email"
                  name="organizationEmail"
                  autoComplete="email"
                  spellCheck={false}
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  disabled={!canManage || isSaving}
                  placeholder="contact@example.com"
                  dir="ltr"
                  className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-semibold text-foreground">{dictionary.settings.organizationPhoneLabel}</label>
                <input
                  type="tel"
                  name="organizationPhone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={!canManage || isSaving}
                  placeholder="+966500000000"
                  dir="ltr"
                  className="w-full rounded-[16px] border border-border/60 bg-background/70 px-4 py-3 text-[14px] font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div aria-live="polite" className="min-h-[20px] text-[13px] font-medium text-muted-foreground">
                {status}
              </div>
              <button
                type="submit"
                disabled={!canManage || isSaving}
                className="inline-flex items-center justify-center rounded-[16px] bg-[var(--workspace-highlight)] px-5 py-3 text-[13px] font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? dictionary.settings.organizationSaving : dictionary.settings.organizationSave}
              </button>
            </div>
          </form>
      </div>
    </section>
  );
}
