self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: {
        href: payload.href,
        notificationId: payload.notificationId,
      },
      badge: "/brand-mark.svg",
      icon: "/brand-mark.svg",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href ?? "/ws/notifications";
  event.waitUntil(clients.openWindow(href));
});
