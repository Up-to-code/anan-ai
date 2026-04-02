import type { AppLocale } from "@/lib/locale";
import type { BuyerChatSuggestion } from "./types";

/**
 * WHY:   The buyer assistant needs ready-to-send prompts before the user types anything.
 * WHAT:  Returns the default prompt chips for the buyer journey locale.
 * HOW:   Keeps the prompts short, buyer-oriented, and aligned with the deterministic Convex assistant contract.
 */
export function buildBuyerChatSuggestions(locale: AppLocale): BuyerChatSuggestion[] {
  if (locale === "en") {
    return [
      { id: "budget", label: "Apartments in Riyadh", prompt: "Show me apartments in Riyadh" },
      { id: "finance", label: "Check financing", prompt: "Check mortgage eligibility for me" },
      { id: "compare", label: "Compare options", prompt: "Compare the best two options" },
      { id: "advisor", label: "Talk to an advisor", prompt: "Connect me to an advisor" },
    ];
  }

  if (locale === "fr") {
    return [
      { id: "budget", label: "Appartements à Riyad", prompt: "Montre-moi des appartements à Riyad" },
      { id: "finance", label: "Vérifier le financement", prompt: "Vérifie mon éligibilité au financement" },
      { id: "compare", label: "Comparer les options", prompt: "Compare les deux meilleures options" },
      { id: "advisor", label: "Parler à un conseiller", prompt: "Mets-moi en relation avec un conseiller" },
    ];
  }

  return [
    { id: "budget", label: "شقق في الرياض", prompt: "اعرض شقق في الرياض" },
    { id: "finance", label: "أهلية التمويل", prompt: "افحص أهلية التمويل" },
    { id: "compare", label: "قارن الخيارات", prompt: "قارن أفضل خيارين" },
    { id: "advisor", label: "اطلب مستشاراً", prompt: "وصّلني بمستشار" },
  ];
}
