import { AIPanelResult } from "@/types/assistant";
import { MobilePropertyFeedItem } from "@/types/mobile";

export const mockProperties: MobilePropertyFeedItem[] = [
  {
    id: "property-1",
    title: "شقة بانورامية على وادي حنيفة",
    address: "الرياض",
    location: "الرياض",
    area: "حطين",
    price: 1850000,
    beds: 3,
    baths: 3,
    sqft: 1860,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "broker-1", type: "broker", name: "وسيط النخبة", slug: "elite-broker", isVerified: true },
    aiSummary: "وحدة حديثة بإطلالة مفتوحة وقريبة من المحاور الرئيسية ومناسبة للاستثمار والسكن.",
    recommendedPrompts: ["احسب العائد الاستثماري", "قارنها بوحدات مشابهة", "اعرض خطة السداد"],
    demoPreviewCard: { type: "roi_summary", title: "ملخص العائد الاستثماري", purchasePrice: 1850000, estimatedAnnualRent: 148000, grossYieldPercent: 8, summary: "الوحدة مناسبة لتجربة استثمارية متوازنة." },
  },
  {
    id: "property-2",
    title: "فيلا عائلية بواجهة حجرية",
    address: "الرياض",
    location: "الرياض",
    area: "الملقا",
    price: 3200000,
    beds: 5,
    baths: 5,
    sqft: 4200,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18c358ec4?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "red-1", type: "RED", name: "مطور عنان", slug: "anan-red", isVerified: true },
    aiSummary: "فيلا جاهزة لعائلة كبيرة مع مخطط سداد مناسب ومؤشرات طلب قوية في المنطقة.",
    recommendedPrompts: ["اعرض خطة السداد", "هل راتبي يؤهلني؟", "قارنها بفيلا مشابهة"],
    demoPreviewCard: { type: "payment_plan", title: "خطة سداد استرشادية", downPayment: 320000, monthlyInstallment: 48000, durationMonths: 60, summary: "سيناريو سداد عائلي واضح." },
  },
  {
    id: "property-3",
    title: "دوبلكس هادئ بإطلالة خضراء",
    address: "الرياض",
    location: "الرياض",
    area: "الياسمين",
    price: 2480000,
    beds: 4,
    baths: 4,
    sqft: 3100,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "broker-2", type: "broker", name: "بيت العاصمة", slug: "capital-home", isVerified: false },
    aiSummary: "خيار متوازن لعائلة تبحث عن هدوء ومساحة جيدة.",
    recommendedPrompts: ["تحقق من التصاريح", "هل السعر مناسب؟", "ما أفضل طريقة تمويل؟"],
    demoPreviewCard: { type: "permit_status", title: "حالة التصاريح", permitStatus: "pending_review", summary: "المالك غير موثق حالياً." },
  },
  {
    id: "property-4",
    title: "شقة استثمارية قريبة من المترو",
    address: "الرياض",
    location: "الرياض",
    area: "العقيق",
    price: 1320000,
    beds: 2,
    baths: 2,
    sqft: 1280,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "red-2", type: "RED", name: "واجهة الرياض للتطوير", slug: "riyadh-front-dev", isVerified: true },
    aiSummary: "وحدة صغيرة سريعة التأجير بموقع يدعم العائد.",
    recommendedPrompts: ["قارنها بوحدات مشابهة", "احسب العائد الاستثماري", "هل تصلح للتأجير السريع؟"],
    demoPreviewCard: { type: "comparison_table", title: "مقارنة سريعة", columns: ["البند", "القيمة"], rows: [["السعر", "1,320,000 SAR"], ["المنطقة", "العقيق"], ["غرف", "2"]], summary: "وحدة مهيأة للمقارنة السريعة." },
  },
  {
    id: "property-5",
    title: "بنتهاوس فاخر بإطلالة على الأفق",
    address: "الرياض",
    location: "الرياض",
    area: "الصحافة",
    price: 4750000,
    beds: 4,
    baths: 5,
    sqft: 5200,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "red-1", type: "RED", name: "مطور عنان", slug: "anan-red", isVerified: true },
    aiSummary: "بنتهاوس فاخر مع تشطيب عالي الجودة وإطلالة بانورامية على أفق الرياض.",
    recommendedPrompts: ["اعرض خطة السداد", "ما خيارات التمويل؟", "قارنها ببنتهاوس آخر"],
    demoPreviewCard: { type: "payment_plan", title: "خطة سداد", downPayment: 950000, monthlyInstallment: 63000, durationMonths: 60, summary: "خطة سداد فاخرة." },
  },
  {
    id: "property-6",
    title: "شقة استوديو حديثة للاستثمار",
    address: "جدة",
    location: "جدة",
    area: "الحمراء",
    price: 680000,
    beds: 1,
    baths: 1,
    sqft: 650,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "broker-3", type: "broker", name: "مجموعة الساحل", slug: "coast-group", isVerified: true },
    aiSummary: "استوديو مثالي لعوائد تأجيرية مرتفعة في منطقة حيوية بجدة.",
    recommendedPrompts: ["احسب العائد السنوي", "هل تصلح للتأجير؟", "قارنها باستوديوهات أخرى"],
    demoPreviewCard: { type: "roi_summary", title: "عائد استثماري", purchasePrice: 680000, estimatedAnnualRent: 72000, grossYieldPercent: 10.6, summary: "عائد ممتاز لاستوديو في جدة." },
  },
  {
    id: "property-7",
    title: "فيلا ذكية مع مسبح خاص",
    address: "الرياض",
    location: "الرياض",
    area: "النرجس",
    price: 5100000,
    beds: 6,
    baths: 7,
    sqft: 6500,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "red-1", type: "RED", name: "مطور عنان", slug: "anan-red", isVerified: true },
    aiSummary: "فيلا ذكية مع نظام أتمتة متكامل ومسبح خاص وحديقة واسعة.",
    recommendedPrompts: ["اعرض تفاصيل نظام الأتمتة", "خطة سداد مريحة", "قارنها بفلل النرجس"],
    demoPreviewCard: { type: "payment_plan", title: "خطة سداد", downPayment: 1020000, monthlyInstallment: 68000, durationMonths: 60, summary: "خطة تمويل للفلل الفاخرة." },
  },
  {
    id: "property-8",
    title: "شقة عائلية بتصميم عصري",
    address: "الدمام",
    location: "الدمام",
    area: "الفيصلية",
    price: 1100000,
    beds: 3,
    baths: 2,
    sqft: 1500,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "broker-4", type: "broker", name: "دار الشرقية", slug: "east-dar", isVerified: true },
    aiSummary: "شقة عائلية بسعر تنافسي في منطقة متميزة بالدمام.",
    recommendedPrompts: ["هل السعر مناسب للمنطقة؟", "اعرض خطة السداد", "ما خيارات التمويل؟"],
    demoPreviewCard: { type: "mortgage_check", title: "فحص التمويل", estimatedEligibility: "eligible", recommendedBudget: 1012000, monthlyInstallmentEstimate: 5280, summary: "مؤهل للتمويل العقاري." },
  },
  {
    id: "property-9",
    title: "تاون هاوس جديد بمجمع مغلق",
    address: "الرياض",
    location: "الرياض",
    area: "الرمال",
    price: 1650000,
    beds: 4,
    baths: 3,
    sqft: 2200,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7a5a32?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "red-2", type: "RED", name: "واجهة الرياض للتطوير", slug: "riyadh-front-dev", isVerified: true },
    aiSummary: "تاون هاوس في مجمع مغلق مع مرافق مشتركة وأمن 24/7.",
    recommendedPrompts: ["ما المرافق المشتركة؟", "احسب العائد", "قارنها بتاون هاوس آخر"],
    demoPreviewCard: { type: "roi_summary", title: "عائد استثماري", purchasePrice: 1650000, estimatedAnnualRent: 120000, grossYieldPercent: 7.3, summary: "عائد جيد لتاون هاوس." },
  },
  {
    id: "property-10",
    title: "أرض سكنية بموقع استراتيجي",
    address: "الرياض",
    location: "الرياض",
    area: "طويق",
    price: 890000,
    beds: 0,
    baths: 0,
    sqft: 750,
    status: "available",
    media: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1200&q=80"
    ],
    owner: { id: "broker-1", type: "broker", name: "وسيط النخبة", slug: "elite-broker", isVerified: true },
    aiSummary: "أرض سكنية بموقع استراتيجي قريبة من مشاريع البنية التحتية الجديدة.",
    recommendedPrompts: ["ما خطط التطوير القريبة؟", "احسب تكلفة البناء", "هل تصلح للاستثمار؟"],
    demoPreviewCard: { type: "comparison_table", title: "تفاصيل الأرض", columns: ["البند", "القيمة"], rows: [["المساحة", "750 م²"], ["سعر المتر", "1,187 ر.س"], ["المنطقة", "طويق"]], summary: "أرض بسعر تنافسي." },
  },
];

