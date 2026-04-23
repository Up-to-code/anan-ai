import type { GenericMutationCtx } from "convex/server";
import type { Id } from "../_generated/dataModel";
import type { DataModel } from "../_generated/dataModel";
import { appendInboxCollaborationEvent, appendInboxOfferEvent } from "../shared_logic/inbox";
import { appendConversationEvent } from "../shared_logic/inbox/conversations";
import { createOrganizationForAuthUserRecord } from "../shared_logic/agencies/repositories/organizationCreation.helpers";
import { tenants } from "../tenants";
import { buildPropertySearchText } from "../shared_logic/properties/searchText";

type MutationCtx = GenericMutationCtx<DataModel>;

export const SAUDI_SEED_NAMESPACE = "seed.saudi_workspace_v1";
const PLAYGROUND_NAME = "مساحة اختبار السعودية";
const PLAYGROUND_DESCRIPTION =
  "مساحة تطوير محملة ببيانات سعودية كبيرة لاختبار المشاريع والـ CRM والتوصيات وسير عمل وكيل عنان.";
const BANK_SLUGS = [
  "saudi-national-bank-seed",
  "alrajhi-bank-seed",
  "riyad-bank-seed",
  "alinma-bank-seed",
  "bank-aljazira-seed",
  "bank-albilad-seed",
  "banque-saudi-fransi-seed",
  "arab-national-bank-seed",
  "sabb-seed",
  "saudi-investment-bank-seed",
] as const;

type OrganizationKind = "broker" | "red";
type OrganizationSeedContext = {
  ownerType: OrganizationKind;
  ownerAuthUserId: string;
  ownerProfileId: Id<"userProfiles">;
  ownerBrokerId?: Id<"brokers">;
  ownerREDId?: Id<"RED">;
  tenantOrgId: string;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  city: SaudiCityRecord;
  isPlayground: boolean;
};

type SaudiCityRecord = {
  nameAr: string;
  nameEn: string;
  districts: string[];
};

type BankSeedRecord = {
  slug: string;
  name: string;
  contactEmail: string;
  description: string;
  products: Array<{
    name: string;
    type: string;
    description: string;
    rules: {
      interestRate: number;
      minDownPaymentPercent: number;
      maxTenorYears: number;
      salaryTransferRequired: boolean;
      supportedPropertyTypes: string[];
    };
  }>;
};

type SeedSummary = {
  batchLabel: string;
  organizations: number;
  developers: number;
  brokers: number;
  members: number;
  properties: number;
  crmClients: number;
  deals: number;
  offerPackages: number;
  offerCases: number;
  legacyOffers: number;
  offers: number;
  conversations: number;
  messages: number;
  banks: number;
  bankProducts: number;
  orders: number;
  loanOrders: number;
  propertyOrders: number;
  publishedPropertiesWithBank: number;
  playgroundOrganizationId: string | null;
  playgroundStatus: "created" | "reused";
};

type PlaygroundResult = {
  status: "created" | "reused";
  context: OrganizationSeedContext;
};

type SeedMemberSpec = {
  authUserId: string;
  email: string;
  name: string;
  username: string;
  role: "manager" | "member" | "viewer";
  profileRole: "broker" | "developer";
};

type PropertySeedRecord = {
  externalId: string;
  title: string;
  address: string;
  location: string;
  area: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  publicationState: "draft" | "published" | "archived";
  status: "available" | "reserved";
  bankId?: Id<"banks">;
  media: Array<{ key: string; url: string; name: string }>;
  body: {
    presentation: {
      descriptionShort: string;
      amenities: string[];
      parkingSpaces: number;
      hasParking: boolean;
      slides: Array<{ key: string; url: string; name: string }>;
      coverImageKey?: string;
      galleryDisplayMode: "cover";
      galleryAspectRatio: "landscape" | "square";
      privatePermitSummary?: string;
      privatePermitVisibility?: "conversation_only";
    };
  };
};

const SAUDI_CITIES: SaudiCityRecord[] = [
  {
    nameAr: "الرياض",
    nameEn: "riyadh",
    districts: ["الياسمين", "النرجس", "حطين", "الملقا", "الصحافة", "العقيق", "قرطبة", "الورود"],
  },
  {
    nameAr: "جدة",
    nameEn: "jeddah",
    districts: ["أبحر", "الشاطئ", "الزهراء", "النهضة", "البساتين", "الروضة", "السلامة"],
  },
  {
    nameAr: "الدمام",
    nameEn: "dammam",
    districts: ["الشاطئ", "الفيصلية", "المرجان", "الندى", "الواحة"],
  },
  {
    nameAr: "الخبر",
    nameEn: "khobar",
    districts: ["العليا", "الحزام الذهبي", "الخبر الشمالية", "البندرية", "اليرموك"],
  },
  {
    nameAr: "مكة",
    nameEn: "makkah",
    districts: ["العزيزية", "النسيم", "الشرائع", "الزاهر", "العمرة"],
  },
  {
    nameAr: "المدينة المنورة",
    nameEn: "madinah",
    districts: ["الدفاع", "شوران", "الريان", "العهن", "قباء"],
  },
];

