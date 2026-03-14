"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export default function EnablePushNotificationsButton({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "pending" | "enabled" | "unsupported" | "denied" | "error">(
    initialEnabled ? "enabled" : "idle",
  );

  const handleEnable = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    setStatus("pending");

    try {
      const configResponse = await fetch("/api/workspace/notifications/push", { cache: "no-store" });
      if (!configResponse.ok) throw new Error("Failed to load push config");
      const config = (await configResponse.json()) as { publicKey: string | null; browserPushEnabled: boolean };

      if (!config.publicKey) {
        setStatus("error");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register("/workspace-push-sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey),
      });

      const subscriptionJson = subscription.toJSON();
      await fetch("/api/workspace/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          auth: subscriptionJson.keys?.auth,
          p256dh: subscriptionJson.keys?.p256dh,
          userAgent: navigator.userAgent,
        }),
      });

      setStatus("enabled");
    } catch {
      setStatus("error");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleEnable()}
      disabled={status === "pending" || status === "enabled"}
      className="inline-flex items-center border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {status === "enabled"
        ? "الإشعارات الفورية مفعلة"
        : status === "pending"
          ? "جاري التفعيل..."
          : status === "unsupported"
            ? "المتصفح لا يدعم Push"
            : status === "denied"
              ? "تم رفض الإذن"
              : status === "error"
                ? "تعذر التفعيل"
                : "فعّل إشعارات المتصفح"}
    </button>
  );
}