export function mockAssistantResponse(property: MobilePropertyFeedItem, query: string): { message: string; cards: AIPanelResult[] } {
  const normalized = query.trim();
  const cards: AIPanelResult[] = [];

  if (normalized.includes("عائد") || normalized.toLowerCase().includes("roi")) {
    cards.push({
      type: "roi_summary", title: "ملخص العائد الاستثماري",
      purchasePrice: property.price,
      estimatedAnnualRent: Math.round(property.price * 0.08),
      grossYieldPercent: 8,
      summary: "تقدير أولي مبني على الطلب الحالي في المنطقة.",
    });
  }

  if (normalized.includes("سداد") || normalized.includes("دفعة") || normalized.includes("قسط")) {
    cards.push({
      type: "payment_plan", title: "خطة سداد استرشادية",
      downPayment: Math.round(property.price * 0.1),
      monthlyInstallment: Math.round(property.price * 0.015),
      durationMonths: 60,
      summary: "خطة سداد تقديرية. يرجى مراجعة البنك المعتمد للتفاصيل النهائية.",
    });
  }

  if (normalized.includes("راتب") || normalized.includes("تمويل") || normalized.includes("أهل") || normalized.includes("بنك")) {
    cards.push({
      type: "mortgage_check", title: "فحص أهلية التمويل",
      estimatedEligibility: property.price > 2500000 ? "review" : "eligible",
      recommendedBudget: Math.round(property.price * 0.92),
      monthlyInstallmentEstimate: Math.round(property.price * 0.0048),
      summary: "تقدير أولي. البنوك المعتمدة: الراجحي، الأهلي، الإنماء.",
    });
  }

  if (normalized.includes("تصريح") || normalized.includes("رخص")) {
    cards.push({
      type: "permit_status", title: "حالة التصاريح",
      permitStatus: property.owner.isVerified ? "verified" : "pending_review",
      summary: property.owner.isVerified ? "الوسيط موثق داخل أنان." : "يحتاج مراجعة مستندية إضافية.",
    });
  }

  if (normalized.includes("قارن") || normalized.includes("مقارن")) {
    cards.push({
      type: "comparison_table", title: "مقارنة سريعة",
      columns: ["البند", "القيمة"],
      rows: [
        ["السعر", `${property.price.toLocaleString("en-US")} SAR`],
        ["المنطقة", property.area ?? "غير محدد"],
        ["غرف النوم", String(property.beds)],
        ["الحمامات", String(property.baths)],
        ["المساحة", property.sqft ? `${property.sqft} م²` : "غير محدد"],
      ],
      summary: "بطاقة مقارنة سريعة لعناصر القرار الأساسية.",
    });
  }

  if (normalized.includes("ميزانية") || normalized.includes("أبحث") || normalized.includes("شقة") || normalized.includes("فيلا")) {
    cards.push({
      type: "comparison_table", title: "نتائج البحث",
      columns: ["العقار", "السعر"],
      rows: mockProperties.slice(0, 5).map(p => [p.title, `${p.price.toLocaleString("en-US")} SAR`]),
      summary: "وجدت عدة وحدات مطابقة. اضغط على أي وحدة أعلاه للتفاصيل.",
    });
  }

  if (cards.length === 0) {
    cards.push({
      type: "payment_plan", title: "خطة سداد استرشادية",
      downPayment: Math.round(property.price * 0.1),
      monthlyInstallment: Math.round(property.price * 0.015),
      durationMonths: 60,
      summary: "معاينة تقديرية لتجربة الواجهة.",
    });
  }

  return {
    message: `تم تحليل ${property.title} وإعداد ${cards.length} ${cards.length === 1 ? "بطاقة" : "بطاقات"} بناءً على سؤالك.`,
    cards,
  };
}
