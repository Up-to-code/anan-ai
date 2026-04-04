import type {
  ActivityFeedItem,
  AdminRange,
  AgentTeamRecord,
  BankRecord,
  KnowledgeItemRecord,
  ModelRecord,
  OfferRecord,
  OrganizationRecord,
  OverviewChartPoint,
  OverviewCountPoint,
  OverviewDistributionPoint,
  OverviewMetric,
  ProjectRecord,
  PropertyRecord,
  QueueItem,
  TeamMemberRecord,
  UserRecord,
} from "./types";

const now = new Date("2026-03-23T09:00:00Z").getTime();
const day = 24 * 60 * 60 * 1000;

function buildSeries(days: number, start: number, step: number): OverviewChartPoint[] {
  return Array.from({ length: days }, (_, index) => ({
    label: `${index + 1}`,
    activeUsers: start + ((index * step) % 57) + (index % 4) * 11,
  }));
}

export const overviewMetricsByRange: Record<AdminRange, OverviewMetric[]> = {
  "30d": [
    { key: "active-users", label: "المستخدمون النشطون خلال 30 يوم", value: 2841, delta: 0.12, hint: "نشاط موحد عبر المساعد، الرسائل، والعروض." },
    { key: "messages", label: "الرسائل", value: 18422, delta: 0.08, hint: "كل الرسائل التي مرّت عبر قنوات النظام خلال النافذة المحددة." },
    { key: "tokens", label: "إجمالي التوكنز", value: 6450000, delta: 0.18, hint: "استهلاك التوكنز عبر كل فرق الوكلاء." },
    { key: "burned", label: "التوكنز المحروقة", value: 910000, delta: -0.03, hint: "التكلفة الفعلية المرتبطة بالنماذج النشطة." },
    { key: "models", label: "النماذج المستخدمة", value: 6, delta: 0.0, hint: "النماذج المفعلة حاليًا ضمن فرق الذكاء." },
    { key: "activities", label: "الأنشطة التشغيلية", value: 324, delta: 0.22, hint: "أحداث جديدة مثل تحقق المنظمات، تعيين المستخدم، ومراجعات العروض." },
  ],
  "90d": [
    { key: "active-users", label: "المستخدمون النشطون خلال 90 يوم", value: 7933, delta: 0.18, hint: "صافي المستخدمين الذين تفاعلوا خلال آخر 90 يومًا." },
    { key: "messages", label: "الرسائل", value: 52680, delta: 0.11, hint: "كل الرسائل عبر القنوات خلال فترة 90 يومًا." },
    { key: "tokens", label: "إجمالي التوكنز", value: 18240000, delta: 0.25, hint: "استهلاك التوكنز عبر كل فرق الوكلاء." },
    { key: "burned", label: "التوكنز المحروقة", value: 2670000, delta: 0.05, hint: "التكلفة الإجمالية خلال فترة 90 يومًا." },
    { key: "models", label: "النماذج المستخدمة", value: 8, delta: 0.1, hint: "النماذج المفعلة عبر الفرق والأدوار المختلفة." },
    { key: "activities", label: "الأنشطة التشغيلية", value: 988, delta: 0.29, hint: "كل الإشارات والإجراءات التشغيلية الحديثة." },
  ],
};

export const overviewChartByRange: Record<AdminRange, OverviewChartPoint[]> = {
  "30d": buildSeries(30, 148, 9),
  "90d": buildSeries(30, 220, 13),
};

export const recentActivities: ActivityFeedItem[] = [
  { id: "act-1", title: "تطابق مستخدم مع مشروع مناسب", subtitle: "تمت مطابقة أحمد حمدي مع مشروع ريفان ريزيدنس.", status: "active", createdAt: now - day * 1 },
  { id: "act-2", title: "مستخدم جديد", subtitle: "إنشاء حساب جديد من قناة الويب وتمت مزامنته مع المساعد.", status: "new", createdAt: now - day * 2 },
  { id: "act-3", title: "تحقق منظمة مطلوب", subtitle: "منظمة أفق الوسطاء تحتاج مراجعة مستندات الهوية.", status: "in_review", createdAt: now - day * 3 },
  { id: "act-4", title: "طلب عرض جديد", subtitle: "تم إرسال عرض بقيمة مرتفعة على مشروع سيلفيا جاردنز.", status: "pending", createdAt: now - day * 4 },
];

