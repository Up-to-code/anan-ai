import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { buildWorkspaceSecurityAppsPath, getAuthenticatedSession } from "@/lib/serverSession";
import PageHeader from "@/components/shared/PageHeader";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import {
  getAuthorizedAppDetailForCurrentUser,
  revokeAuthorizedAppForCurrentUser,
} from "@/server/domains/oauth/service";
import RevokeAppButton from "../_components/RevokeAppButton";

type WorkspaceSecurityDetailPageProps = { params: Promise<{ clientId: string }> };

/**
 * WHY:   App-detail security pages remain inside the overview account area after the route split.
 * WHAT:  Shows one authorized app and exposes a revoke action.
 * HOW:   Reads the session, loads the app detail, and redirects/not-found cases through the existing auth helpers.
 */
export default async function WorkspaceSecurityDetailPage({ params }: WorkspaceSecurityDetailPageProps) {
  const { clientId } = await params;
  const requestedPath = buildWorkspaceSecurityAppsPath(clientId);
  const { token, user } = await getAuthenticatedSession();
  if (!token || !user) redirect(`/signin?returnTo=${encodeURIComponent(requestedPath)}`);
  const app = await getAuthorizedAppDetailForCurrentUser(clientId);
  if (!app) notFound();

  async function revokeAppAccess() {
    "use server";
    const currentSession = await getAuthenticatedSession();
    if (!currentSession.token || !currentSession.user) redirect(`/signin?returnTo=${encodeURIComponent(requestedPath)}`);
    await revokeAuthorizedAppForCurrentUser(clientId);
    redirect(buildWorkspaceSecurityAppsPath());
  }

  return (
    <div className="flex flex-col">
      <div className="border-b-2 border-slate-100 px-6 pt-6 lg:px-10 lg:pt-10">
        <div className="mb-4">
          <Link
            href={buildWorkspaceSecurityAppsPath()}
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة للتطبيقات
          </Link>
        </div>
        <PageHeader eyebrow="Connected App" title={app.appName} description={app.publisherName} />
      </div>

      <div className="p-6 lg:p-10">
        <WorkspacePanel>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b-2 border-slate-100 pb-4 md:flex-row md:items-start md:justify-between">
              <div className="text-sm text-slate-500">
                <p>تم الربط: {new Date(app.createdAt).toLocaleDateString("ar-SA")}</p>
                <p>آخر استخدام: {app.lastUsedAt ? new Date(app.lastUsedAt).toLocaleDateString("ar-SA") : "لم يُستخدم"}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">الصلاحيات الممنوحة</h2>
              <div className="mt-3 grid gap-2">
                {(app.scopeDetails ?? []).map((scope) => (
                  <div key={scope.id} className="border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="font-bold">{scope.label}</div>
                    <div className="mt-0.5 text-xs font-black uppercase tracking-widest text-slate-400">{scope.id}</div>
                  </div>
                ))}
              </div>
            </div>

            {app.offlineAccess ? (
              <div className="border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                هذا التطبيق يمتلك صلاحية اتصال ممتدة. عند الإلغاء سيتم قطع كل الجلسات.
              </div>
            ) : null}

            <RevokeAppButton revokeAction={revokeAppAccess} />
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}
