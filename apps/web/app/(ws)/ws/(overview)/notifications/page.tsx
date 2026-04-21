import { cn } from "@/lib/utils";
import Link from "next/link";
import ZonePageIntro from "../../_components/ZoneShell/ZonePageIntro";
import { getLocaleDateFormat } from "@/lib/locale";
import { getWorkspaceLocaleContext } from "../../_lib/workspaceLocale";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import NotificationOpenLink from "../../_components/NotificationOpenLink";
import {
  getWorkspaceNotificationSummary,
  listWorkspaceNotifications,
} from "@/server/domains/workspace/notifications/service";

type WorkspaceNotificationsPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

function formatNotificationTimestamp(timestamp: number, locale: string) {
  return new Date(timestamp).toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * WHY:   Notifications belong to the main workspace chrome and need a dedicated destination page from the navbar.
 * WHAT:  Renders the real workspace notifications center for `/ws/notifications`.
 * HOW:   Loads notifications on the server and renders a filterable list without extra dashboard chrome.
 */
export default async function WorkspaceNotificationsPage({ searchParams }: WorkspaceNotificationsPageProps) {
  const { locale, dictionary } = await getWorkspaceLocaleContext();
  const [{ filter }, _workspace, notifications, summary] = await Promise.all([
    searchParams,
    requireWorkspaceData("/ws/notifications"),
    listWorkspaceNotifications(30),
    getWorkspaceNotificationSummary(),
  ]);
  const activeFilter = filter === "unread" ? "unread" : "all";
  const filteredNotifications =
    activeFilter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow={dictionary.notifications.eyebrow}
        title={dictionary.notifications.title}
        description={dictionary.notifications.description}
      />

      <div className="space-y-6 px-6 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex gap-1 rounded-2xl bg-muted/20 p-1.5 border border-border/40">
            <Link
              href="/ws/notifications"
              className={cn(
                "rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all",
                activeFilter === "all"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95"
              )}
            >
              {dictionary.notifications.all} ({notifications.length})
            </Link>
            <Link
              href="/ws/notifications?filter=unread"
              className={cn(
                "rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all",
                activeFilter === "unread"
                  ? "bg-foreground text-background shadow-md"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-95"
              )}
            >
              {dictionary.notifications.unread} ({summary.unreadCount})
            </Link>
          </div>

          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">
            {summary.unreadCount > 0
              ? dictionary.notifications.unreadSummary.replace("{count}", String(summary.unreadCount))
              : dictionary.notifications.noPending}
          </div>
        </div>

        <div className="grid gap-2 text-right">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-muted/10 p-12 text-center text-[13px] font-bold text-muted-foreground/60 shadow-sm transition-all hover:bg-muted/15">
              {dictionary.notifications.empty}
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <NotificationOpenLink
                key={item.id}
                notificationId={item.id}
                href={item.href}
                isRead={item.isRead}
                className="group relative block rounded-2xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg hover:shadow-black/[0.02]"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      {!item.isRead ? (
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      ) : (
                        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                      )}
                      <div className="truncate text-[15px] font-black tracking-tight text-foreground group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </div>
                    </div>
                    <div className="mt-2 line-clamp-2 text-[13px] font-medium leading-[1.6] text-muted-foreground/80">
                      {item.summary}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                      <span className="bg-muted px-2 py-0.5 rounded-md">{item.source}</span>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span>{formatNotificationTimestamp(item.createdAt, getLocaleDateFormat(locale))}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all",
                    item.isRead
                      ? "bg-muted text-muted-foreground/60"
                      : "bg-blue-600 text-white shadow-sm group-hover:scale-105"
                  )}>
                    {item.isRead ? dictionary.notifications.read : dictionary.notifications.new}
                  </div>
                </div>
              </NotificationOpenLink>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
