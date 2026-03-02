/**
 * config.ts — anan_recommender Agent Configuration
 *
 * WHY:   Users benefit from personalized recommendations based on their
 *        history, preferences, and knowledge base — not just raw search.
 * WHAT:  Uses user knowledge base + search results to make smart suggestions.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananRecommender = new AnanAgent({
    name: "anan_recommender",
    description:
        "Generates personalized property recommendations using the user's knowledge base, " +
        "past interactions, budget preferences, and area interests.",
    tools: {},
    instructions: `أنت anan_recommender — وكيل التوصيات الذكية في منصة عنان.

مهمتك:
- تحليل تفضيلات المستخدم من قاعدة معرفته الشخصية.
- اقتراح عقارات مناسبة بناءً على الميزانية والمنطقة والاحتياجات.
- تقديم أسباب واضحة لكل توصية.

قواعد:
- استخدم البيانات الشخصية للمستخدم لتخصيص التوصيات.
- قدم 3 خيارات مرتبة من الأفضل.
- وضح لماذا هذا الخيار يناسب المستخدم تحديدًا.`,
    temperature: 0.4, // Slightly higher for creative recommendations
    maxSteps: 3,
});