const DEVELOPER_NAME_PREFIXES = [
  "روابي",
  "أفق",
  "نبض",
  "مَدار",
  "مسار",
  "واجهة",
  "مشارف",
  "جذور",
  "مدى",
  "رِحال",
] as const;
const DEVELOPER_NAME_SUFFIXES = [
  "للتطوير",
  "العقارية",
  "للمشاريع",
  "للإنشاء الحديث",
  "للتطوير العمراني",
  "للمجتمعات السكنية",
] as const;
const BROKER_NAME_PREFIXES = [
  "مستشارو",
  "خبراء",
  "ركائز",
  "دلائل",
  "مسارات",
  "صلة",
  "بوابة",
  "رؤية",
  "سكن",
  "مقام",
] as const;
const BROKER_NAME_SUFFIXES = [
  "العقارية",
  "للوساطة",
  "للتسويق العقاري",
  "للبيع الذكي",
  "للتمثيل العقاري",
] as const;
const SAUDI_FAMILY_NAMES = [
  "العتيبي",
  "الحربي",
  "القحطاني",
  "الشهري",
  "الزهراني",
  "المالكي",
  "الغامدي",
  "السهلي",
  "العنزي",
  "الشمراني",
] as const;
const SAUDI_FIRST_NAMES = [
  "سارة",
  "محمد",
  "خالد",
  "نورة",
  "فهد",
  "ريم",
  "تركي",
  "عبدالله",
  "لمى",
  "فيصل",
  "جود",
  "رامي",
  "مها",
  "مشاعل",
  "يزيد",
  "بندر",
] as const;
const PROPERTY_TITLE_PREFIXES = [
  "برج",
  "واجهة",
  "أفق",
  "روابي",
  "سكاي",
  "مقام",
  "دار",
  "رَواء",
  "مرسى",
  "واحة",
] as const;
const PROPERTY_TITLE_SUFFIXES = [
  "ريسيدنس",
  "جراند",
  "هايتس",
  "ريتريت",
  "سويتس",
  "سكوير",
  "كورت",
  "بلازا",
  "لايف",
  "جاردنز",
] as const;
const AMENITY_POOL = [
  "مواقف مظللة",
  "لوبي فاخر",
  "صالة لياقة",
  "غرفة سائق",
  "تراس واسع",
  "غرفة غسيل",
  "مخزن",
  "نادي أطفال",
  "مسبح داخلي",
  "قرب المدارس",
] as const;
const PROJECT_DESCRIPTION_PHRASES = [
  "مشروع سكني جاهز يخدم الباحثين عن سكن عائلي بتشطيب هادئ ومساحات عملية.",
  "منتج مناسب للمشتري الاستثماري مع قابلية تأجير جيدة وواجهة تشغيلية واضحة.",
  "تصميم حديث قريب من المحاور والخدمات، مع باقات تمويل وبنية مرافق متكاملة.",
  "وحدات متنوعة داخل حي مطلوب مع تركيز على المرونة في السداد وتجربة دخول مريحة.",
  "مشروع يوازن بين السكن الفاخر والطلب الاستثماري في الأحياء السعودية النشطة.",
] as const;
const CLIENT_NOTES = [
  "عميل جاد ويقارن بين التمويل الثابت والمتناقص قبل حجز الزيارة.",
  "مهتم بشراء أول سكن داخل شمال الرياض مع دفعة أولى متوسطة.",
  "يفضل مشروعاً جاهزاً أو قريب التسليم مع مطبخ وصالة واسعة.",
  "يسأل عن العائد الإيجاري المتوقع ويريد مقارنة ثلاثة مشاريع في نفس الحي.",
  "يحتاج وحدة لعائلة صغيرة ويهتم بالمواقف والواجهات والخدمات اليومية.",
] as const;
const MEDIA_POOL = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
] as const;

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: string) {
  let state = hashString(seed) || 1;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function pickManyUnique<T>(rng: () => number, items: readonly T[], count: number): T[] {
  const copy = [...items];
  const picked: T[] = [];
  while (copy.length > 0 && picked.length < count) {
    const index = Math.floor(rng() * copy.length);
    picked.push(copy.splice(index, 1)[0]!);
  }
  return picked;
}

function randomInt(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function slugifyAscii(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function seedTag(batchLabel: string, entity: string, id: string) {
  return `${SAUDI_SEED_NAMESPACE}:${batchLabel}:${entity}:${id}`;
}

function buildPhoneNumber(rng: () => number) {
  const suffix = String(randomInt(rng, 0, 99999999)).padStart(8, "0");
  return `+9665${suffix}`;
}

function chooseCityForIndex(index: number) {
  if (index < 20) return SAUDI_CITIES[0]!;
  if (index < 35) return SAUDI_CITIES[1]!;
  return SAUDI_CITIES[2 + (index % (SAUDI_CITIES.length - 2))]!;
}

function buildOrganizationName(args: { kind: OrganizationKind; city: SaudiCityRecord; index: number; rng: () => number }) {
  if (args.kind === "red") {
    return `${pickOne(args.rng, DEVELOPER_NAME_PREFIXES)} ${args.city.nameAr} ${pickOne(args.rng, DEVELOPER_NAME_SUFFIXES)}`;
  }
  return `${pickOne(args.rng, BROKER_NAME_PREFIXES)} ${args.city.nameAr} ${pickOne(args.rng, BROKER_NAME_SUFFIXES)}`;
}

function buildSyntheticOwnerIdentity(args: {
  batchLabel: string;
  kind: OrganizationKind;
  index: number;
  city: SaudiCityRecord;
  rng: () => number;
}) {
  const firstName = pickOne(args.rng, SAUDI_FIRST_NAMES);
  const lastName = pickOne(args.rng, SAUDI_FAMILY_NAMES);
  const localPart = `${args.kind}-${args.city.nameEn}-${args.batchLabel}-${args.index + 1}`;
  return {
    authUserId: `seed-saudi-${localPart}-owner`,
    email: `${localPart}@seed.anansa.local`,
    displayName: `${firstName} ${lastName}`,
  };
}

function buildPlaygroundSlug(email: string) {
  const localPart = slugifyAscii(normalizeEmail(email).split("@")[0] ?? "playground");
  return `seed-saudi-playground-${localPart || "owner"}`;
}

function buildPlaygroundAuthUserId(email: string) {
  const localPart = slugifyAscii(normalizeEmail(email).split("@")[0] ?? "playground");
  return `seed-saudi-playground-${localPart || "owner"}`;
}

function buildMemberRole(index: number, total: number): "manager" | "member" | "viewer" {
  if (index === 0 || index === 1) return "manager";
  if (index === total - 1) return "viewer";
  return index % 3 === 0 ? "viewer" : "member";
}

function buildMemberSpecs(args: {
  batchLabel: string;
  organizationSlug: string;
  city: SaudiCityRecord;
  ownerType: OrganizationKind;
  memberCount: number;
  rng: () => number;
  ownerAuthUserId: string;
  ownerEmail: string;
  ownerName: string;
  isPlayground: boolean;
}) {
  const members: SeedMemberSpec[] = [
    {
      authUserId: args.ownerAuthUserId,
      email: normalizeEmail(args.ownerEmail),
      name: args.ownerName,
      username: slugifyAscii(`${args.organizationSlug}-owner`) || `${args.organizationSlug}-owner`,
      role: "manager",
      profileRole: args.ownerType === "broker" ? "broker" : "developer",
    },
  ];
  for (let index = 1; index < args.memberCount; index += 1) {
    const firstName = pickOne(args.rng, SAUDI_FIRST_NAMES);
    const lastName = pickOne(args.rng, SAUDI_FAMILY_NAMES);
    const localPart = `${args.organizationSlug}-member-${index}`;
    members.push({
      authUserId: `seed-saudi-${localPart}`,
      email: `${localPart}@seed.anansa.local`,
      name: `${firstName} ${lastName}`,
      username: slugifyAscii(localPart) || `member-${index}`,
      role: buildMemberRole(index, args.memberCount),
      profileRole: args.ownerType === "broker" ? "broker" : "developer",
    });
  }
  return members;
}

function buildOrganizationCounts(rng: () => number) {
  return {
    memberCount: randomInt(rng, 5, 8),
    propertyCount: randomInt(rng, 20, 30),
    clientCount: randomInt(rng, 15, 40),
    dealCount: randomInt(rng, 10, 25),
  };
}

function buildPropertySeed(args: {
  batchLabel: string;
  organizationSlug: string;
  city: SaudiCityRecord;
  district: string;
  propertyIndex: number;
  bankId?: Id<"banks">;
  rng: () => number;
}) : PropertySeedRecord {
  const publicationRoll = args.rng();
  const publicationState =
    publicationRoll < 0.7 ? "published" : publicationRoll < 0.95 ? "draft" : "archived";
  const title = `${pickOne(args.rng, PROPERTY_TITLE_PREFIXES)} ${args.district} ${pickOne(args.rng, PROPERTY_TITLE_SUFFIXES)}`;
  const mediaCount = randomInt(args.rng, 1, 3);
  const media = Array.from({ length: mediaCount }, (_, offset) => {
    const url = MEDIA_POOL[(args.propertyIndex + offset) % MEDIA_POOL.length]!;
    return {
      key: `${args.organizationSlug}-media-${args.propertyIndex + 1}-${offset + 1}`,
      url,
      name: `${args.organizationSlug}-${args.propertyIndex + 1}-${offset + 1}.jpg`,
    };
  });
  const beds = randomInt(args.rng, 2, 5);
  const baths = Math.min(5, beds + randomInt(args.rng, 0, 1));
  const sqft = randomInt(args.rng, 120, 320);
  const price = randomInt(args.rng, 850000, 3400000);
  const amenities = pickManyUnique(args.rng, AMENITY_POOL, randomInt(args.rng, 3, 5));
  const description =
    `${pickOne(args.rng, PROJECT_DESCRIPTION_PHRASES)} ` +
    `يقع المشروع في حي ${args.district} داخل ${args.city.nameAr} مع تنوع وحدات يناسب السكن والاستثمار.`;

  return {
    externalId: seedTag(args.batchLabel, "property", `${args.organizationSlug}-${args.propertyIndex + 1}`),
    title,
    address: `${args.district}، ${args.city.nameAr}`,
    location: args.city.nameAr,
    area: args.district,
    description,
    price,
    beds,
    baths,
    sqft,
    publicationState,
    status: publicationState === "published" ? "available" : "reserved",
    // Keep finance linkage high and deterministic so seeded recommendation coverage stays stable.
    bankId: publicationState === "published" && args.propertyIndex % 6 !== 0 ? args.bankId : undefined,
    media,
    body: {
      presentation: {
        descriptionShort: description.slice(0, 110),
        amenities,
        parkingSpaces: randomInt(args.rng, 1, 3),
        hasParking: true,
        slides: media,
        coverImageKey: media[0]?.key,
        galleryDisplayMode: "cover",
        galleryAspectRatio: args.rng() > 0.65 ? "square" : "landscape",
        privatePermitSummary:
          publicationState === "draft" ? "ملف التراخيص الداخلي قيد الاستكمال والمراجعة النهائية." : undefined,
        privatePermitVisibility: publicationState === "draft" ? "conversation_only" : undefined,
      },
    },
  };
}

function buildMortgageProduct(args: {
  name: string;
  description: string;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTenorYears: number;
  salaryTransferRequired: boolean;
  supportedPropertyTypes: string[];
}) {
  return {
    name: args.name,
    type: "mortgage",
    description: args.description,
    rules: {
      interestRate: args.interestRate,
      minDownPaymentPercent: args.minDownPaymentPercent,
      maxTenorYears: args.maxTenorYears,
      salaryTransferRequired: args.salaryTransferRequired,
      supportedPropertyTypes: args.supportedPropertyTypes,
    },
  };
}

function buildBankSeeds(): BankSeedRecord[] {
  return [
    {
      slug: BANK_SLUGS[0],
      name: "البنك الأهلي السعودي",
      contactEmail: "mortgage@snb.seed.anansa.local",
      description: "حلول تمويل للشقق السكنية الجاهزة ومشاريع العوائل المتوسطة والعليا.",
      products: [
        buildMortgageProduct({
          name: "تمويل الشقق الجاهزة",
          description: "مسار تمويل للشقق الجاهزة داخل المدن الرئيسية مع دفعة أولى مرنة.",
          interestRate: 4.25,
          minDownPaymentPercent: 10,
          maxTenorYears: 25,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
        buildMortgageProduct({
          name: "باقة السكن الأول",
          description: "تمويل مدعوم للمشترين لأول مرة مع مرونة في الدفعة الأولى.",
          interestRate: 4.05,
          minDownPaymentPercent: 5,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "townhouse"],
        }),
        buildMortgageProduct({
          name: "تمويل الفلل التنفيذية",
          description: "خيار مخصص للفلل الجاهزة والوحدات عالية القيمة في شمال الرياض وجدة.",
          interestRate: 4.48,
          minDownPaymentPercent: 15,
          maxTenorYears: 25,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa", "duplex"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[1],
      name: "مصرف الراجحي",
      contactEmail: "housing@rajhi.seed.anansa.local",
      description: "باقات تمويل عقاري للأسر الباحثة عن شراء أول سكن أو استبدال السكن الحالي.",
      products: [
        buildMortgageProduct({
          name: "الشراء الأول",
          description: "تمويل مخصص للمشترين لأول مرة مع سداد مرن.",
          interestRate: 4.22,
          minDownPaymentPercent: 8,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa"],
        }),
        buildMortgageProduct({
          name: "التمويل المرن",
          description: "باقة تسمح بدفعة أولى أقل مع خيارات سداد ممتدة.",
          interestRate: 4.58,
          minDownPaymentPercent: 7,
          maxTenorYears: 28,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "townhouse", "duplex"],
        }),
        buildMortgageProduct({
          name: "فلل العائلة",
          description: "مناسب للعائلات الباحثة عن فلل سكنية كبيرة أو منازل مزدوجة.",
          interestRate: 4.66,
          minDownPaymentPercent: 15,
          maxTenorYears: 25,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["villa", "duplex"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[2],
      name: "بنك الرياض",
      contactEmail: "homes@riyad.seed.anansa.local",
      description: "تمويل للمشاريع السكنية المتوسطة والعالية مع دعم وحدات الاستثمار العائلي.",
      products: [
        buildMortgageProduct({
          name: "تمويل المستثمر السكني",
          description: "مسار لشراء الوحدات ذات الطلب الإيجاري المرتفع.",
          interestRate: 4.55,
          minDownPaymentPercent: 15,
          maxTenorYears: 25,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
        buildMortgageProduct({
          name: "السكن المدعوم",
          description: "باقة للمستفيدين من برامج الدعم مع معدل تمويل تنافسي.",
          interestRate: 4.18,
          minDownPaymentPercent: 5,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa", "townhouse"],
        }),
        buildMortgageProduct({
          name: "تمويل الفلل الراقية",
          description: "موجه للفلل الجاهزة أو شبه الجاهزة في الأحياء العليا.",
          interestRate: 4.74,
          minDownPaymentPercent: 20,
          maxTenorYears: 22,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[3],
      name: "مصرف الإنماء",
      contactEmail: "residential@alinma.seed.anansa.local",
      description: "حلول تمويل للعائلات الباحثة عن وحدات جاهزة وقريبة التسليم.",
      products: [
        buildMortgageProduct({
          name: "تمويل الأسرة",
          description: "منتج تمويلي للوحدات متعددة الغرف مع دعم الدفعة الأولى.",
          interestRate: 4.35,
          minDownPaymentPercent: 10,
          maxTenorYears: 27,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa", "townhouse"],
        }),
        buildMortgageProduct({
          name: "تمويل التسليم القريب",
          description: "مخصص للمشاريع القريبة من التسليم أو الجاهزة للسكن الفوري.",
          interestRate: 4.29,
          minDownPaymentPercent: 9,
          maxTenorYears: 25,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
        buildMortgageProduct({
          name: "مرونة الدفعة الأولى",
          description: "للأسر التي تحتاج هامشاً أقل في الدفعة الأولى مع مدة أطول.",
          interestRate: 4.62,
          minDownPaymentPercent: 7,
          maxTenorYears: 30,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "townhouse"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[4],
      name: "بنك الجزيرة",
      contactEmail: "finance@jazira.seed.anansa.local",
      description: "مسارات تمويل لشراء الشقق والفلل الصغيرة داخل جدة والرياض والمنطقة الشرقية.",
      products: [
        buildMortgageProduct({
          name: "تمويل الوحدات المرنة",
          description: "خيار يناسب الباحثين عن دفعات منخفضة ومدة أطول.",
          interestRate: 4.7,
          minDownPaymentPercent: 8,
          maxTenorYears: 30,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "townhouse", "duplex"],
        }),
        buildMortgageProduct({
          name: "السكن الأول المدعوم",
          description: "حزمة للسكن الأول مع مزايا دعم وتمويل تدريجي.",
          interestRate: 4.24,
          minDownPaymentPercent: 5,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa"],
        }),
        buildMortgageProduct({
          name: "تمويل الفلل الصغيرة",
          description: "موجه للفلل الصغيرة والعقارات العائلية داخل المدن الكبرى.",
          interestRate: 4.68,
          minDownPaymentPercent: 12,
          maxTenorYears: 25,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa", "duplex"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[5],
      name: "بنك البلاد",
      contactEmail: "housing@bilad.seed.anansa.local",
      description: "خيارات تمويل للمشاريع السكنية الحديثة والشقق العائلية داخل المدن المتنامية.",
      products: [
        buildMortgageProduct({
          name: "تمويل المدن الحديثة",
          description: "مناسب للمشاريع الجديدة في أطراف الرياض وجدة والخبر.",
          interestRate: 4.31,
          minDownPaymentPercent: 10,
          maxTenorYears: 28,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "townhouse"],
        }),
        buildMortgageProduct({
          name: "السكن الأول المرن",
          description: "حل تمويلي للمشترين لأول مرة مع مرونة في الدفعة الأولى.",
          interestRate: 4.12,
          minDownPaymentPercent: 6,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa"],
        }),
        buildMortgageProduct({
          name: "تمويل الفلل المتوسطة",
          description: "للعائلات التي تبحث عن فلل متوسطة المساحة في أحياء متكاملة.",
          interestRate: 4.57,
          minDownPaymentPercent: 14,
          maxTenorYears: 24,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[6],
      name: "البنك السعودي الفرنسي",
      contactEmail: "mortgage@bsf.seed.anansa.local",
      description: "منتجات تمويل عقاري للشقق الراقية والفلل الجاهزة والاستبدال السكني.",
      products: [
        buildMortgageProduct({
          name: "تمويل الشقق الراقية",
          description: "مخصص للشقق الراقية والمجمعات الحديثة داخل الأحياء المركزية.",
          interestRate: 4.41,
          minDownPaymentPercent: 12,
          maxTenorYears: 25,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
        buildMortgageProduct({
          name: "الاستبدال السكني",
          description: "للأسر الراغبة في الانتقال من سكن حالي إلى وحدة أكبر.",
          interestRate: 4.49,
          minDownPaymentPercent: 10,
          maxTenorYears: 27,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "villa", "townhouse"],
        }),
        buildMortgageProduct({
          name: "فلل المدن الكبرى",
          description: "موجه لفلل شمال الرياض وأحياء جدة الحديثة والمجتمعات المغلقة.",
          interestRate: 4.72,
          minDownPaymentPercent: 18,
          maxTenorYears: 22,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[7],
      name: "البنك العربي الوطني",
      contactEmail: "homes@anb.seed.anansa.local",
      description: "تمويل مرن للوحدات السكنية والاستثمار العائلي والشراء الأول.",
      products: [
        buildMortgageProduct({
          name: "تمويل الأسرة المتنامية",
          description: "يدعم شراء شقق أو تاون هاوس للعائلات في مراحل التوسع.",
          interestRate: 4.34,
          minDownPaymentPercent: 9,
          maxTenorYears: 28,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "townhouse"],
        }),
        buildMortgageProduct({
          name: "برنامج المشتري الأول",
          description: "مناسب للمشتري الأول مع دعم سداد ومرونة أعلى في السنوات الأولى.",
          interestRate: 4.16,
          minDownPaymentPercent: 5,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "villa"],
        }),
        buildMortgageProduct({
          name: "الاستثمار العائلي",
          description: "لوحدات قابلة للتأجير أو السكن المشترك مع عائد مستقر.",
          interestRate: 4.63,
          minDownPaymentPercent: 15,
          maxTenorYears: 25,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[8],
      name: "ساب",
      contactEmail: "residential@sabb.seed.anansa.local",
      description: "خيارات تمويل للمشاريع الكبرى والفلل المميزة ووحدات السكن الأول.",
      products: [
        buildMortgageProduct({
          name: "تمويل السكن الأول",
          description: "حزمة تنافسية للشراء الأول داخل المشاريع السكنية الكبرى.",
          interestRate: 4.11,
          minDownPaymentPercent: 5,
          maxTenorYears: 30,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "townhouse", "villa"],
        }),
        buildMortgageProduct({
          name: "تمويل المجتمعات المسوّرة",
          description: "للوحدات داخل المجتمعات الحديثة والمشاريع المتكاملة.",
          interestRate: 4.44,
          minDownPaymentPercent: 10,
          maxTenorYears: 26,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["townhouse", "villa", "duplex"],
        }),
        buildMortgageProduct({
          name: "الفلل عالية القيمة",
          description: "مناسب للعقارات مرتفعة القيمة مع مدد سداد محسوبة.",
          interestRate: 4.79,
          minDownPaymentPercent: 20,
          maxTenorYears: 22,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa"],
        }),
      ],
    },
    {
      slug: BANK_SLUGS[9],
      name: "البنك السعودي للاستثمار",
      contactEmail: "mortgage@saib.seed.anansa.local",
      description: "حلول تمويل للشقق والفلل الصغيرة والمشاريع ذات الجاهزية العالية.",
      products: [
        buildMortgageProduct({
          name: "تمويل الوحدات الجاهزة",
          description: "تمويل للمشاريع الجاهزة مع سرعة موافقة وقوائم أسعار واضحة.",
          interestRate: 4.28,
          minDownPaymentPercent: 10,
          maxTenorYears: 27,
          salaryTransferRequired: true,
          supportedPropertyTypes: ["apartment", "duplex"],
        }),
        buildMortgageProduct({
          name: "خطة الدفعة المرنة",
          description: "توازن بين دفعة أولى مخفضة ومدة تمويل أطول للمشترين الجادين.",
          interestRate: 4.61,
          minDownPaymentPercent: 7,
          maxTenorYears: 30,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["apartment", "townhouse"],
        }),
        buildMortgageProduct({
          name: "برنامج الفلل الصغيرة",
          description: "خيار للعائلات الباحثة عن فيلا صغيرة أو دوبلكس داخل الأحياء الحديثة.",
          interestRate: 4.54,
          minDownPaymentPercent: 12,
          maxTenorYears: 25,
          salaryTransferRequired: false,
          supportedPropertyTypes: ["villa", "duplex"],
        }),
      ],
    },
  ];
}

async function findProfileByAuthUserId(ctx: MutationCtx, authUserId: string) {
  return ctx.db.query("userProfiles").withIndex("authUserId", (q) => q.eq("authUserId", authUserId)).first();
}

async function findProfileByEmail(ctx: MutationCtx, email: string) {
  return ctx.db.query("userProfiles").withIndex("email", (q) => q.eq("email", email)).first();
}

async function ensureProfile(args: {
  ctx: MutationCtx;
  authUserId: string;
  email: string;
  name: string;
  username: string;
  role: "broker" | "developer";
  brokerId?: Id<"brokers">;
  developerId?: Id<"RED">;
  currentTenantOrgId?: string;
}) {
  const now = Date.now();
  const existing =
    (await findProfileByAuthUserId(args.ctx, args.authUserId)) ??
    (await findProfileByEmail(args.ctx, normalizeEmail(args.email)));
  const patch = {
    authUserId: args.authUserId,
    email: normalizeEmail(args.email),
    name: args.name,
    username: args.username,
    usernameLower: args.username.toLowerCase(),
    role: args.role,
    brokerId: args.brokerId,
    developerId: args.developerId,
    REDId: undefined,
    currentTenantOrgId: args.currentTenantOrgId,
    isActive: true,
    roleApprovalStatus: "approved" as const,
    roleStatus: undefined,
    requestedRole: undefined,
    updatedAt: now,
  };
  if (existing) {
    await args.ctx.db.patch(existing._id, {
      ...patch,
      createdAt: existing.createdAt ?? now,
    } as any);
    return (await args.ctx.db.get(existing._id))!;
  }
  const profileId = await args.ctx.db.insert("userProfiles", {
    ...patch,
    createdAt: now,
  } as any);
  return (await args.ctx.db.get(profileId))!;
}

async function ensureBank(ctx: MutationCtx, record: BankSeedRecord) {
  const existing = await ctx.db.query("banks").withIndex("slug", (q) => q.eq("slug", record.slug)).first();
  const payload = {
    name: record.name,
    slug: record.slug,
    contactEmail: record.contactEmail,
    description: record.description,
    status: "active" as const,
    products: record.products,
    rules: {
      namespace: SAUDI_SEED_NAMESPACE,
    },
  };
  if (existing) {
    await ctx.db.patch(existing._id, payload as any);
    return existing._id;
  }
  return ctx.db.insert("banks", payload as any);
}

async function ensureComplianceRuleset(ctx: MutationCtx, orgType: "broker" | "red") {
  const existing = await ctx.db
    .query("complianceRulesets")
    .withIndex("country_org_status", (q: any) => q.eq("countryCode", "SA").eq("orgType", orgType).eq("status", "active"))
    .first();
  const now = Date.now();
  const payload = {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType,
    status: "active" as const,
    version: 1,
    requirements: [],
    sources: [],
    enforcement: {
      blockPublish: true,
      hideUnverified: true,
      showBanner: true,
      requireOrgVerification: true,
      requireListingVerification: true,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (existing) {
    await ctx.db.patch(existing._id, payload as any);
    return existing._id;
  }
  return ctx.db.insert("complianceRulesets", payload as any);
}

async function ensureOrganizationProfileLinks(args: {
  ctx: MutationCtx;
  profileAuthUserId: string;
  profileEmail: string;
  name: string;
  ownerType: OrganizationKind;
  brokerId?: Id<"brokers">;
  developerId?: Id<"RED">;
  tenantOrgId: string;
}) {
  const username = slugifyAscii(args.profileEmail.split("@")[0] ?? args.profileAuthUserId) || args.profileAuthUserId.slice(0, 24);
  return ensureProfile({
    ctx: args.ctx,
    authUserId: args.profileAuthUserId,
    email: args.profileEmail,
    name: args.name,
    username,
    role: args.ownerType === "broker" ? "broker" : "developer",
    brokerId: args.brokerId,
    developerId: args.developerId,
    currentTenantOrgId: args.tenantOrgId,
  });
}

async function ensureTenantOrgLinkForExistingOwner(args: {
  ctx: MutationCtx;
  authUserId: string;
  ownerType: OrganizationKind;
  brokerId?: Id<"brokers">;
  REDId?: Id<"RED">;
  organizationName: string;
  organizationSlug: string;
}) {
  const now = Date.now();

  if (args.ownerType === "broker") {
    if (!args.brokerId) {
      throw new Error("Broker owner id required");
    }
    const existingLink = await args.ctx.db
      .query("tenantOrgLinks")
      .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", args.brokerId!))
      .first();
    if (existingLink) {
      return existingLink.tenantOrgId;
    }
    const tenantOrgId = await tenants.createOrganization(
      args.ctx as never,
      args.authUserId,
      args.organizationName,
      {
        slug: args.organizationSlug,
        metadata: {
          ownerType: "broker",
          ownerBrokerId: String(args.brokerId),
        },
      },
    );
    await args.ctx.db.insert("tenantOrgLinks", {
      tenantOrgId,
      ownerType: "broker",
      ownerBrokerId: args.brokerId,
      createdAt: now,
      updatedAt: now,
    } as any);
    return tenantOrgId;
  }

  if (!args.REDId) {
    throw new Error("Developer owner id required");
  }
  const existingLink = await args.ctx.db
    .query("tenantOrgLinks")
    .withIndex("ownerREDId", (q) => q.eq("ownerREDId", args.REDId!))
    .first();
  if (existingLink) {
    return existingLink.tenantOrgId;
  }
  const tenantOrgId = await tenants.createOrganization(
    args.ctx as never,
    args.authUserId,
    args.organizationName,
    {
      slug: args.organizationSlug,
      metadata: {
        ownerType: "RED",
        ownerREDId: String(args.REDId),
      },
    },
  );
  await args.ctx.db.insert("tenantOrgLinks", {
    tenantOrgId,
    ownerType: "RED",
    ownerREDId: args.REDId,
    createdAt: now,
    updatedAt: now,
  } as any);
  return tenantOrgId;
}

async function ensurePlaygroundOrganization(ctx: MutationCtx, args: { playgroundOwnerEmail: string }) : Promise<PlaygroundResult> {
  const normalizedEmail = normalizeEmail(args.playgroundOwnerEmail);
  const playgroundSlug = buildPlaygroundSlug(normalizedEmail);
  const userRecord = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", normalizedEmail)).first();
  const authUserId = userRecord ? String(userRecord._id) : buildPlaygroundAuthUserId(normalizedEmail);
  const existingProfile =
    (await findProfileByAuthUserId(ctx, authUserId)) ??
    (await findProfileByEmail(ctx, normalizedEmail));
  const existingDeveloperId = ((existingProfile as any)?.developerId ??
    (existingProfile as any)?.REDId) as Id<"RED"> | undefined;
  if (existingDeveloperId) {
    const existingProfileRecord = existingProfile!;
    const existingRed = (await ctx.db.get(existingDeveloperId)) as any;
    if (!existingRed) {
      throw new Error("Existing playground RED organization missing");
    }
    const tenantOrgId =
      existingProfileRecord.currentTenantOrgId ??
      (await ensureTenantOrgLinkForExistingOwner({
        ctx,
        authUserId,
        ownerType: "red",
        REDId: existingRed._id,
        organizationName: existingRed.name ?? PLAYGROUND_NAME,
        organizationSlug: existingRed.slug ?? playgroundSlug,
      }));
    await ctx.db.patch(existingRed._id, {
      name: PLAYGROUND_NAME,
      slug: playgroundSlug,
      description: PLAYGROUND_DESCRIPTION,
      contactEmail: normalizedEmail,
      phone: existingRed.phone ?? "+966500009999",
      website: existingRed.website ?? "https://playground.seed.anansa.local",
      countryCode: "SA",
      isVerified: true,
      status: "active",
      notes: `${SAUDI_SEED_NAMESPACE}:playground`,
    } as any);
    const profile = await ensureOrganizationProfileLinks({
      ctx,
      profileAuthUserId: authUserId,
      profileEmail: normalizedEmail,
      name: existingProfileRecord.name ?? PLAYGROUND_NAME,
      ownerType: "red",
      developerId: existingRed._id,
      tenantOrgId,
    });
    return {
      status: "reused",
      context: {
        ownerType: "red",
        ownerAuthUserId: authUserId,
        ownerProfileId: profile._id,
        ownerREDId: existingRed._id,
        tenantOrgId,
        organizationId: String(existingRed._id),
        organizationName: existingRed.name,
        organizationSlug: existingRed.slug,
        city: SAUDI_CITIES[0]!,
        isPlayground: true,
      },
    };
  }
  if (existingProfile?.brokerId) {
    const existingBroker = await ctx.db.get(existingProfile.brokerId);
    if (!existingBroker) {
      throw new Error("Existing playground broker organization missing");
    }
    const tenantOrgId =
      existingProfile.currentTenantOrgId ??
      (await ensureTenantOrgLinkForExistingOwner({
        ctx,
        authUserId,
        ownerType: "broker",
        brokerId: existingBroker._id,
        organizationName: existingBroker.name ?? PLAYGROUND_NAME,
        organizationSlug: existingBroker.slug ?? playgroundSlug,
      }));
    await ctx.db.patch(existingBroker._id, {
      name: PLAYGROUND_NAME,
      slug: playgroundSlug,
      description: PLAYGROUND_DESCRIPTION,
      contactEmail: normalizedEmail,
      phone: existingBroker.phone ?? "+966500009999",
      website: existingBroker.website ?? "https://playground.seed.anansa.local",
      countryCode: "SA",
      isVerified: true,
      status: "active",
      notes: `${SAUDI_SEED_NAMESPACE}:playground`,
    } as any);
    const profile = await ensureOrganizationProfileLinks({
      ctx,
      profileAuthUserId: authUserId,
      profileEmail: normalizedEmail,
      name: existingProfile.name ?? PLAYGROUND_NAME,
      ownerType: "broker",
      brokerId: existingBroker._id,
      tenantOrgId,
    });
    return {
      status: "reused",
      context: {
        ownerType: "broker",
        ownerAuthUserId: authUserId,
        ownerProfileId: profile._id,
        ownerBrokerId: existingBroker._id,
        tenantOrgId,
        organizationId: String(existingBroker._id),
        organizationName: existingBroker.name,
        organizationSlug: existingBroker.slug,
        city: SAUDI_CITIES[0]!,
        isPlayground: true,
      },
    };
  }
  const existingRed = await ctx.db.query("RED").withIndex("slug", (q) => q.eq("slug", playgroundSlug)).first();

  if (!existingRed) {
    const created = await createOrganizationForAuthUserRecord(ctx as any, {
      authUserId,
      email: normalizedEmail,
      displayName: existingProfile?.name ?? PLAYGROUND_NAME,
      name: PLAYGROUND_NAME,
      type: "red",
      countryCode: "SA",
      actorAuthUserId: authUserId,
    });
    const profile = (await findProfileByAuthUserId(ctx, authUserId)) ?? (await findProfileByEmail(ctx, normalizedEmail));
    const redId = (created.organization.id ?? (profile as any)?.developerId) as Id<"RED">;
    const link = await ctx.db.query("tenantOrgLinks").withIndex("ownerREDId", (q) => q.eq("ownerREDId", redId)).first();
    if (!profile || !redId || !link) {
      throw new Error("Failed to create playground organization");
    }
    await ctx.db.patch(redId, {
      name: PLAYGROUND_NAME,
      slug: playgroundSlug,
      description: PLAYGROUND_DESCRIPTION,
      contactEmail: normalizedEmail,
      phone: "+966500009999",
      website: "https://playground.seed.anansa.local",
      countryCode: "SA",
      isVerified: true,
      status: "active",
      notes: `${SAUDI_SEED_NAMESPACE}:playground`,
    } as any);
    const patchedProfile = await ensureOrganizationProfileLinks({
      ctx,
      profileAuthUserId: authUserId,
      profileEmail: normalizedEmail,
      name: profile.name ?? PLAYGROUND_NAME,
      ownerType: "red",
      developerId: redId,
      tenantOrgId: link.tenantOrgId,
    });
    return {
      status: "created",
      context: {
        ownerType: "red",
        ownerAuthUserId: authUserId,
        ownerProfileId: patchedProfile._id,
        ownerREDId: redId,
        tenantOrgId: link.tenantOrgId,
        organizationId: String(redId),
        organizationName: PLAYGROUND_NAME,
        organizationSlug: playgroundSlug,
        city: SAUDI_CITIES[0]!,
        isPlayground: true,
      },
    };
  }

  const link = await ctx.db.query("tenantOrgLinks").withIndex("ownerREDId", (q) => q.eq("ownerREDId", existingRed._id)).first();
  if (!link) {
    throw new Error("Playground organization link missing");
  }
  await ctx.db.patch(existingRed._id, {
    name: PLAYGROUND_NAME,
    slug: playgroundSlug,
    description: PLAYGROUND_DESCRIPTION,
    contactEmail: normalizedEmail,
    phone: existingRed.phone ?? "+966500009999",
    website: existingRed.website ?? "https://playground.seed.anansa.local",
    countryCode: "SA",
    isVerified: true,
    status: "active",
    notes: `${SAUDI_SEED_NAMESPACE}:playground`,
  } as any);
  const profile = await ensureOrganizationProfileLinks({
    ctx,
    profileAuthUserId: authUserId,
    profileEmail: normalizedEmail,
    name: existingProfile?.name ?? PLAYGROUND_NAME,
    ownerType: "red",
    developerId: existingRed._id,
    tenantOrgId: link.tenantOrgId,
  });
  return {
    status: "reused",
    context: {
      ownerType: "red",
      ownerAuthUserId: authUserId,
      ownerProfileId: profile._id,
      ownerREDId: existingRed._id,
      tenantOrgId: link.tenantOrgId,
      organizationId: String(existingRed._id),
      organizationName: existingRed.name,
      organizationSlug: existingRed.slug,
      city: SAUDI_CITIES[0]!,
      isPlayground: true,
    },
  };
}

async function ensureSyntheticOrganization(args: {
  ctx: MutationCtx;
  batchLabel: string;
  ownerType: OrganizationKind;
  index: number;
}) : Promise<OrganizationSeedContext> {
  const rng = createRng(`${args.batchLabel}:${args.ownerType}:${args.index}`);
  const city = chooseCityForIndex(args.index + (args.ownerType === "broker" ? 7 : 0));
  const organizationSlug = `seed-saudi-${args.ownerType}-${slugifyAscii(args.batchLabel)}-${String(args.index + 1).padStart(2, "0")}`;
  const organizationName = buildOrganizationName({
    kind: args.ownerType,
    city,
    index: args.index,
    rng,
  });
  const ownerIdentity = buildSyntheticOwnerIdentity({
    batchLabel: slugifyAscii(args.batchLabel) || "batch",
    kind: args.ownerType,
    index: args.index,
    city,
    rng,
  });
  const table = args.ownerType === "broker" ? "brokers" : "RED";
  const existingOrg = await args.ctx.db.query(table).withIndex("slug", (q: any) => q.eq("slug", organizationSlug)).first();
  if (!existingOrg) {
    const created = await createOrganizationForAuthUserRecord(args.ctx as any, {
      authUserId: ownerIdentity.authUserId,
      email: ownerIdentity.email,
      displayName: ownerIdentity.displayName,
      name: organizationName,
      type: args.ownerType,
      countryCode: "SA",
      actorAuthUserId: ownerIdentity.authUserId,
    });
    if (args.ownerType === "broker") {
      const brokerId = created.organization.id as Id<"brokers">;
      const link = await args.ctx.db
        .query("tenantOrgLinks")
        .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", brokerId))
        .first();
      if (!link) {
        throw new Error("Synthetic organization link missing");
      }
      await args.ctx.db.patch(brokerId, {
        name: organizationName,
        slug: organizationSlug,
        description: `وساطة سعودية كبيرة لاختبارات المشاريع والعملاء والعروض داخل ${city.nameAr}.`,
        contactEmail: ownerIdentity.email,
        phone: buildPhoneNumber(rng),
        website: `https://${organizationSlug}.seed.anansa.local`,
        countryCode: "SA",
        isVerified: true,
        status: "active",
        notes: `${SAUDI_SEED_NAMESPACE}:${args.batchLabel}:organization`,
      } as any);
      const profile = await ensureOrganizationProfileLinks({
        ctx: args.ctx,
        profileAuthUserId: ownerIdentity.authUserId,
        profileEmail: ownerIdentity.email,
        name: ownerIdentity.displayName,
        ownerType: args.ownerType,
        brokerId,
        tenantOrgId: link.tenantOrgId,
      });
      return {
        ownerType: args.ownerType,
        ownerAuthUserId: ownerIdentity.authUserId,
        ownerProfileId: profile._id,
        ownerBrokerId: brokerId,
        tenantOrgId: link.tenantOrgId,
        organizationId: String(brokerId),
        organizationName,
        organizationSlug,
        city,
        isPlayground: false,
      };
    }

    const redId = created.organization.id as Id<"RED">;
    const link = await args.ctx.db
      .query("tenantOrgLinks")
      .withIndex("ownerREDId", (q) => q.eq("ownerREDId", redId))
      .first();
    if (!link) {
      throw new Error("Synthetic organization link missing");
    }
    await args.ctx.db.patch(redId, {
      name: organizationName,
      slug: organizationSlug,
      description: `مطور سعودي كبير لاختبارات المشاريع والمخزون والسير التشغيلي داخل ${city.nameAr}.`,
      contactEmail: ownerIdentity.email,
      phone: buildPhoneNumber(rng),
      website: `https://${organizationSlug}.seed.anansa.local`,
      countryCode: "SA",
      isVerified: true,
      status: "active",
      notes: `${SAUDI_SEED_NAMESPACE}:${args.batchLabel}:organization`,
    } as any);
    const profile = await ensureOrganizationProfileLinks({
      ctx: args.ctx,
      profileAuthUserId: ownerIdentity.authUserId,
      profileEmail: ownerIdentity.email,
      name: ownerIdentity.displayName,
      ownerType: args.ownerType,
      developerId: redId,
      tenantOrgId: link.tenantOrgId,
    });
    return {
      ownerType: args.ownerType,
      ownerAuthUserId: ownerIdentity.authUserId,
      ownerProfileId: profile._id,
      ownerREDId: redId,
      tenantOrgId: link.tenantOrgId,
      organizationId: String(redId),
      organizationName,
      organizationSlug,
      city,
      isPlayground: false,
    };
  }

  if (args.ownerType === "broker") {
    const brokerId = existingOrg._id as Id<"brokers">;
    const link = await args.ctx.db
      .query("tenantOrgLinks")
      .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", brokerId))
      .first();
    if (!link) {
      throw new Error("Synthetic organization link missing");
    }
    await args.ctx.db.patch(brokerId, {
      name: organizationName,
      slug: organizationSlug,
      description: `وساطة سعودية كبيرة لاختبارات المشاريع والعملاء والعروض داخل ${city.nameAr}.`,
      contactEmail: ownerIdentity.email,
      phone: existingOrg.phone ?? buildPhoneNumber(rng),
      website: existingOrg.website ?? `https://${organizationSlug}.seed.anansa.local`,
      countryCode: "SA",
      isVerified: true,
      status: "active",
      notes: `${SAUDI_SEED_NAMESPACE}:${args.batchLabel}:organization`,
    } as any);
    const profile = await ensureOrganizationProfileLinks({
      ctx: args.ctx,
      profileAuthUserId: ownerIdentity.authUserId,
      profileEmail: ownerIdentity.email,
      name: ownerIdentity.displayName,
      ownerType: args.ownerType,
      brokerId,
      tenantOrgId: link.tenantOrgId,
    });
    return {
      ownerType: args.ownerType,
      ownerAuthUserId: ownerIdentity.authUserId,
      ownerProfileId: profile._id,
      ownerBrokerId: brokerId,
      tenantOrgId: link.tenantOrgId,
      organizationId: String(brokerId),
      organizationName: existingOrg.name,
      organizationSlug,
      city,
      isPlayground: false,
    };
  }

  const redId = existingOrg._id as Id<"RED">;
  const link = await args.ctx.db
    .query("tenantOrgLinks")
    .withIndex("ownerREDId", (q) => q.eq("ownerREDId", redId))
    .first();
  if (!link) {
    throw new Error("Synthetic organization link missing");
  }
  await args.ctx.db.patch(redId, {
    name: organizationName,
    slug: organizationSlug,
    description: `مطور سعودي كبير لاختبارات المشاريع والمخزون والسير التشغيلي داخل ${city.nameAr}.`,
    contactEmail: ownerIdentity.email,
    phone: existingOrg.phone ?? buildPhoneNumber(rng),
    website: existingOrg.website ?? `https://${organizationSlug}.seed.anansa.local`,
    countryCode: "SA",
    isVerified: true,
    status: "active",
    notes: `${SAUDI_SEED_NAMESPACE}:${args.batchLabel}:organization`,
  } as any);
  const profile = await ensureOrganizationProfileLinks({
    ctx: args.ctx,
    profileAuthUserId: ownerIdentity.authUserId,
    profileEmail: ownerIdentity.email,
    name: ownerIdentity.displayName,
    ownerType: args.ownerType,
    developerId: redId,
    tenantOrgId: link.tenantOrgId,
  });
  return {
    ownerType: args.ownerType,
    ownerAuthUserId: ownerIdentity.authUserId,
    ownerProfileId: profile._id,
    ownerREDId: redId,
    tenantOrgId: link.tenantOrgId,
    organizationId: String(redId),
    organizationName: existingOrg.name,
    organizationSlug,
    city,
    isPlayground: false,
  };
}

async function ensureMember(ctx: MutationCtx, args: {
  spec: SeedMemberSpec;
  organization: OrganizationSeedContext;
}) {
  const profile = await ensureProfile({
    ctx,
    authUserId: args.spec.authUserId,
    email: args.spec.email,
    name: args.spec.name,
    username: args.spec.username,
    role: args.spec.profileRole,
    brokerId: args.organization.ownerType === "broker" ? args.organization.ownerBrokerId : undefined,
    developerId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
    currentTenantOrgId: args.organization.tenantOrgId,
  });
  if (args.spec.authUserId === args.organization.ownerAuthUserId) {
    return profile;
  }
  const existingMember = await tenants.getMember(ctx as never, args.organization.tenantOrgId, args.spec.authUserId);
  if (!existingMember) {
    await tenants.addMember(
      ctx as never,
      args.organization.ownerAuthUserId,
      args.organization.tenantOrgId,
      args.spec.authUserId,
      args.spec.role,
    );
  } else if (existingMember.role !== args.spec.role) {
    await tenants.updateMemberRole(
      ctx as never,
      args.organization.ownerAuthUserId,
      args.organization.tenantOrgId,
      args.spec.authUserId,
      args.spec.role,
    );
  }
  return profile;
}

async function listExistingOwnedProperties(ctx: MutationCtx, organization: OrganizationSeedContext) {
  const rows =
    organization.ownerType === "broker"
      ? await ctx.db.query("properties").withIndex("brokerId", (q) => q.eq("brokerId", organization.ownerBrokerId!)).collect()
      : await ctx.db.query("properties").withIndex("REDId", (q) => q.eq("REDId", organization.ownerREDId!)).collect();
  return new Map(
    rows
      .filter((row) => typeof row.externalId === "string")
      .map((row) => [row.externalId as string, row]),
  );
}

async function seedProperties(args: {
  ctx: MutationCtx;
  batchLabel: string;
  organization: OrganizationSeedContext;
  propertyCount: number;
  bankIds: Id<"banks">[];
}) {
  const rng = createRng(`${args.batchLabel}:${args.organization.organizationSlug}:properties`);
  const existingByExternalId = await listExistingOwnedProperties(args.ctx, args.organization);
  const created: Id<"properties">[] = [];
  for (let index = 0; index < args.propertyCount; index += 1) {
    const district = args.organization.city.districts[index % args.organization.city.districts.length]!;
    const property = buildPropertySeed({
      batchLabel: args.batchLabel,
      organizationSlug: args.organization.organizationSlug,
      city: args.organization.city,
      district,
      propertyIndex: index,
      bankId: args.bankIds[index % args.bankIds.length],
      rng,
    });
    const payload = {
      title: property.title,
      address: property.address,
      location: property.location,
      area: property.area,
      description: property.description,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      status: property.status,
      publicationState: property.publicationState,
      bankId: property.bankId,
      searchText: buildPropertySearchText({
        title: property.title,
        address: property.address,
        description: property.description,
        location: property.location,
        area: property.area,
      }),
      media: property.media,
      heroImage: property.media[0],
      body: property.body,
      adLicenseNumber: `LIC-${slugifyAscii(property.externalId).slice(0, 20)}-${index + 1}`,
      adLicenseStatus: property.publicationState === "published" ? "approved" : "pending",
      sourceSystem: SAUDI_SEED_NAMESPACE,
      externalId: property.externalId,
      businessId: seedTag(args.batchLabel, "business", property.externalId),
      ...(args.organization.ownerType === "broker"
        ? { brokerId: args.organization.ownerBrokerId }
        : { REDId: args.organization.ownerREDId }),
    };
    const existing = existingByExternalId.get(property.externalId);
    if (existing) {
      await args.ctx.db.patch(existing._id, payload as any);
      created.push(existing._id);
    } else {
      const propertyId = await args.ctx.db.insert("properties", payload as any);
      created.push(propertyId);
    }
  }
  return created;
}

async function seedCrm(args: {
  ctx: MutationCtx;
  batchLabel: string;
  organization: OrganizationSeedContext;
  members: SeedMemberSpec[];
  properties: Id<"properties">[];
  clientCount: number;
  dealCount: number;
}) {
  const rng = createRng(`${args.batchLabel}:${args.organization.organizationSlug}:crm`);
  const ownerClientRows =
    args.organization.ownerType === "broker"
      ? await args.ctx.db.query("crmClients").withIndex("brokerId", (q) => q.eq("brokerId", args.organization.ownerBrokerId!)).collect()
      : await args.ctx.db.query("crmClients").withIndex("REDId", (q) => q.eq("REDId", args.organization.ownerREDId!)).collect();
  const existingClients = new Map(
    ownerClientRows.filter((row) => row.externalId).map((row) => [row.externalId as string, row]),
  );
  const clientIds: Id<"crmClients">[] = [];
  for (let index = 0; index < args.clientCount; index += 1) {
    const firstName = pickOne(rng, SAUDI_FIRST_NAMES);
    const lastName = pickOne(rng, SAUDI_FAMILY_NAMES);
    const externalId = seedTag(args.batchLabel, "client", `${args.organization.organizationSlug}-${index + 1}`);
    const ownerMember = args.members[index % args.members.length]!;
    const payload = {
      ownerAuthUserId: ownerMember.authUserId,
      brokerId: args.organization.ownerType === "broker" ? args.organization.ownerBrokerId : undefined,
      REDId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
      name: `${firstName} ${lastName}`,
      phone: buildPhoneNumber(rng),
      email: `${args.organization.organizationSlug}-client-${index + 1}@seed.anansa.local`,
      notes: `${pickOne(rng, CLIENT_NOTES)} [${SAUDI_SEED_NAMESPACE}]`,
      sourceSystem: SAUDI_SEED_NAMESPACE,
      externalId,
      businessId: seedTag(args.batchLabel, "crm-business", `${args.organization.organizationSlug}-${index + 1}`),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const existing = existingClients.get(externalId);
    if (existing) {
      await args.ctx.db.patch(existing._id, payload as any);
      clientIds.push(existing._id);
    } else {
      clientIds.push(await args.ctx.db.insert("crmClients", payload as any));
    }
  }

  const dealRows =
    args.organization.ownerType === "broker"
      ? await args.ctx.db.query("deals").withIndex("brokerId", (q) => q.eq("brokerId", args.organization.ownerBrokerId!)).collect()
      : await args.ctx.db.query("deals").withIndex("REDId", (q) => q.eq("REDId", args.organization.ownerREDId!)).collect();
  const existingDeals = new Map(
    dealRows.filter((row) => row.externalId).map((row) => [row.externalId as string, row]),
  );
  const dealStages: Array<"new" | "contacted" | "negotiation" | "won" | "lost"> = [
    "new",
    "contacted",
    "negotiation",
    "won",
    "lost",
  ];
  for (let index = 0; index < args.dealCount; index += 1) {
    const propertyId = args.properties[index % args.properties.length];
    const clientId = clientIds[index % clientIds.length];
    const assignee = args.members[index % args.members.length];
    const externalId = seedTag(args.batchLabel, "deal", `${args.organization.organizationSlug}-${index + 1}`);
    const payload = {
      title: `فرصة ${index + 1} - ${args.organization.organizationName}`,
      description: `${pickOne(rng, CLIENT_NOTES)} [${SAUDI_SEED_NAMESPACE}]`,
      value: randomInt(rng, 650000, 2800000),
      nextFollowUpAt: Date.now() + randomInt(rng, 1, 21) * 86400000,
      createdAt: Date.now() - randomInt(rng, 1, 45) * 86400000,
      stage: dealStages[index % dealStages.length],
      relationType: index % 4 === 0 ? "broker_managed" : "internal_client",
      crmClientId: clientId,
      relatedBrokerId:
        args.organization.ownerType === "red" && index % 4 === 0 ? undefined : args.organization.ownerBrokerId,
      REDId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
      brokerId: args.organization.ownerType === "broker" ? args.organization.ownerBrokerId : undefined,
      assignedTo: assignee ? ((await findProfileByAuthUserId(args.ctx, assignee.authUserId))?._id ?? undefined) : undefined,
      contactName: `متابعة ${index + 1}`,
      contactPhone: buildPhoneNumber(rng),
      propertyId,
      notes: `${pickOne(rng, CLIENT_NOTES)} [${SAUDI_SEED_NAMESPACE}]`,
      sourceSystem: SAUDI_SEED_NAMESPACE,
      externalId,
      businessId: seedTag(args.batchLabel, "deal-business", `${args.organization.organizationSlug}-${index + 1}`),
    };
    const existing = existingDeals.get(externalId);
    if (existing) {
      await args.ctx.db.patch(existing._id, payload as any);
    } else {
      await args.ctx.db.insert("deals", payload as any);
    }
  }
  return { clientIds };
}

async function seedOrders(args: {
  ctx: MutationCtx;
  batchLabel: string;
  organization: OrganizationSeedContext;
  properties: Id<"properties">[];
  bankIds: Id<"banks">[];
}) {
  const rng = createRng(`${args.batchLabel}:${args.organization.organizationSlug}:orders`);
  const existingOrders = await args.ctx.db.query("orders").withIndex("REDId", (q) => q.eq("REDId", args.organization.ownerREDId!)).collect().catch(() => []);
  const existingByIntent = new Map(existingOrders.filter((row: any) => row.intent).map((row: any) => [row.intent as string, row]));
  const redOrderPlan = [
    { type: "loan", status: "new_lead" },
    { type: "loan", status: "contacted" },
    { type: "property", status: "qualified" },
    { type: "loan", status: "qualified" },
    { type: "loan", status: "offer_made" },
    { type: "property", status: "contacted" },
  ] as const;
  const orderPlan = args.organization.ownerType === "red" ? redOrderPlan : [];

  if (orderPlan.length === 0) {
    return;
  }
  for (let index = 0; index < orderPlan.length; index += 1) {
    const propertyId = args.properties[index % args.properties.length];
    const selectedPlan = orderPlan[index]!;
    const property = propertyId ? await args.ctx.db.get(propertyId) : null;
    const fallbackBankId = args.bankIds[index % args.bankIds.length];
    const linkedBankId = property?.bankId ?? fallbackBankId;
    const intent = seedTag(args.batchLabel, "order", `${args.organization.organizationSlug}-${index + 1}`);
    const payload = {
      userId: `${args.organization.organizationSlug}-buyer-${index + 1}`,
      type: selectedPlan.type,
      status: selectedPlan.status,
      propertyId,
      bankId: selectedPlan.type === "loan" ? linkedBankId : undefined,
      REDId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
      intent,
      notes: "أمر seeded لدعم اختبارات التوصية والرحلة الشرائية.",
      assignedTo: args.organization.ownerAuthUserId,
      sourceChannel: "web" as const,
    };
    const existing = existingByIntent.get(intent);
    if (existing) {
      await args.ctx.db.patch(existing._id, payload as any);
    } else {
      await args.ctx.db.insert("orders", payload as any);
    }
  }
}

async function listSeedBanks(ctx: MutationCtx) {
  const banks = await Promise.all(BANK_SLUGS.map((slug) => ctx.db.query("banks").withIndex("slug", (q) => q.eq("slug", slug)).first()));
  return banks.filter((bank): bank is NonNullable<typeof bank> => Boolean(bank)).map((bank) => bank._id);
}

async function listSeedProfiles(ctx: MutationCtx, organization: OrganizationSeedContext) {
  const profiles = await ctx.db
    .query("userProfiles")
    .withIndex("currentTenantOrgId", (q) => q.eq("currentTenantOrgId", organization.tenantOrgId))
    .collect();
  return profiles.sort((left, right) => left.authUserId.localeCompare(right.authUserId));
}

async function seedLocalOfferData(args: {
  ctx: MutationCtx;
  batchLabel: string;
  organization: OrganizationSeedContext;
  properties: Id<"properties">[];
  members: SeedMemberSpec[];
  clientIds: Id<"crmClients">[];
}) {
  const rng = createRng(`${args.batchLabel}:${args.organization.organizationSlug}:offers`);
  const marker = seedTag(args.batchLabel, "offers", args.organization.organizationSlug);
  const existingPackages = await args.ctx.db.query("offerPackages").withIndex("ownerAuthUserId", (q) => q.eq("ownerAuthUserId", args.organization.ownerAuthUserId)).collect();
  const ownPackages = existingPackages.filter((pkg) => (pkg.notes ?? "").includes(marker));
  if (ownPackages.length > 0) {
    return;
  }
  const propertyId = args.properties[0];
  if (!propertyId) return;
  const property = await args.ctx.db.get(propertyId);
  if (!property) return;
  const offerPackageId = await args.ctx.db.insert("offerPackages", {
    propertyId,
    ownerAuthUserId: args.organization.ownerAuthUserId,
    fromBrokerId: args.organization.ownerType === "broker" ? args.organization.ownerBrokerId : undefined,
    fromREDId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
    title: `حزمة تعاون - ${args.organization.organizationName}`,
    summary: `حزمة seeded لاختبار الطوابير والملخصات [${SAUDI_SEED_NAMESPACE}]`,
    askingPrice: property.price,
    commissionText: "عمولة مرنة حسب الشريك والتنفيذ",
    permitStatus: property.adLicenseStatus ?? "approved",
    productStatus: property.publicationState ?? "published",
    visibility: "open",
    allowedAudience: args.organization.ownerType === "broker" ? "developers" : "brokers",
    notes: marker,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as any);
  const offerCaseId = await args.ctx.db.insert("offerCases", {
    offerPackageId,
    type: "open_offer",
    stage: "open",
    visibility: "open",
    initiatedByAuthUserId: args.organization.ownerAuthUserId,
    headline: `فرصة مفتوحة - ${args.organization.city.nameAr}`,
    summary: `قضية seeded مفتوحة لمخزون ${args.organization.organizationName} [${SAUDI_SEED_NAMESPACE}]`,
    clientContext: {
      crmClientId: args.clientIds[0],
      clientName: "عميل نوعي",
      clientPhone: buildPhoneNumber(rng),
      clientBudget: `${randomInt(rng, 900000, 2400000)} ر.س`,
      clientNeed: "مقارنة مشروعين مع تحليل تمويل سريع",
    },
    closeNote: marker,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastActivityAt: Date.now(),
  } as any);
  await args.ctx.db.insert("offerCaseParticipants", {
    offerCaseId,
    authUserId: args.organization.ownerAuthUserId,
    brokerId: args.organization.ownerType === "broker" ? args.organization.ownerBrokerId : undefined,
    REDId: args.organization.ownerType === "red" ? args.organization.ownerREDId : undefined,
    role: "inventory_owner",
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as any);
  await args.ctx.db.insert("offerActivities", {
    offerCaseId,
    kind: "case_created",
    actorAuthUserId: args.organization.ownerAuthUserId,
    message: `Seeded open offer for ${args.organization.organizationName}`,
    createdAt: Date.now(),
  } as any);
}

function isSeededMessage(message: { body: string; metadata?: unknown }) {
  const metadataText = message.metadata ? JSON.stringify(message.metadata) : "";
  return message.body.includes(SAUDI_SEED_NAMESPACE) || metadataText.includes(SAUDI_SEED_NAMESPACE);
}

async function listSeededPlaygroundParticipants(ctx: MutationCtx, playground: OrganizationSeedContext) {
  const profiles = await listSeedProfiles(ctx, playground);
  return profiles.filter((profile) => profile.authUserId !== playground.ownerAuthUserId);
}

async function listExternalSeedOwners(ctx: MutationCtx, playgroundTenantOrgId: string) {
  const profiles = await ctx.db.query("userProfiles").collect();
  return profiles.filter(
    (profile) =>
      profile.currentTenantOrgId &&
      profile.currentTenantOrgId !== playgroundTenantOrgId &&
      typeof profile.email === "string" &&
      profile.email.endsWith("@seed.anansa.local") &&
      profile.authUserId.endsWith("-owner") &&
      (profile.brokerId || (profile as any).developerId),
  );
}

async function ensureLegacyOffer(args: {
  ctx: MutationCtx;
  batchLabel: string;
  sender: Awaited<ReturnType<typeof findProfileByAuthUserId>>;
  recipient: Awaited<ReturnType<typeof findProfileByAuthUserId>>;
  propertyId: Id<"properties">;
}) {
  if (!args.sender || !args.recipient) return null;
  const marker = seedTag(args.batchLabel, "legacy-offer", `${args.sender.authUserId}:${args.recipient.authUserId}:${String(args.propertyId)}`);
  const existingOffers = await args.ctx.db.query("offers").collect();
  const existing = (existingOffers as any[]).find((offer) => offer.description === marker);
  if (existing) return existing._id as Id<"offers">;
  return args.ctx.db.insert("offers", {
    propertyId: args.propertyId,
    fromBrokerId: args.sender.brokerId,
    fromREDId: (args.sender as any).developerId,
    toBrokerId: args.recipient.brokerId,
    toREDId: (args.recipient as any).developerId,
    recipientAuthUserId: args.recipient.authUserId,
    price: 1250000,
    status: "pending",
    publicationState: "published",
    visibility: "private",
    message: `عرض seeded من ${args.sender.name ?? args.sender.email}`,
    description: marker,
    recipientEmail: args.recipient.email,
  } as any);
}

async function ensureSeededConversationNetwork(args: {
  ctx: MutationCtx;
  batchLabel: string;
  playground: OrganizationSeedContext;
}) {
  const playgroundProfiles = await listSeededPlaygroundParticipants(args.ctx, args.playground);
  const counterpartOwners = await listExternalSeedOwners(args.ctx, args.playground.tenantOrgId);
  const playgroundOwner = await findProfileByAuthUserId(args.ctx, args.playground.ownerAuthUserId);
  if (!playgroundOwner || counterpartOwners.length === 0) {
    return;
  }
  const counterpartSlice = counterpartOwners.slice(0, 4);
  for (let index = 0; index < counterpartSlice.length; index += 1) {
    const counterpart = counterpartSlice[index]!;
    const counterpartProperties = counterpart.brokerId
      ? await args.ctx.db.query("properties").withIndex("brokerId", (q) => q.eq("brokerId", counterpart.brokerId!)).collect()
      : (counterpart as any).developerId
        ? await args.ctx.db.query("properties").withIndex("REDId", (q) => q.eq("REDId", (counterpart as any).developerId!)).collect()
        : [];
    const property = counterpartProperties.find((item) => item.publicationState === "published") ?? counterpartProperties[0];
    if (!property) continue;

    const textBody = `رسالة seeded للتنسيق على مشروع ${property.title} [${SAUDI_SEED_NAMESPACE}]`;
    await appendConversationEvent(args.ctx as any, {
      senderUserId: playgroundOwner.authUserId,
      recipientUserId: counterpart.authUserId,
      type: "text",
      body: textBody,
      metadata: { contextType: "seed_message", namespace: SAUDI_SEED_NAMESPACE, batchLabel: args.batchLabel },
    });

    await appendInboxCollaborationEvent(args.ctx as any, {
      senderUserId: counterpart.authUserId,
      recipientUserId: playgroundOwner.authUserId,
      type: "project_share",
      body: `مشاركة مشروع seeded: ${property.title}`,
      metadata: {
        contextType: "project_share",
        actor: {
          authUserId: counterpart.authUserId,
          name: counterpart.name ?? counterpart.email ?? "عضو seeded",
          role: counterpart.brokerId ? "broker" : "developer",
          organizationId: counterpart.brokerId ? String(counterpart.brokerId) : String((counterpart as any).developerId),
          organizationType: counterpart.brokerId ? "broker" : "developer",
          organizationName: counterpart.brokerId
            ? (await args.ctx.db.get(counterpart.brokerId))?.name ?? counterpart.name
            : ((await args.ctx.db.get((counterpart as any).developerId!)) as any)?.name ?? counterpart.name,
        },
        recipient: {
          recipientAuthUserId: playgroundOwner.authUserId,
          organizationId: args.playground.organizationId,
          organizationType: "developer",
          organizationName: args.playground.organizationName,
        },
        title: property.title,
        summary: `بطاقة seeded لمشاركة مشروع من شبكة السوق [${SAUDI_SEED_NAMESPACE}]`,
        href: `/ws/projects/${property._id}`,
        action: {
          type: "open_project",
          label: "افتح المشروع",
          href: `/ws/projects/${property._id}`,
        },
        propertyId: String(property._id),
        location: property.location ?? property.address,
        imageUrl: property.heroImage?.url ?? property.media?.[0]?.url ?? null,
      },
    });

    const offerId = await ensureLegacyOffer({
      ctx: args.ctx,
      batchLabel: args.batchLabel,
      sender: counterpart,
      recipient: playgroundOwner,
      propertyId: property._id,
    });
    if (offerId) {
      const starter = await appendInboxOfferEvent(args.ctx as any, {
        senderUserId: counterpart.authUserId,
        targetUserId: playgroundOwner.authUserId,
        recipientBrokerId: playgroundOwner.brokerId ?? undefined,
        recipientREDId: (playgroundOwner as any).developerId ?? undefined,
        offerId: String(offerId),
        propertyId: String(property._id),
        title: `عرض seeded - ${property.title}`,
        body: `بطاقة عرض seeded تخص ${property.title}`,
        href: `/ws/offers/${offerId}`,
        price: property.price,
        visibility: "private",
        bootstrapSource: "offer_send",
        metadata: {
          namespace: SAUDI_SEED_NAMESPACE,
        },
      });
      const marker = seedTag(args.batchLabel, "cross-offer-case", `${counterpart.authUserId}:${playgroundOwner.authUserId}:${index + 1}`);
      const existingCaseRows = await args.ctx.db.query("offerCases").collect();
      const existingCase = existingCaseRows.find((row) => row.closeNote === marker);
      if (!existingCase) {
        const offerPackageId = await args.ctx.db.insert("offerPackages", {
          propertyId: property._id,
          ownerAuthUserId: counterpart.authUserId,
          fromBrokerId: counterpart.brokerId,
          fromREDId: (counterpart as any).developerId,
          title: `حزمة تعاون seeded - ${property.title}`,
          summary: `حزمة مشتركة بين playground والسوق [${SAUDI_SEED_NAMESPACE}]`,
          askingPrice: property.price,
          commissionText: "عمولة تشغيلية مرنة",
          permitStatus: property.adLicenseStatus ?? "approved",
          productStatus: property.publicationState ?? "published",
          visibility: "private",
          allowedAudience: counterpart.brokerId ? "developers" : "brokers",
          notes: marker,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any);
        const offerCaseId = await args.ctx.db.insert("offerCases", {
          offerPackageId,
          type: "private_offer",
          stage: "engaged",
          visibility: "private",
          initiatedByAuthUserId: counterpart.authUserId,
          sourceConversationId: starter?.conversationId ? (starter.conversationId as Id<"inboxConversations">) : undefined,
          headline: `تعاون seeded على ${property.title}`,
          summary: `قضية تشغيلية بين playground وشريك سوق seeded [${SAUDI_SEED_NAMESPACE}]`,
          closeNote: marker,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastActivityAt: Date.now(),
        } as any);
        await args.ctx.db.insert("offerCaseParticipants", {
          offerCaseId,
          authUserId: counterpart.authUserId,
          brokerId: counterpart.brokerId,
          REDId: (counterpart as any).developerId,
          role: "inventory_owner",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any);
        await args.ctx.db.insert("offerCaseParticipants", {
          offerCaseId,
          authUserId: playgroundOwner.authUserId,
          brokerId: playgroundOwner.brokerId,
          REDId: (playgroundOwner as any).developerId,
          role: "execution_partner",
          status: "accepted",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as any);
        await args.ctx.db.insert("offerActivities", {
          offerCaseId,
          kind: "engaged",
          actorAuthUserId: counterpart.authUserId,
          message: `Network seeded engagement with ${playgroundOwner.name ?? playgroundOwner.email}`,
          createdAt: Date.now(),
        } as any);
      }
    }
  }

  const playgroundSharedMember = playgroundProfiles[0];
  if (playgroundSharedMember && counterpartSlice[0]) {
    await appendConversationEvent(args.ctx as any, {
      senderUserId: playgroundSharedMember.authUserId,
      recipientUserId: counterpartSlice[0]!.authUserId,
      type: "text",
      body: `متابعة seeded من عضو الفريق على فرصة السوق [${SAUDI_SEED_NAMESPACE}]`,
      metadata: { contextType: "seed_message", namespace: SAUDI_SEED_NAMESPACE, batchLabel: args.batchLabel },
    });
  }
}

export async function ensureSaudiSeedBanks(ctx: MutationCtx) {
  await ensureComplianceRuleset(ctx, "broker");
  await ensureComplianceRuleset(ctx, "red");
  const bankIds: Id<"banks">[] = [];
  for (const bank of buildBankSeeds()) {
    bankIds.push(await ensureBank(ctx, bank));
  }
  return bankIds;
}

export async function seedSaudiOrganizationChunk(args: {
  ctx: MutationCtx;
  batchLabel: string;
  ownerType: OrganizationKind;
  index: number;
  isPlayground?: boolean;
  playgroundOwnerEmail?: string;
}) {
  const bankIds = await listSeedBanks(args.ctx);
  const playgroundResult = args.isPlayground
    ? await ensurePlaygroundOrganization(args.ctx, {
        playgroundOwnerEmail: args.playgroundOwnerEmail ?? "",
      })
    : null;
  const organization = playgroundResult
    ? playgroundResult.context
    : await ensureSyntheticOrganization({
        ctx: args.ctx,
        batchLabel: args.batchLabel,
        ownerType: args.ownerType,
        index: args.index,
      });
  const rng = createRng(`${args.batchLabel}:${organization.organizationSlug}:counts`);
  const counts = buildOrganizationCounts(rng);
  const memberSpecs = buildMemberSpecs({
    batchLabel: args.batchLabel,
    organizationSlug: organization.organizationSlug,
    city: organization.city,
    ownerType: organization.ownerType,
    memberCount: counts.memberCount,
    rng,
    ownerAuthUserId: organization.ownerAuthUserId,
    ownerEmail:
      (await findProfileByAuthUserId(args.ctx, organization.ownerAuthUserId))?.email ??
      `${organization.organizationSlug}@seed.anansa.local`,
    ownerName:
      (await findProfileByAuthUserId(args.ctx, organization.ownerAuthUserId))?.name ??
      organization.organizationName,
    isPlayground: organization.isPlayground,
  });
  for (const memberSpec of memberSpecs) {
    await ensureMember(args.ctx, {
      spec: memberSpec,
      organization,
    });
  }
  const properties = await seedProperties({
    ctx: args.ctx,
    batchLabel: args.batchLabel,
    organization,
    propertyCount: counts.propertyCount,
    bankIds,
  });
  const { clientIds } = await seedCrm({
    ctx: args.ctx,
    batchLabel: args.batchLabel,
    organization,
    members: memberSpecs,
    properties,
    clientCount: counts.clientCount,
    dealCount: counts.dealCount,
  });
  await seedLocalOfferData({
    ctx: args.ctx,
    batchLabel: args.batchLabel,
    organization,
    properties,
    members: memberSpecs,
    clientIds,
  });
  if (organization.ownerType === "red") {
    await seedOrders({
      ctx: args.ctx,
      batchLabel: args.batchLabel,
      organization,
      properties,
      bankIds,
    });
  }
  return {
    organizationId: organization.organizationId,
    ownerAuthUserId: organization.ownerAuthUserId,
    tenantOrgId: organization.tenantOrgId,
    isPlayground: organization.isPlayground,
    playgroundStatus: playgroundResult?.status,
  };
}

export async function ensureSaudiPlaygroundNetwork(ctx: MutationCtx, args: {
  batchLabel: string;
  playgroundOwnerEmail: string;
}) {
  const playground = await ensurePlaygroundOrganization(ctx, {
    playgroundOwnerEmail: args.playgroundOwnerEmail,
  });
  await ensureSeededConversationNetwork({
    ctx,
    batchLabel: args.batchLabel,
    playground: playground.context,
  });
  return {
    playgroundOrganizationId: playground.context.organizationId,
    playgroundStatus: playground.status,
  };
}

export async function buildSaudiSeedSummary(ctx: MutationCtx, args: {
  batchLabel: string;
  playgroundOwnerEmail: string;
}) : Promise<SeedSummary> {
  const slugPrefix = "seed-saudi-";
  const [brokers, developers, profiles, properties, clients, deals, packages, cases, legacyOffers, conversations, messages, banks, orders] =
    await Promise.all([
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("userProfiles").collect(),
      ctx.db.query("properties").collect(),
      ctx.db.query("crmClients").collect(),
      ctx.db.query("deals").collect(),
      ctx.db.query("offerPackages").collect(),
      ctx.db.query("offerCases").collect(),
      ctx.db.query("offers").collect(),
      ctx.db.query("inboxConversations").collect(),
      ctx.db.query("inboxMessages").collect(),
      ctx.db.query("banks").collect(),
      ctx.db.query("orders").collect(),
    ]);
  const playgroundSlug = buildPlaygroundSlug(args.playgroundOwnerEmail);
  const playgroundRed = developers.find((row) => row.slug === playgroundSlug) ?? null;
  const filteredMessages = messages.filter((message) => isSeededMessage(message));
  const filteredConversationIds = new Set(filteredMessages.map((message) => String(message.conversationId)));
  const seededProfiles = profiles.filter(
    (profile) =>
      profile.authUserId.startsWith("seed-saudi-") ||
      normalizeEmail(profile.email ?? "") === normalizeEmail(args.playgroundOwnerEmail),
  );
  const filteredPackages = packages.filter((row) => (row.notes ?? "").includes(SAUDI_SEED_NAMESPACE));
  const filteredCases = cases.filter((row) => (row.summary ?? "").includes(SAUDI_SEED_NAMESPACE) || (row.closeNote ?? "").includes(SAUDI_SEED_NAMESPACE));
  const filteredLegacyOffers = legacyOffers.filter((row) => (row.description ?? "").includes(SAUDI_SEED_NAMESPACE));
  const filteredBanks = banks.filter((bank) => BANK_SLUGS.includes(bank.slug as (typeof BANK_SLUGS)[number]));
  const filteredOrders = orders.filter((row) => (row.intent ?? "").includes(`${SAUDI_SEED_NAMESPACE}:`));
  const filteredProperties = properties.filter((row) => row.sourceSystem === SAUDI_SEED_NAMESPACE);

  return {
    batchLabel: args.batchLabel,
    organizations:
      brokers.filter((row) => row.slug.startsWith(slugPrefix)).length +
      developers.filter((row) => row.slug.startsWith(slugPrefix)).length,
    developers: developers.filter((row) => row.slug.startsWith(slugPrefix)).length,
    brokers: brokers.filter((row) => row.slug.startsWith(slugPrefix)).length,
    members: seededProfiles.length,
    properties: filteredProperties.length,
    crmClients: clients.filter((row) => row.sourceSystem === SAUDI_SEED_NAMESPACE).length,
    deals: deals.filter((row) => row.sourceSystem === SAUDI_SEED_NAMESPACE).length,
    offerPackages: filteredPackages.length,
    offerCases: filteredCases.length,
    legacyOffers: filteredLegacyOffers.length,
    offers: filteredCases.length + filteredLegacyOffers.length,
    conversations: conversations.filter((conversation) => filteredConversationIds.has(String(conversation._id))).length,
    messages: filteredMessages.length,
    banks: filteredBanks.length,
    bankProducts: filteredBanks.reduce((sum, bank) => sum + (bank.products?.length ?? 0), 0),
    orders: filteredOrders.length,
    loanOrders: filteredOrders.filter((row) => row.type === "loan").length,
    propertyOrders: filteredOrders.filter((row) => row.type === "property").length,
    publishedPropertiesWithBank: filteredProperties.filter((row) => row.publicationState === "published" && row.bankId).length,
    playgroundOrganizationId: playgroundRed ? String(playgroundRed._id) : null,
    playgroundStatus: playgroundRed ? "reused" : "created",
  };
}
