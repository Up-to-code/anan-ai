import { AppLocale } from "./locale";

export type Dictionary = typeof ar;

const ar = {
  assistant: {
    welcome: "مرحباً! كيف يمكنني مساعدتك في العثور على عقارك المثالي اليوم؟",
    placeholder: "اكتب رسالتك هنا...",
    send: "إرسال",
    suggested_prompts: "اقتراحات:",
  },
  property: {
    price: "السعر",
    area: "المساحة",
    beds: "غرف",
    baths: "حمامات",
    sqft: "قدم مربع",
    view_details: "عرض التفاصيل",
  },
  common: {
    loading: "جاري التحميل...",
    error: "حدث خطأ ما",
    retry: "إعادة المحاولة",
  }
};

const en: Dictionary = {
  assistant: {
    welcome: "Hello! How can I help you find your perfect property today?",
    placeholder: "Type your message here...",
    send: "Send",
    suggested_prompts: "Suggestions:",
  },
  property: {
    price: "Price",
    area: "Area",
    beds: "Beds",
    baths: "Baths",
    sqft: "Sqft",
    view_details: "View Details",
  },
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
  }
};

const fr: Dictionary = {
  assistant: {
    welcome: "Bonjour ! Comment puis-je vous aider à trouver votre propriété idéale aujourd'hui ?",
    placeholder: "Tapez votre message ici...",
    send: "Envoyer",
    suggested_prompts: "Suggestions :",
  },
  property: {
    price: "Prix",
    area: "Surface",
    beds: "Chambres",
    baths: "Salles de bain",
    sqft: "Pieds carrés",
    view_details: "Voir les détails",
  },
  common: {
    loading: "Chargement...",
    error: "Une erreur est survenue",
    retry: "Réessayer",
  }
};

const dictionaries: Record<AppLocale, Dictionary> = { ar, en, fr };

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale] || ar;
}