export const queueItems: QueueItem[] = [
  { id: "queue-1", label: "مطابقة مستخدم", count: 24, status: "active", note: "مطابقات تحتاج مراجعة نهائية من فريق المبيعات." },
  { id: "queue-2", label: "مستخدمون جدد", count: 18, status: "new", note: "حسابات تم إنشاؤها في آخر سبعة أيام." },
  { id: "queue-3", label: "تحقق منظمات", count: 7, status: "in_review", note: "مستندات جديدة تحتاج قرار اعتماد أو رفض." },
  { id: "queue-4", label: "عروض بانتظار القرار", count: 11, status: "pending", note: "عروض تم رفعها وتحتاج مراجعة بشرية." },
];

export const projects: ProjectRecord[] = [
  { id: "project-1", name: "ريفان ريزيدنس", organizationId: "org-1", organizationName: "شركة البناء الحديث", stage: "active", assistantEnabled: true, city: "الرياض", propertyCount: 32, offerCount: 6, updatedAt: now - day * 1, summary: "مجمع سكني متوسط الكثافة مع خطط دفع مرنة ووحدات جاهزة للربط مع المساعد." },
  { id: "project-2", name: "سيلفيا جاردنز", organizationId: "org-2", organizationName: "أفق الوسطاء", stage: "draft", assistantEnabled: false, city: "جدة", propertyCount: 18, offerCount: 2, updatedAt: now - day * 2, summary: "مشروع عائلي ما زال في مرحلة المراجعة الداخلية قبل تفعيل الوصول للمساعد." },
  { id: "project-3", name: "وادي فيستا", organizationId: "org-3", organizationName: "نواة للتطوير", stage: "active", assistantEnabled: true, city: "الدمام", propertyCount: 24, offerCount: 4, updatedAt: now - day * 4, summary: "مشروع استثماري موجه للمستخدمين الباحثين عن دخل إيجاري." },
  { id: "project-4", name: "نور تاور", organizationId: "org-4", organizationName: "دار الصفوة", stage: "draft", assistantEnabled: false, city: "الرياض", propertyCount: 10, offerCount: 1, updatedAt: now - day * 6, summary: "برج سكني فاخر قيد تجهيز الصور والمواد المرجعية قبل الإطلاق." },
];

export const properties: PropertyRecord[] = [
  { id: "property-1", title: "شقة غرفتين - ريفان", projectId: "project-1", projectName: "ريفان ريزيدنس", organizationId: "org-1", organizationName: "شركة البناء الحديث", type: "شقة", publicationStatus: "published", inventoryStatus: "available", price: 890000, city: "الرياض" },
  { id: "property-2", title: "دوبلكس حدائق - ريفان", projectId: "project-1", projectName: "ريفان ريزيدنس", organizationId: "org-1", organizationName: "شركة البناء الحديث", type: "دوبلكس", publicationStatus: "published", inventoryStatus: "reserved", price: 1560000, city: "الرياض" },
  { id: "property-3", title: "شقة استثمارية - وادي", projectId: "project-3", projectName: "وادي فيستا", organizationId: "org-3", organizationName: "نواة للتطوير", type: "شقة", publicationStatus: "published", inventoryStatus: "available", price: 720000, city: "الدمام" },
  { id: "property-4", title: "بنتهاوس - نور", projectId: "project-4", projectName: "نور تاور", organizationId: "org-4", organizationName: "دار الصفوة", type: "بنتهاوس", publicationStatus: "draft", inventoryStatus: "available", price: 2190000, city: "الرياض" },
  { id: "property-5", title: "شقة عائلية - سيلفيا", projectId: "project-2", projectName: "سيلفيا جاردنز", organizationId: "org-2", organizationName: "أفق الوسطاء", type: "شقة", publicationStatus: "draft", inventoryStatus: "available", price: 630000, city: "جدة" },
];

