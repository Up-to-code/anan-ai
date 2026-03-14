import Link from "next/link";
import BrandStatStrip from "../../_components/WorkspaceBrand/BrandStatStrip";
import ZonePageIntro from "../../_components/ZoneShell/ZonePageIntro";
import NotificationCard from "../../_components/Visuals/NotificationCard";
import EnablePushNotificationsButton from "./EnablePushNotificationsButton";
import {
  getWorkspaceNotificationSummary,
  getWorkspacePushConfig,
  listWorkspaceNotifications,
} from "@/server/domains/notifications/service";

/**
 * WHY:   Notifications belong to the main workspace chrome and need a dedicated destination page from the navbar.
 * WHAT:  Renders the real workspace notifications center for `/ws/notifications`.
 * HOW:   Loads notifications on the server and exposes browser-push registration through a small client button.
 */
export default async function WorkspaceNotificationsPage() {
  const [notifications, summary, pushConfig] = await Promise.all([
    listWorkspaceNotifications(30),
    getWorkspaceNotificationSummary(),
    getWorkspacePushConfig(),
  ]);

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="الإشعارات"
        title="مركز التنبيهات"
        description="تنبيهات حقيقية مرتبطة بالمحادثات والعروض والدعوات داخل نفس مساحة العمل."
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Push</div>
            <div className="mt-2 text-sm font-bold text-slate-600">
              اربط المتصفح الحالي لتصلك الرسائل والعروض الجديدة فوراً.
            </div>
          </div>
          <EnablePushNotificationsButton initialEnabled={Boolean(pushConfig.publicKey && pushConfig.browserPushEnabled)} />
        </div>

        <BrandStatStrip
          items={[
            { label: "إجمالي الإشارات", value: notifications.length, tone: "blue" },
            { label: "غير المقروءة", value: summary.unreadCount },
            { label: "مرتبطة بالمحادثات", value: notifications.filter((item) => item.type === "message").length },
            { label: "مرتبطة بالعروض", value: notifications.filter((item) => item.type.startsWith("offer_")).length },
          ]}
        />

        <div className="grid gap-4">
          {notifications.map((item) => (
            <Link key={item.id} href={item.href} className="block">
              <NotificationCard
                title={item.title}
                summary={item.summary}
                severity={item.severity}
                source={item.source}
                actionLabel={item.isRead ? "افتح التفاصيل" : "جديد - افتح التفاصيل"}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
