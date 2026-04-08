import { describe, expect, it, vi } from "vitest";
import { NotificationOpenLinkView, markNotificationReadOnOpen } from "./NotificationOpenLink";

describe("markNotificationReadOnOpen", () => {
  it("marks unread notifications as read", () => {
    const markRead = vi.fn(async () => undefined);

    markNotificationReadOnOpen({
      notificationId: "notification-1",
      isRead: false,
      markRead,
    });

    expect(markRead).toHaveBeenCalledWith({ notificationId: "notification-1" });
  });

  it("skips already-read notifications", () => {
    const markRead = vi.fn(async () => undefined);

    markNotificationReadOnOpen({
      notificationId: "notification-1",
      isRead: true,
      markRead,
    });

    expect(markRead).not.toHaveBeenCalled();
  });
});

describe("NotificationOpenLinkView", () => {
  it("wires the activation handler to the rendered link", () => {
    const markRead = vi.fn(async () => undefined);
    const element = NotificationOpenLinkView({
      notificationId: "notification-2",
      href: "/ws/inbox/conversation-1",
      isRead: false,
      children: "Open",
      markRead,
    });

    expect(element.props.href).toBe("/ws/inbox/conversation-1");
    element.props.onClick();

    expect(markRead).toHaveBeenCalledWith({ notificationId: "notification-2" });
  });
});