export const banks: BankRecord[] = [
  {
    id: "bank-1",
    name: "بنك العمران",
    slug: "bank-alomran",
    contactEmail: "ops@alomran.sa",
    status: "active",
    assistantEnabled: true,
    notes: "يتم استخدام منتجات هذا البنك في توصيات التمويل السكني والاستثماري.",
    products: [
      { id: "bank-product-1", name: "قرض سكن أول", reason: "شراء سكن أول", apr: 3.2, termYears: 25, assistantEnabled: true },
      { id: "bank-product-2", name: "تمويل استثماري", reason: "شراء وحدات للاستثمار", apr: 4.1, termYears: 20, assistantEnabled: true },
    ],
  },
  {
    id: "bank-2",
    name: "بنك الأفق",
    slug: "bank-ofoq",
    contactEmail: "products@ofoq.sa",
    status: "active",
    assistantEnabled: false,
    notes: "المنتجات محفوظة داخل الإدارة فقط حتى انتهاء مراجعة شروط الاستخدام مع الوكلاء.",
    products: [
      { id: "bank-product-3", name: "قرض ترميم", reason: "ترميم وتجهيز وحدة قائمة", apr: 2.9, termYears: 10, assistantEnabled: false },
      { id: "bank-product-4", name: "تمويل فلل", reason: "شراء فيلا سكنية", apr: 3.8, termYears: 22, assistantEnabled: false },
    ],
  },
];

export const organizations: OrganizationRecord[] = [
  { id: "org-1", name: "شركة البناء الحديث", kind: "developer", verificationStatus: "approved", documentationStatus: "complete", budgetBand: "5M - 10M", projectsCount: 3, membersCount: 11, offersCount: 6, lastActiveAt: now - day * 1 },
  { id: "org-2", name: "أفق الوسطاء", kind: "broker", verificationStatus: "in_review", documentationStatus: "missing_document", budgetBand: "1M - 3M", projectsCount: 1, membersCount: 7, offersCount: 4, lastActiveAt: now - day * 2 },
  { id: "org-3", name: "نواة للتطوير", kind: "developer", verificationStatus: "approved", documentationStatus: "complete", budgetBand: "3M - 5M", projectsCount: 2, membersCount: 9, offersCount: 3, lastActiveAt: now - day * 3 },
  { id: "org-4", name: "دار الصفوة", kind: "developer", verificationStatus: "pending", documentationStatus: "pending_review", budgetBand: "10M+", projectsCount: 1, membersCount: 5, offersCount: 1, lastActiveAt: now - day * 5 },
];

export const users: UserRecord[] = [
  { id: "user-1", name: "أحمد حمدي", role: "broker", organizationId: "org-2", organizationName: "أفق الوسطاء", verificationStatus: "approved", status: "active", lastActiveAt: now - day, email: "ahmed@ofoq.sa" },
  { id: "user-2", name: "نورة السبيعي", role: "developer", organizationId: "org-1", organizationName: "شركة البناء الحديث", verificationStatus: "approved", status: "active", lastActiveAt: now - day * 2, email: "noura@albenaa.sa" },
  { id: "user-3", name: "سلمان العتيبي", role: "admin", organizationId: "org-1", organizationName: "شركة البناء الحديث", verificationStatus: "approved", status: "active", lastActiveAt: now - day * 3, email: "salman@anan.sa" },
  { id: "user-4", name: "ريم الجهني", role: "user", organizationId: "org-3", organizationName: "نواة للتطوير", verificationStatus: "pending", status: "inactive", lastActiveAt: now - day * 6, email: "reem@example.com" },
];

