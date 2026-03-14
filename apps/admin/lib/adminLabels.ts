/**
 * WHY:   The Arabic admin console repeats the same domain terms across nav, tables, tabs, and chips.
 * WHAT:  Centralizes Arabic labels for statuses, roles, channels, owner types, and verification request types.
 * HOW:   Exposes small lookup helpers with readable fallbacks so page code stays focused on layout.
 */

const statusLabels: Record<string, string> = {
  available: "متاح",
  sold: "مباع",
  reserved: "محجوز",
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
  new: "جديد",
  in_review: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  pending: "معلق",
  active: "نشط",
  inactive: "غير نشط",
  canceled: "ملغي",
  trial: "تجريبي",
  private: "خاص",
  public: "عام",
  member: "عضو",
  not_member: "غير عضو",
  success: "ناجح",
  failed: "فشل",
  none: "غير متوفر",
  unknown: "غير معروف",
  new_lead: "طلب جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  offer_made: "تم إرسال عرض",
  under_contract: "تحت التعاقد",
  closed_won: "مغلق ناجح",
  closed_lost: "مغلق خاسر",
};

const channelLabels: Record<string, string> = {
  whatsapp: "واتساب",
  app: "التطبيق",
  web: "الويب",
};

const roleLabels: Record<string, string> = {
  admin: "مشرف",
  broker: "وسيط",
  developer: "مطور",
  RED: "مطور",
  user: "مستخدم",
};

const ownerTypeLabels: Record<string, string> = {
  broker: "وسيط",
  red: "مطور",
  RED: "مطور",
};

const verificationTypeLabels: Record<string, string> = {
  user: "مستخدم",
  broker: "وسيط",
  RED: "مطور",
};

function fallbackLabel(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return value.replaceAll("_", " ");
}

export function labelForStatus(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return statusLabels[value] ?? fallbackLabel(value);
}

export function labelForChannel(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return channelLabels[value] ?? fallbackLabel(value);
}

export function labelForRole(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return roleLabels[value] ?? fallbackLabel(value);
}

export function labelForOwnerType(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return ownerTypeLabels[value] ?? fallbackLabel(value);
}

export function labelForVerificationType(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return verificationTypeLabels[value] ?? fallbackLabel(value);
}
