import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import WorkspaceNotificationsPage from "./page";

vi.mock("@/server/domains/notifications/service", () => ({
  listWorkspaceNotifications: vi.fn(async () => ([
    {
      id: "notif-1",
      type: "message",
      title: "تم ربط عميل جديد بمشروع مالقا ريزيدنس",
      summary: "الوسيط سارة العتيبي نقل العميل محمد الدوسري إلى مرحلة المعاينة النهائية.",
      href: "/ws/inbox/conv-1",
      source: "مشروع",
      severity: "success",
      isRead: false,
      createdAt: Date.now(),
      pushStatus: "sent",
    },
    {
      id: "notif-2",
      type: "offer_sent",
      title: "مهمة جديدة في صندوق الربط",
      summary: "يوجد طلب عميل يحتاج مشروعاً مناسباً خلال 24 ساعة داخل منطقة حطين.",
      href: "/ws/offers/offer-1",
      source: "عروض",
      severity: "info",
      isRead: false,
      createdAt: Date.now(),
      pushStatus: "sent",
    },
  ])),
  getWorkspaceNotificationSummary: vi.fn(async () => ({
    unreadCount: 2,
    latest: [],
  })),
  getWorkspacePushConfig: vi.fn(async () => ({
    publicKey: "pk_test",
    browserPushEnabled: true,
  })),
}));

describe("/ws/notifications page", () => {
  it("renders the visual notifications center", async () => {
    const markup = renderToStaticMarkup(await WorkspaceNotificationsPage());

    expect(markup).toContain("مركز التنبيهات");
    expect(markup).toContain("تم ربط عميل جديد بمشروع مالقا ريزيدنس");
    expect(markup).toContain("صندوق الربط");
  });
});