export const offers: OfferRecord[] = [
  {
    id: "offer-1",
    title: "عرض تعاون لعميل استثماري",
    organizationId: "org-2",
    organizationName: "أفق الوسطاء",
    submittedBy: "أحمد حمدي",
    projectId: "project-3",
    projectName: "وادي فيستا",
    propertyId: "property-3",
    propertyName: "شقة استثمارية - وادي",
    status: "pending",
    amount: 720000,
    createdAt: now - day,
    body: "العميل مهتم بشراء وحدتين بهدف الاستثمار ويحتاج مراجعة عمولة التعاون وشروط التمويل.",
    reviewHistory: [
      { id: "offer-history-1", action: "تم الاستلام", actor: "النظام", note: "تم تسجيل العرض في قائمة المراجعة.", createdAt: now - day },
    ],
  },
  {
    id: "offer-2",
    title: "عرض نهائي لمشتري سكن أول",
    organizationId: "org-1",
    organizationName: "شركة البناء الحديث",
    submittedBy: "نورة السبيعي",
    projectId: "project-1",
    projectName: "ريفان ريزيدنس",
    propertyId: "property-1",
    propertyName: "شقة غرفتين - ريفان",
    status: "approved",
    amount: 890000,
    createdAt: now - day * 4,
    body: "العرض يشمل خطة سداد على 25 سنة مع ربط مباشر بأحد منتجات بنك العمران.",
    reviewHistory: [
      { id: "offer-history-2", action: "تم الاعتماد", actor: "سلمان العتيبي", note: "العرض مستوفي الشروط ويمكن تمريره للفريق.", createdAt: now - day * 3 },
    ],
  },
];

export const knowledgeItems: KnowledgeItemRecord[] = [
  { id: "knowledge-1", title: "سياسة التحقق من المنظمات", source: "اقتراح وكيل المعرفة", submittedBy: "Team Knowledge", status: "pending", summary: "إضافة قاعدة توضح تسلسل مراجعة المستندات قبل التفعيل النهائي." },
  { id: "knowledge-2", title: "شروط تمويل الاستثمار", source: "اقتراح وكيل التمويل", submittedBy: "Team Finance", status: "accepted", summary: "تلخيص الشروط الموحدة لعروض التمويل الاستثمارية المستخدمة في الردود." },
  { id: "knowledge-3", title: "قاعدة غير دقيقة عن الأسعار", source: "اقتراح وكيل المعرفة", submittedBy: "Team Knowledge", status: "rejected", summary: "تم رفضها بسبب اعتمادها على بيانات غير مكتملة." },
];

export const models: ModelRecord[] = [
  { id: "model-1", name: "GPT-5", provider: "OpenAI", team: "فريق المطابقة", status: "active", monthlyTokens: 2450000, burnedTokens: 340000, pricePerMillion: 12 },
  { id: "model-2", name: "Claude Sonnet", provider: "Anthropic", team: "فريق المعرفة", status: "active", monthlyTokens: 1880000, burnedTokens: 250000, pricePerMillion: 10 },
  { id: "model-3", name: "Gemini 2.5", provider: "Google", team: "فريق التمويل", status: "active", monthlyTokens: 1220000, burnedTokens: 160000, pricePerMillion: 8 },
];

export const agentTeams: AgentTeamRecord[] = [
  { id: "team-1", name: "فريق المطابقة", defaultModel: "GPT-5", fallbackModel: "Claude Sonnet", enabled: true, routingRule: "ترجيح المشاريع النشطة والمطابقة المالية أولًا", budgetLimit: 420000 },
  { id: "team-2", name: "فريق المعرفة", defaultModel: "Claude Sonnet", fallbackModel: "GPT-5", enabled: true, routingRule: "اعتماد المعرفة المقبولة فقط عند بناء الإجابة", budgetLimit: 260000 },
  { id: "team-3", name: "فريق التمويل", defaultModel: "Gemini 2.5", fallbackModel: "GPT-5", enabled: false, routingRule: "مراجعة منتجات البنوك المسموح بها فقط", budgetLimit: 180000 },
];

export const teamMembers: TeamMemberRecord[] = [
  { id: "member-1", name: "سلمان العتيبي", email: "salman@anan.sa", team: "الإدارة", permission: "admin", status: "active" },
  { id: "member-2", name: "ريم الشريف", email: "reem@anan.sa", team: "المبيعات", permission: "sales_manager", status: "active" },
  { id: "member-3", name: "طارق الزهراني", email: "tariq@anan.sa", team: "التسويق", permission: "marketing", status: "pending" },
];

