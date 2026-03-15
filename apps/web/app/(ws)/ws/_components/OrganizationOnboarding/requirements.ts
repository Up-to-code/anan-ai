/**
 * WHY:   The verification step needs a structured, searchable checklist of KSA requirements.
 * WHAT:  Provides broker/developer requirement lists plus official source links for reference.
 * HOW:   Exposes typed requirement items and helper filters for the stepper UI.
 */

export type RequirementItem = {
  id: string;
  label: string;
  required: boolean;
  note?: string;
};

export type RequirementSourceLink = {
  id: string;
  label: string;
  url: string;
};

export const brokerRequirements: RequirementItem[] = [
  {
    id: "broker-fal-license",
    label: "رخصة فال للوساطة العقارية",
    required: true,
    note: "المصدر الرسمي لخدمات الوساطة العقارية في السعودية.",
  },
  {
    id: "broker-cr",
    label: "سجل تجاري بنشاط وساطة عقارية",
    required: false,
    note: "مستند داعم شائع ضمن متطلبات الجهات التنظيمية.",
  },
  {
    id: "broker-identity",
    label: "هوية وطنية للمدير المسؤول أو المفوض",
    required: false,
    note: "مستند داعم لإثبات الصفة القانونية.",
  },
];

export const developerRequirements: RequirementItem[] = [
  {
    id: "dev-cr",
    label: "سجل تجاري بنشاط التطوير العقاري",
    required: true,
    note: "يجب أن يطابق النشاط العقاري المسجل.",
  },
  {
    id: "dev-developer-certificate",
    label: "شهادة مطور عقاري (حسب الجهة المختصة)",
    required: true,
    note: "قد تطلبها جهات التأهيل حسب المنطقة.",
  },
  {
    id: "dev-wafi-license",
    label: "رخصة وافي للبيع على الخارطة (إن وجدت)",
    required: false,
    note: "عند تقديم مشاريع بيع على الخارطة.",
  },
  {
    id: "dev-zakat",
    label: "شهادة الزكاة والضريبة",
    required: false,
    note: "مستند داعم للامتثال المالي.",
  },
  {
    id: "dev-gosi",
    label: "شهادة التأمينات الاجتماعية (GOSI)",
    required: false,
    note: "قد يطلب لإثبات الالتزام بالموارد البشرية.",
  },
  {
    id: "dev-saudization",
    label: "شهادة نطاقات (نسبة التوطين)",
    required: false,
    note: "مستند داعم للامتثال للموارد البشرية.",
  },
  {
    id: "dev-chamber",
    label: "عضوية الغرفة التجارية",
    required: false,
    note: "مستند داعم شائع في الطلبات المؤسسية.",
  },
  {
    id: "dev-articles",
    label: "عقد التأسيس أو النظام الأساسي",
    required: false,
    note: "لإثبات هيكل الشركة وصلاحياتها.",
  },
];

export const requirementSources: RequirementSourceLink[] = [
  {
    id: "rega-fal",
    label: "منصة فال للوساطة العقارية (هيئة العقار)",
    url: "https://rega.gov.sa/rega-services/platforms/fal-real-estate-brokerage/",
  },
  {
    id: "rcmc-qualification",
    label: "تأهيل المطور العقاري (RCMC)",
    url: "https://www.rcmc.gov.sa/developer-qualification",
  },
  {
    id: "balady-qualification",
    label: "تأهيل المطور العقاري (بلدي/إتمام)",
    url: "https://balady.gov.sa/ar/services/%D8%AA%D8%A3%D9%87%D9%8A%D9%84-%D8%A7%D9%84%D9%85%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A",
  },
];

/**
 * WHY:   The requirements list should be searchable by keyword.
 * WHAT:  Filters requirement items by a search query.
 * HOW:   Matches against labels and notes after lowercasing Arabic/Latin input.
 */
export function filterRequirements(items: RequirementItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => {
    const haystack = `${item.label} ${item.note ?? ""}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
