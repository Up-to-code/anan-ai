import type { MobileBroker } from "@/types/mobile";

const MOCK_BROKERS: MobileBroker[] = [
  {
    id: "broker-nesma-rizk",
    slug: "nesma-rizk",
    name: "Nesma Rizk",
    avatar: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=800&q=80",
    company: "Scouts",
    badges: [
      { id: "call", label: "موصى", tone: "plum" },
      { id: "diamond", label: "معتمد", tone: "sky" },
      { id: "trubroker", label: "TruBroker", tone: "ink" },
    ],
    languages: ["en"],
    phone: "+201001112233",
    whatsapp: "+201001112233",
    isVerified: true,
    location: "القاهرة الجديدة",
    bio: "وسيطة تركز على شراء السكن الأول والاستثمار متوسط الأجل مع متابعة عملية حتى الإغلاق.",
    listingCount: 18,
    rating: 4.9,
    relatedPropertyIds: ["hittin-panorama", "yasmin-duplex-garden"],
  },
  {
    id: "broker-nada-elhoseiny",
    slug: "nada-elhoseiny",
    name: "Nada Elhouseiny",
    avatar: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    company: "Scouts",
    badges: [
      { id: "call", label: "موصى", tone: "plum" },
      { id: "diamond", label: "معتمد", tone: "sky" },
      { id: "trubroker", label: "TruBroker", tone: "ink" },
    ],
    languages: ["en", "ar"],
    phone: "+201022233344",
    whatsapp: "+201022233344",
    isVerified: true,
    location: "الشيخ زايد",
    bio: "متخصصة في المجتمعات الجديدة والفلل العائلية مع سرعة عالية في المتابعة وتنسيق الزيارات.",
    listingCount: 14,
    rating: 4.8,
    relatedPropertyIds: ["malqa-family-villa", "narjis-smart-villa"],
  },
  {
    id: "broker-yara-el-desuki",
    slug: "yara-el-desuki",
    name: "Yara El Desuki",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    company: "Egypt Best Properties",
    badges: [
      { id: "call", label: "موصى", tone: "plum" },
      { id: "diamond", label: "معتمد", tone: "sky" },
      { id: "trubroker", label: "TruBroker", tone: "ink" },
    ],
    languages: ["en"],
    phone: "+201033344455",
    whatsapp: "+201033344455",
    isVerified: true,
    location: "المعادي",
    bio: "تغطي خيارات السكن والاستثمار في القاهرة مع عرض واضح وخيارات مقارنة سريعة للمشتري.",
    listingCount: 11,
    rating: 4.7,
    relatedPropertyIds: ["aqiq-invest-apartment", "jeddah-luxury-flat"],
  },
];

export function getMockBrokers() {
  return MOCK_BROKERS;
}

export function getMockBrokerById(id?: string) {
  if (!id) return null;
  return MOCK_BROKERS.find((broker) => broker.id === id) ?? null;
}

export function filterMockBrokers(args: {
  brokers: MobileBroker[];
  query: string;
  location: string;
  verifiedOnly: boolean;
}) {
  const normalizedQuery = args.query.trim().toLowerCase();

  return args.brokers.filter((broker) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      broker.name.toLowerCase().includes(normalizedQuery) ||
      broker.company.toLowerCase().includes(normalizedQuery);
    const matchesLocation = args.location === "all" || args.location === "كل المناطق" || broker.location === args.location;
    const matchesVerification = !args.verifiedOnly || broker.isVerified;

    return matchesQuery && matchesLocation && matchesVerification;
  });
}
