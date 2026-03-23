import Link from "next/link";
import ZonePageIntro from "../../_components/ZoneShell/ZonePageIntro";
import {
  getWorkspaceNotificationSummary,
  listWorkspaceNotifications,
} from "@/server/domains/workspace/notifications/service";

type WorkspaceNotificationsPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

function formatNotificationTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("ar-SA", {
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
  const [{ filter }, notifications, summary] = await Promise.all([
    searchParams,
    listWorkspaceNotifications(30),
    getWorkspaceNotificationSummary(),
  ]);
  const activeFilter = filter === "unread" ? "unread" : "all";
  const filteredNotifications =
    activeFilter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="الإشعارات"
        title="مركز التنبيهات"
        description="تنبيهات حقيقية مرتبطة بالمحادثات والعروض والدعوات داخل نفس مساحة العمل."
      />

      <div className="space-y-4 px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex border border-slate-200 bg-white p-1">
            <Link
              href="/ws/notifications"
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                activeFilter === "all"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              الكل ({notifications.length})
            </Link>
            <Link
              href="/ws/notifications?filter=unread"
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                activeFilter === "unread"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              غير المقروءة ({summary.unreadCount})
            </Link>
          </div>

          <div className="text-xs font-bold text-slate-500">
            {summary.unreadCount > 0 ? `لديك ${summary.unreadCount} إشعارات غير مقروءة.` : "لا توجد إشعارات غير مقروءة."}
          </div>
        </div>

        <div className="grid gap-3">
          {filteredNotifications.length === 0 ? (
            <div className="border border-slate-200 bg-white p-6 text-sm font-bold text-slate-600">
              لا توجد إشعارات ضمن هذا الفلتر.
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block border border-slate-200 bg-white p-4 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!item.isRead ? (
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-blue-600" />
                      ) : (
                        <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-slate-200" />
                      )}
                      <div className="truncate text-sm font-black text-slate-950">
                        {item.title}
                      </div>
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
                      {item.summary}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <span>{item.source}</span>
                      <span className="h-px w-6 bg-slate-200" />
                      <span>{formatNotificationTimestamp(item.createdAt)}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
                    {item.isRead ? "افتح" : "جديد"}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
