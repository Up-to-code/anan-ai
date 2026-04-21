import Link from "next/link";
import { PlugZap } from "lucide-react";
import ConsentAutoSubmit from "./ConsentAutoSubmit";
import { PageHero, Section } from "@/app/(public)/public";
import type { OAuthAuthorizationPreview } from "../loaders";
import {
  buildApprovalStatus,
  getOAuthAuthorizeCopy,
  getSelectedOrganizationNotice,
  OrganizationApprovalAside,
  OrganizationPicker,
  ScopeCard,
} from "./OAuthAuthorizePageView.sections";

type OAuthAuthorizePageViewProps = {
  preview: OAuthAuthorizationPreview;
  onApprove: (formData: FormData) => void | Promise<void>;
  onDeny: (formData: FormData) => void | Promise<void>;
};

export default function OAuthAuthorizePageView({
  preview,
  onApprove,
  onDeny,
}: OAuthAuthorizePageViewProps) {
  const copy = getOAuthAuthorizeCopy(preview);
  const disableApproval =
    preview.requiresOrganizationSelection || preview.managerApprovalRequired || preview.organizations.length === 0;
  const selectedOrganizationNotice = getSelectedOrganizationNotice(preview);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#eef2ff_100%)] pt-20 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_38%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] dark:text-slate-100">
      <Section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-950">
            <PageHero
              badge={(
                <div className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.35em] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                  <PlugZap className="h-4 w-4" />
                  Login with Anan
                </div>
              )}
              title={`السماح لتطبيق ${preview.client.name}`}
              description={(
                <div className="space-y-4 text-sm font-bold leading-7 text-slate-500 dark:text-slate-300">
                  <p>{copy.publisherLabel}</p>
                  <p>{buildApprovalStatus(preview)}</p>
                </div>
              )}
              contentClassName="space-y-8"
              titleClassName="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-100"
              descriptionClassName="space-y-3"
            />

            <div className="mt-10 space-y-8">
              <OrganizationPicker preview={preview} />

              {selectedOrganizationNotice ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-sm font-bold leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                  <div className="text-slate-950 dark:text-slate-100">
                    {selectedOrganizationNotice.title}
                  </div>
                  <div className="mt-1">{selectedOrganizationNotice.body}</div>
                </div>
              ) : null}

              <div className="space-y-4">
                {preview.requestedScopes.map((scope) => (
                  <ScopeCard key={scope.id} scope={scope} />
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <ConsentAutoSubmit
                action={onApprove}
                requiresConsent={preview.requiresConsent}
                disabled={disableApproval}
                approveLabel={copy.approveLabel}
              >
                <input type="hidden" name="flowId" value={preview.flowId} />
                {preview.selectedTenantOrgId ? (
                  <input type="hidden" name="tenantOrgId" value={preview.selectedTenantOrgId} />
                ) : null}
              </ConsentAutoSubmit>
              <form action={onDeny}>
                <input type="hidden" name="flowId" value={preview.flowId} />
                {preview.selectedTenantOrgId ? (
                  <input type="hidden" name="tenantOrgId" value={preview.selectedTenantOrgId} />
                ) : null}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-6 py-5 text-sm font-black uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {copy.denyLabel}
                </button>
              </form>
            </div>
          </div>

          <OrganizationApprovalAside preview={preview} />
        </div>
      </Section>
    </main>
  );
}