function buildDistribution<T extends string>(
  entries: readonly T[],
  labelMap: Record<T, string>,
  colorMap: Record<T, string>,
): OverviewDistributionPoint[] {
  return Object.entries(
    entries.reduce<Record<string, number>>((accumulator, entry) => {
      accumulator[entry] = (accumulator[entry] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).map(([key, value]) => ({
    label: labelMap[key as T],
    value,
    color: colorMap[key as T],
  }));
}

function buildCountSeries<T extends string>(
  entries: readonly T[],
  labelMap: Record<T, string>,
  colorMap: Record<T, string>,
): OverviewCountPoint[] {
  return Object.entries(
    entries.reduce<Record<string, number>>((accumulator, entry) => {
      accumulator[entry] = (accumulator[entry] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).map(([key, count]) => ({
    label: labelMap[key as T],
    count,
    color: colorMap[key as T],
  }));
}

export const overviewPartnerMix = buildDistribution(
  organizations.map((organization) => organization.kind),
  {
    broker: "وسطاء",
    developer: "مطورون",
  },
  {
    broker: "var(--chart-teal)",
    developer: "var(--chart-blue)",
  },
);

export const overviewVerificationPressure = buildCountSeries(
  organizations.map((organization) => organization.verificationStatus as "approved" | "in_review" | "pending"),
  {
    approved: "معتمد",
    in_review: "قيد المراجعة",
    pending: "معلّق",
  },
  {
    approved: "var(--chart-teal)",
    in_review: "var(--chart-amber)",
    pending: "var(--chart-rose)",
  },
);

export const overviewOfferQueueMix = buildDistribution(
  offers.map((offer) => offer.status as "approved" | "pending" | "rejected"),
  {
    approved: "معتمد",
    pending: "معلّق",
    rejected: "مرفوض",
  },
  {
    approved: "var(--chart-teal)",
    pending: "var(--chart-amber)",
    rejected: "var(--chart-rose)",
  },
);

export const overviewUserRoleDistribution = buildCountSeries(
  users.map((user) => user.role),
  {
    admin: "مشرف",
    broker: "وسيط",
    developer: "مطور",
    user: "مستخدم",
  },
  {
    admin: "var(--chart-purple)",
    broker: "var(--chart-teal)",
    developer: "var(--chart-blue)",
    user: "var(--chart-cyan)",
  },
);

export const overviewModelConsumption = models.map((model, index) => ({
  label: model.name,
  value: model.monthlyTokens,
  color: ["var(--chart-blue)", "var(--chart-teal)", "var(--chart-amber)", "var(--chart-purple)", "var(--chart-rose)", "var(--chart-cyan)"][index % 6],
}));

export const profileSettings = {
  name: "سلمان العتيبي",
  title: "مدير العمليات",
  email: "salman@anan.sa",
  phone: "+966500000000",
};

export const generalSettings = {
  organizationName: "أنان",
  defaultRange: "30d",
  assistantMode: "مفعّل",
  primaryWorkspace: "المنصة المركزية",
};

export function getProjectById(projectId: string) {
  return projects.find((item) => item.id === projectId) ?? null;
}

export function getPropertyById(propertyId: string) {
  return properties.find((item) => item.id === propertyId) ?? null;
}

export function getBankById(bankId: string) {
  return banks.find((item) => item.id === bankId) ?? null;
}

export function getBankProductById(bankId: string, productId: string) {
  const bank = getBankById(bankId);
  return bank?.products.find((item) => item.id === productId) ?? null;
}

export function getOrganizationById(organizationId: string) {
  return organizations.find((item) => item.id === organizationId) ?? null;
}

export function getUserById(userId: string) {
  return users.find((item) => item.id === userId) ?? null;
}

export function getOfferById(offerId: string) {
  return offers.find((item) => item.id === offerId) ?? null;
}

export function getKnowledgeItemById(itemId: string) {
  return knowledgeItems.find((item) => item.id === itemId) ?? null;
}

export function getModelById(modelId: string) {
  return models.find((item) => item.id === modelId) ?? null;
}

export function getAgentTeamById(teamId: string) {
  return agentTeams.find((item) => item.id === teamId) ?? null;
}
