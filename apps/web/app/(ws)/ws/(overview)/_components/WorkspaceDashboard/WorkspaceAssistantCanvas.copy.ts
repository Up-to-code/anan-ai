import type { AppLocale } from "@/lib/locale";

type SuggestionCopy = {
  label: string;
};

export function getWorkspaceAssistantLandingCopy(locale: AppLocale) {
  const suggestionLabels: Record<AppLocale, SuggestionCopy[]> = {
    ar: [
      { label: "أنشئ عرض سعر لعميل مهتم بمشروع سكني" },
      { label: "حلّل حركة السوق العقاري في الرياض هذا الأسبوع" },
      { label: "ما هي المشاريع الجديدة القريبة من منافسينا؟" },
      { label: "قارن أداء الوسطاء في فريقي خلال آخر ٣٠ يوم" },
    ],
    en: [
      { label: "Prepare a price offer for a client interested in a residential project" },
      { label: "Analyze Riyadh real estate market activity this week" },
      { label: "Which new projects are close to our competitors?" },
      { label: "Compare my team's broker performance over the last 30 days" },
    ],
    fr: [
      { label: "Préparez une offre de prix pour un client intéressé par un projet résidentiel" },
      { label: "Analysez le mouvement du marché immobilier à Riyad cette semaine" },
      { label: "Quels nouveaux projets sont proches de nos concurrents ?" },
      { label: "Comparez la performance des courtiers de mon équipe sur les 30 derniers jours" },
    ],
  };

  const defaults = {
    ar: {
      unavailableTitle: "تعذر العثور على المحادثة المطلوبة.",
      newConversationLabel: "بدء محادثة جديدة",
      landingTitle: "كيف يمكنني مساعدتك اليوم؟",
    },
    en: {
      unavailableTitle: "Could not find the requested conversation.",
      newConversationLabel: "Start a new conversation",
      landingTitle: "How can I help you today?",
    },
    fr: {
      unavailableTitle: "Impossible de trouver la conversation demandée.",
      newConversationLabel: "Démarrer une nouvelle conversation",
      landingTitle: "Comment puis-je vous aider aujourd'hui ?",
    },
  } satisfies Record<AppLocale, {
    unavailableTitle: string;
    newConversationLabel: string;
    landingTitle: string;
  }>;

  return {
    ...defaults[locale],
    suggestionLabels: suggestionLabels[locale],
  };
}
