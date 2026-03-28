import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { buildWorkspaceSecurityAppsPath, getAuthenticatedSession } from "@/lib/serverSession";
import { PageHeader, WorkspacePanel } from "@/app/(ws)/ws/public";
import {
  getAuthorizedAppDetailForCurrentUser,
  revokeAuthorizedAppForCurrentUser,
} from "@/server/domains/auth/oauth/service";
import RevokeAppButton from "../_components/RevokeAppButton";

type WorkspaceSecurityDetailPageProps = { params: Promise<{ clientId: string }> };
type AuthorizedAppDetail = NonNullable<Awaited<ReturnType<typeof getAuthorizedAppDetailForCurrentUser>>>;

function AppSecurityDetails({ app, revokeAction }: { app: AuthorizedAppDetail; revokeAction: () => Promise<void> }) {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 px-6 pt-6 dark:border-slate-800 lg:px-10 lg:pt-10">
        <div className="mb-4">
          <Link href={buildWorkspaceSecurityAppsPath()} className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            العودة للتطبيقات
          </Link>
        </div>
        <PageHeader eyebrow="Connected App" title={app.appName} description={app.publisherName} />
      </div>
      <div className="bg-background p-6 text-foreground lg:p-10">
        <WorkspacePanel>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <p>تم الربط: {new Date(app.createdAt).toLocaleDateString("ar-SA")}</p>
                <p>آخر استخدام: {app.lastUsedAt ? new Date(app.lastUsedAt).toLocaleDateString("ar-SA") : "لم يُستخدم"}</p>
              </div>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">الصلاحيات الممنوحة</h2>
              <div className="mt-3 grid gap-2">
                {(app.scopeDetails ?? []).map((scope) => (
                  <div key={scope.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <div className="font-bold">{scope.label}</div>
                    <div className="mt-0.5 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{scope.id}</div>
                  </div>
                ))}
              </div>
            </div>
            {app.offlineAccess ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">هذا التطبيق يمتلك صلاحية اتصال ممتدة. عند الإلغاء سيتم قطع كل الجلسات.</div> : null}
            <RevokeAppButton revokeAction={revokeAction} />
          </div>
        </WorkspacePanel>
      </div>
    </div>
  );
}

export default async function WorkspaceSecurityDetailPage({ params }: WorkspaceSecurityDetailPageProps) {
  const { clientId } = await params;
  const requestedPath = buildWorkspaceSecurityAppsPath(clientId);
  const { token } = await getAuthenticatedSession();
  if (!token) redirect(`/signin?returnTo=${encodeURIComponent(requestedPath)}`);
  const app = await getAuthorizedAppDetailForCurrentUser(clientId);
  if (!app) notFound();

  async function revokeAppAccess() {
    "use server";
    const currentSession = await getAuthenticatedSession();
    if (!currentSession.token) redirect(`/signin?returnTo=${encodeURIComponent(requestedPath)}`);
    await revokeAuthorizedAppForCurrentUser(clientId);
    redirect(buildWorkspaceSecurityAppsPath());
  }

  return <AppSecurityDetails app={app} revokeAction={revokeAppAccess} />;
}
