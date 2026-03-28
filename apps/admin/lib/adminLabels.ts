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
  closed: "مغلق",
  pending: "معلق",
  active: "نشط",
  inactive: "غير نشط",
  accepted: "مقبول",
  canceled: "ملغي",
  trial: "تجريبي",
  private: "خاص",
  public: "عام",
  member: "عضو",
  not_member: "غير عضو",
  success: "ناجح",
  failed: "فشل",
  complete: "مكتمل",
  missing_document: "مستند ناقص",
  pending_review: "بانتظار المراجعة",
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
  developer: "مطور",
  red: "مطور",
  RED: "مطور",
};

const verificationTypeLabels: Record<string, string> = {
  user: "مستخدم",
  broker: "وسيط",
  RED: "مطور",
  property: "إعلان عقاري",
};

function fallbackLabel(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return value.replaceAll("_", " ");
}

/**
 * WHY:   Admin UI tables need consistent Arabic labels for statuses without re-implementing logic.
 * WHAT:  Resolves a status label for known values with a readable fallback.
 * HOW:   Looks up the status in a map and normalizes unknown values.
 */
export function labelForStatus(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return statusLabels[value] ?? fallbackLabel(value);
}

/**
 * WHY:   Admin UI tables need consistent Arabic labels for channels without re-implementing logic.
 * WHAT:  Resolves a channel label for known values with a readable fallback.
 * HOW:   Looks up the channel in a map and normalizes unknown values.
 */
export function labelForChannel(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return channelLabels[value] ?? fallbackLabel(value);
}

/**
 * WHY:   Admin UI cards and tables should show roles in Arabic consistently.
 * WHAT:  Resolves a role label for known values with a readable fallback.
 * HOW:   Looks up the role in a map and normalizes unknown values.
 */
export function labelForRole(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return roleLabels[value] ?? fallbackLabel(value);
}

/**
 * WHY:   Admin views need consistent Arabic labels for broker/developer owner types.
 * WHAT:  Resolves an owner type label for known values with a readable fallback.
 * HOW:   Looks up the owner type in a map and normalizes unknown values.
 */
export function labelForOwnerType(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return ownerTypeLabels[value] ?? fallbackLabel(value);
}

/**
 * WHY:   Verification lists and details need readable Arabic labels for request types.
 * WHAT:  Resolves a verification request type label with a readable fallback.
 * HOW:   Looks up the type in a map and normalizes unknown values.
 */
export function labelForVerificationType(value?: string | null) {
  if (!value) {
    return "غير متوفر";
  }

  return verificationTypeLabels[value] ?? fallbackLabel(value);
}
