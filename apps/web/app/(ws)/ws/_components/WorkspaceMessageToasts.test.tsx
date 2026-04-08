import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./NotificationOpenLink", () => ({
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

import { WorkspaceMessageToastCard } from "./WorkspaceMessageToasts";

describe("WorkspaceMessageToastCard", () => {
  it("uses the shared notification open link for the primary action only", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceMessageToastCard
        toast={{
          id: "notification-1",
          type: "message",
          title: "رسالة جديدة من أحمد",
          summary: "تم تحديث المحادثة.",
          href: "/ws/inbox/conversation-1",
          source: "البريد الوارد",
          severity: "info",
          entityId: "conversation-1",
          entityType: "conversation",
          metadata: { conversationId: "conversation-1" },
          isRead: false,
          createdAt: Date.now(),
          pushedAt: null,
          pushStatus: "sent",
          conversationId: "conversation-1",
        }}
        onDismiss={() => undefined}
      />,
    );

    expect(markup).toContain("data-slot=\"notification-open-link\"");
    expect(markup).toContain("data-notification-id=\"notification-1\"");
    expect(markup).toContain("فتح المحادثة");
    expect(markup).toContain("تجاهل");
    expect(markup).toContain("aria-label=\"إغلاق التنبيه\"");
  });
});
