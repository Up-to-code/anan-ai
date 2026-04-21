import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import WorkspaceNotificationsPage from "./page";

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    visibleZoneKeys: ["overview", "settings"],
  })),
}));

vi.mock("../../_components/NotificationOpenLink", () => ({
  __esModule: true,
  default: ({
    notificationId,
    href,
    isRead,
    className,
    children,
  }: {
    notificationId: string;
    href: string;
    isRead: boolean;
    className?: string;
    children: React.ReactNode;
  }) => (
    <a
      data-slot="notification-open-link"
      data-notification-id={notificationId}
      data-href={href}
      data-is-read={String(isRead)}
      className={className}
    >
      {children}
    </a>
  ),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
  })),
}));

vi.mock("@/server/domains/workspace/notifications/service", () => ({
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
}));

describe("/ws/notifications page", () => {
  it("renders the visual notifications center", async () => {
    const markup = renderToStaticMarkup(await WorkspaceNotificationsPage({
      searchParams: Promise.resolve({}),
    }));

    expect(markup).toContain("مركز التنبيهات");
    expect(markup).toContain("تم ربط عميل جديد بمشروع مالقا ريزيدنس");
    expect(markup).toContain("صندوق الربط");
    expect(markup).toContain("data-slot=\"notification-open-link\"");
    expect(markup).toContain("data-notification-id=\"notif-1\"");
    expect(markup).toContain("data-href=\"/ws/inbox/conv-1\"");
  });
});
