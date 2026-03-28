import type { ChatSuggestion, Locale } from "./types";

/**
 * WHY:   The chat surface needs route-aware prompt starters without hardcoding them inside the shell component.
 * WHAT:  Returns the visible quick-start suggestions for the requested mode and locale.
 * HOW:   Keeps production suggestions focused on live discovery and financing flows, excluding demo-only actions.
 */
export function buildChatSuggestions(
  locale: Locale,
  mode: "default" | "search" | "loans",
): ChatSuggestion[] {
  if (mode === "search") {
    return locale === "ar"
      ? [
          { id: "s1", label: "شقة في الرياض", prompt: "أبحث عن شقة في الرياض" },
          { id: "s2", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
          { id: "s3", label: "استثمار", prompt: "أريد خيارات مناسبة للاستثمار" },
        ]
      : [
          { id: "s1", label: "Riyadh apartment", prompt: "Find an apartment in Riyadh" },
          { id: "s2", label: "Compare options", prompt: "Compare the best options" },
          { id: "s3", label: "Investment", prompt: "Show investment-friendly options" },
        ];
  }

  if (mode === "loans") {
    return locale === "ar"
      ? [
          { id: "l1", label: "فحص الأهلية", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
          { id: "l2", label: "خطة سداد", prompt: "اعرض خطة سداد مبدئية" },
          { id: "l3", label: "قرض لشقة", prompt: "أريد تمويل لشقة في الرياض" },
        ]
      : [
          { id: "l1", label: "Check eligibility", prompt: "Does a SAR 15,000 salary qualify me?" },
          { id: "l2", label: "Payment plan", prompt: "Show me a starter payment plan" },
          { id: "l3", label: "Loan for apartment", prompt: "I need financing for an apartment in Riyadh" },
        ];
  }

  return locale === "ar"
    ? [
        { id: "d1", label: "أبحث عن شقة", prompt: "أبحث عن شقة في الرياض" },
        { id: "d2", label: "فحص التمويل", prompt: "هل راتبي 15000 مناسب للتمويل؟" },
        { id: "d3", label: "قارن الخيارات", prompt: "قارن أفضل الخيارات" },
      ]
    : [
        { id: "d1", label: "Find apartment", prompt: "Find an apartment in Riyadh" },
        { id: "d2", label: "Check financing", prompt: "Does a SAR 15,000 salary qualify me?" },
        { id: "d3", label: "Compare options", prompt: "Compare the best options" },
      ];
}
