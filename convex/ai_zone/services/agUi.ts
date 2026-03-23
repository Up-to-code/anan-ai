import type { AgUiConversationTurn } from "./agUi/types";

const PROJECT_CREATE_ACTION: AgUiConversationTurn["action"] = {
  id: "create_project",
  title: "إنشاء مشروع",
  zone: "projects",
  fields: ["name", "city", "district", "price", "brokerFee", "rooms", "bathrooms"],
};

const PROJECT_CREATE_READY_CARD = {
  id: "project-draft",
  componentId: "project_create_draft",
  props: {
    name: "مشروع مساكن الربوة",
    city: "الرياض",
    district: "الربوة",
    price: "1,850,000 ر.س",
    brokerFee: "2.5%",
    rooms: "4",
    bathrooms: "4",
    summary: "مشروع سكني متوسط الارتفاع مع وحدات ثلاث وأربع غرف في نطاق مرتفع الطلب.",
  },
} as const;

const PROJECT_CREATE_CONSTRAINTS_CARD = {
  id: "constraints",
  componentId: "constraint_summary",
  props: { constraints: ["سكني", "4 غرف", "الرياض", "عمولة 2.5%"] },
} as const;

const PROJECT_CREATE_MISSING_FIELDS_CARD = {
  id: "missing",
  componentId: "field_request_list",
  props: { fields: ["السعر المستهدف", "عدد الحمامات", "وصف مختصر للبيع"] },
} as const;

const PROJECT_CREATE_FOLLOWUP_CARD = {
  id: "followup",
  componentId: "missing_data_prompt",
  props: { prompt: "اذكر السعر والحمامات والوصف، وسأكمل المسودة فوراً." },
} as const;

function buildProjectCreateDraft(hasPrice: boolean) {
  return {
    actionId: "create_project",
    title: "مشروع مساكن الربوة",
    description: "مشروع سكني متوسط الارتفاع مع وحدات ثلاث وأربع غرف في نطاق مرتفع الطلب.",
    fields: {
      name: "مشروع مساكن الربوة",
      city: "الرياض",
      district: "الربوة",
      price: hasPrice ? "1,850,000 ر.س" : "",
      brokerFee: "2.5%",
      rooms: "4",
      bathrooms: "4",
    },
    missingFields: hasPrice ? [] : ["price", "bathrooms", "description"],
    zone: "projects",
    state: hasPrice ? "ready" : "collecting",
  } as const;
}

function projectCreateTurn(input: string, assistantText: string): AgUiConversationTurn {
  const hasPrice = /\d/.test(input);
  return {
    objective: "create_project",
    targetZone: "projects",
    action: PROJECT_CREATE_ACTION,
    draft: buildProjectCreateDraft(hasPrice),
    executionState: hasPrice ? "ready" : "collecting",
    assistantText,
    followupQuestion: hasPrice ? undefined : "ما السعر المستهدف لهذا المشروع؟",
    cards: hasPrice
      ? [PROJECT_CREATE_READY_CARD, PROJECT_CREATE_CONSTRAINTS_CARD]
      : [PROJECT_CREATE_MISSING_FIELDS_CARD, PROJECT_CREATE_FOLLOWUP_CARD],
  };
}

function publishOfferTurn(assistantText: string): AgUiConversationTurn {
  return {
    objective: "publish_offer",
    targetZone: "offers",
    action: { id: "publish_offer", title: "نشر عرض", zone: "offers", fields: ["project", "unit", "audience", "price", "notes"] },
    draft: {
      actionId: "publish_offer",
      title: "عرض إطلاق وحدات الربوة",
      description: "مسودة نشر عرض قبل إرساله إلى السوق أو الوسطاء.",
      fields: {
        project: "مساكن الربوة",
        unit: "A-12",
        audience: "وسطاء البيع السكني",
        price: "1,920,000 ر.س",
      },
      missingFields: [],
      zone: "offers",
      state: "ready",
    },
    executionState: "ready",
    assistantText,
    cards: [
      {
        id: "offer-publish",
        componentId: "offer_publish_draft",
        props: {
          title: "عرض إطلاق وحدات الربوة",
          project: "مساكن الربوة",
          unit: "A-12",
          audience: "وسطاء البيع السكني",
          price: "1,920,000 ر.س",
          notes: "دفعة أولى 10% مع مرونة جدولة الحجز خلال أول أسبوعين.",
        },
      },
    ],
  };
}

const SEND_OFFER_FIELDS = {
  recipient: "شركة مسار الأولى",
  project: "مساكن الربوة",
  unit: "A-12",
};

