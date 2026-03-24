"use client";

import { useState } from "react";

type PushStatus = "idle" | "pending" | "enabled" | "unsupported" | "denied" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function getStatusLabel(status: PushStatus) {
  switch (status) {
    case "enabled":
      return "الإشعارات الفورية مفعلة";
    case "pending":
      return "جاري التفعيل...";
    case "unsupported":
      return "المتصفح لا يدعم Push";
    case "denied":
      return "تم رفض الإذن";
    case "error":
      return "تعذر التفعيل";
    default:
      return "فعّل إشعارات المتصفح";
  }
}

function PushEnableActionButton({
  status,
  onEnable,
}: {
  status: PushStatus;
  onEnable: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEnable}
      disabled={status === "pending" || status === "enabled"}
      className="inline-flex items-center border border-slate-200 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {getStatusLabel(status)}
    </button>
  );
}

async function fetchPushPublicKey() {
  const configResponse = await fetch("/api/workspace/notifications/push", { cache: "no-store" });
  if (!configResponse.ok) {
    throw new Error("Failed to load push config");
  }
  const config = (await configResponse.json()) as { publicKey: string | null };
  return config.publicKey;
}

async function registerPushSubscription(publicKey: string) {
  const registration = await navigator.serviceWorker.register("/workspace-push-sw.js");
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  const subscriptionJson = subscription.toJSON();
  const response = await fetch("/api/workspace/notifications/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      auth: subscriptionJson.keys?.auth,
      p256dh: subscriptionJson.keys?.p256dh,
      userAgent: navigator.userAgent,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to register push subscription");
  }
}

export default function EnablePushNotificationsButton({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [status, setStatus] = useState<PushStatus>(
    initialEnabled ? "enabled" : "idle",
  );

  const handleEnable = async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    setStatus("pending");
    try {
      const publicKey = await fetchPushPublicKey();
      if (!publicKey) {
        setStatus("error");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      await registerPushSubscription(publicKey);
      setStatus("enabled");
    } catch {
      setStatus("error");
    }
  };

  return <PushEnableActionButton status={status} onEnable={() => void handleEnable()} />;
}
