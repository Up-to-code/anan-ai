import type { OfferActionResult } from "@/server/contracts/offers";

import type { OfferMarketplaceItem } from "../offerTypes";

export type DeliveryFeedback = {
  targetName: string;
  organizationName: string;
  pushStatus: "pending" | "sent" | "failed" | "skipped";
  conversationId: string | null;
};

export const KIND_LABELS: Record<string, string> = {
  developer: "عرض مطور عقاري",
  broker: "عرض وسيط عقاري",
  client: "طلب عميل مباشر",
  inbox: "فرصة ربط عاجلة",
};

export function mapDeliveryFeedback(result: OfferActionResult): DeliveryFeedback | null {
  if (!result.notification) {
    return null;
  }

  return {
    targetName: result.notification.targetName,
    organizationName: result.notification.organizationName,
    pushStatus: result.notification.pushStatus,
    conversationId: result.conversationId,
  };
}

export function getPushStatusLabel(pushStatus: DeliveryFeedback["pushStatus"]) {
  if (pushStatus === "sent") return "تم إرسال الإشعار الفوري.";
  if (pushStatus === "failed") return "تعذر إرسال الإشعار الفوري، لكن التنبيه سُجل داخل النظام.";
  if (pushStatus === "skipped") return "تم تسجيل التنبيه بدون Push على هذا الحساب.";
  return "الإشعار الفوري قيد المعالجة لهذا الحساب.";
}

export function getLinkedProject(offer: OfferMarketplaceItem) {
  if (!offer.projectRefId) {
    return null;
  }

  return {
    id: offer.projectRefId,
    name: offer.project.title,
    image: offer.image,
    location: offer.location,
    type: offer.propertyType,
    description: offer.summary,
  };
}