const SEND_OFFER_CARD_PROPS = {
  recipient: "شركة مسار الأولى",
  project: "مساكن الربوة",
  unit: "A-12",
  message: "أرسل لك وحدة جاهزة للحجز الفوري ضمن إطلاق الربوة مع عمولة مرنة.",
  action: "انتظار موافقة الاستلام أو اقتراح موعد معاينة",
};

const SEND_OFFER_THREAD_PROPS = {
  subject: "خيط إرسال العرض التجريبي",
  sender: "فريق التطوير",
  recipient: "شركة مسار الأولى",
  project: "مساكن الربوة",
  unit: "A-12",
  status: "ينتظر الإرسال",
  update: "سيتم فتح الخيط بعد الموافقة",
};

function sendOfferTurn(assistantText: string): AgUiConversationTurn {
  return {
    objective: "send_offer",
    targetZone: "offers",
    action: { id: "send_offer", title: "إرسال عرض", zone: "offers", fields: ["recipient", "project", "unit", "message", "action"] },
    draft: {
      actionId: "send_offer",
      title: "إرسال عرض لوحدة A-12",
      description: "إرسال عرض مخصص إلى وسيط أو جهة تطوير.",
      fields: SEND_OFFER_FIELDS,
      missingFields: [],
      zone: "offers",
      state: "ready",
    },
    executionState: "ready",
    assistantText,
    cards: [
      {
        id: "offer-send",
        componentId: "offer_send_draft",
        props: SEND_OFFER_CARD_PROPS,
      },
      {
        id: "thread-update",
        componentId: "thread_update",
        props: SEND_OFFER_THREAD_PROPS,
      },
    ],
  };
}

function latestUpdateTurn(assistantText: string): AgUiConversationTurn {
  return {
    objective: "latest_update",
    targetZone: "projects",
    action: { id: "latest_update", title: "آخر تحديث", zone: "projects", fields: ["entity"] },
    executionState: "completed",
    assistantText,
    cards: [
      {
        id: "latest",
        componentId: "latest_update",
        props: {
          entity: "مشروع واجهة الياسمين",
          headline: "ارتفع الاهتمام على وحدات الثلاث غرف بنسبة 18% هذا الأسبوع.",
          details: [
            "وسيطا بيع دخلا مرحلة المتابعة النهائية",
            "آخر حجز مرتبط بالوحدة B-14",
            "تم تحديث سعر الإطلاق للدفعة الثانية",
          ],
        },
      },
      {
        id: "person",
        componentId: "person_relation",
        props: {
          name: "سارة العتيبي",
          role: "وسيط مشروع",
          summary: "تقود المتابعة على وحدات العائلات الصغيرة وتغلق أسرع من المتوسط.",
          relation: "وسيط مرتبط بالمشروع على مستوى الوحدة",
          project: "واجهة الياسمين",
          unit: "B-14",
          badges: ["verified", "vip"],
        },
      },
    ],
  };
}

function marketTurn(assistantText: string): AgUiConversationTurn {
  return {
    objective: "search_market",
    targetZone: "market",
    action: { id: "search_market", title: "تحليل السوق", zone: "market", fields: ["city", "area", "budget"] },
    executionState: "completed",
    assistantText,
    cards: [
      {
        id: "market-insight",
        componentId: "market_insight",
        props: {
          title: "أفضل منتج مقترح في شمال الرياض",
          body: "الوحدات ذات 3 غرف و3 حمامات تحقق طلباً أسرع من الفلل الكبيرة ضمن شريحة 1.7 - 2.2 مليون.",
          metrics: [
            { label: "متوسط سرعة البيع", value: "42 يوم" },
            { label: "نطاق السعر", value: "1.7M - 2.2M" },
            { label: "أفضل مساحة", value: "185 - 225م²" },
            { label: "عمق الطلب", value: "مرتفع" },
          ],
        },
      },
      {
        id: "area-heat",
        componentId: "area_heat",
        props: {
          city: "الرياض",
          area: "الملقا",
          heat: "hot",
          summary: "الطلب يرتفع على الشقق العائلية المتوسطة مع تسعير حازم وطرح سريع.",
        },
      },
    ],
  };
}

export function resolveWorkspaceAgUiTurn(input: string, assistantText: string): AgUiConversationTurn | null {
  if (input.includes("إنشاء") && input.includes("مشروع")) {
    return projectCreateTurn(input, assistantText);
  }
  if (input.includes("نشر") && input.includes("عرض")) {
    return publishOfferTurn(assistantText);
  }
  if ((input.includes("إرسال") || input.includes("ارسل")) && input.includes("عرض")) {
    return sendOfferTurn(assistantText);
  }
  if (input.includes("آخر") || input.includes("تحديث")) {
    return latestUpdateTurn(assistantText);
  }
  if (input.includes("السوق") || input.includes("تحليل") || input.includes("ابحث")) {
    return marketTurn(assistantText);
  }
  return null;
}
