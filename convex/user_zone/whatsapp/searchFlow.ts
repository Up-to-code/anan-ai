import type {
  MobilePropertyFeedItem,
  UserWhatsAppReply,
  WhatsAppOutboundMessage,
} from "./contracts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSearchRow(property: MobilePropertyFeedItem) {
  const location = property.area ?? property.location ?? property.address;
  return {
    id: `select_property:${String(property.id)}`,
    title: property.title.slice(0, 72),
    description: `${location} • ${formatCurrency(property.price)}`.slice(0, 72),
  };
}

/**
 * WHY:   Buyer discovery on WhatsApp needs one deterministic search-result response shape.
 * WHAT:  Builds the structured search turn and its outbound WhatsApp list message.
 * HOW:   Limits interactive rows to WhatsApp-safe counts and keeps the intro copy Arabic-first.
 */
export function buildSearchReply(params: {
  threadId: UserWhatsAppReply["turn"]["threadId"];
  properties: MobilePropertyFeedItem[];
  fallbackUsed: boolean;
}): UserWhatsAppReply {
  const properties = params.properties.slice(0, 10);
  if (properties.length === 0) {
    const textMessage: WhatsAppOutboundMessage = {
      type: "text",
      text: "لا توجد عقارات منشورة حالياً لهذه الرسالة. أرسل مدينة أو حي أو نوع العقار لنبحث مرة أخرى.",
    };
    return {
      turn: {
        threadId: params.threadId,
        state: "idle",
        message: textMessage.text,
        properties: [],
        cards: [],
        nextActions: ["search"],
      },
      outboundMessages: [textMessage],
    };
  }

  const intro = params.fallbackUsed
    ? "لم أجد تطابقاً مباشراً، فحضرت لك أقرب العقارات الموثقة لتبدأ منها."
    : `حضرت لك ${properties.length} خيارات مناسبة. اختر العقار الأقرب لاحتياجك من القائمة.`;

  return {
    turn: {
      threadId: params.threadId,
      state: "search_results",
      message: intro,
      properties,
      cards: [],
      nextActions: ["select_property"],
    },
    outboundMessages: [
      { type: "text", text: intro },
      {
        type: "list",
        header: "العقارات المتاحة",
        body: "اختر عقاراً واحداً لنكمل التمويل أو العائد أو التحويل إلى مستشار.",
        footer: "يمكنك دائماً إرسال بحث جديد برسالة جديدة.",
        buttonText: "عرض الخيارات",
        sectionTitle: params.fallbackUsed ? "خيارات مقترحة" : "نتائج البحث",
        rows: properties.map(buildSearchRow),
      },
    ],
  };
}
