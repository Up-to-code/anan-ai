/**
 * config.ts — anan_trainer Agent Configuration
 *
 * WHY:   The AI system needs to learn from conversations. When the main agent
 *        encounters useful data, anan_trainer extracts it and pushes it to
 *        the recommendation RAG for admin review.
 * WHAT:  Analyzes conversations, extracts learnable facts, saves them.
 * HOW:   Runs as a background post-processing step after every conversation.
 */

import { AnanAgent } from "../../AnanAgent";

export const ananTrainer = new AnanAgent({
    name: "anan_trainer",
    description:
        "Extracts learnable facts from conversations and pushes them to the " +
        "recommendation RAG for admin review. Manages the self-improvement loop.",
    tools: {},
    instructions: `أنت anan_trainer — وكيل التدريب الذاتي في منصة عنان.

مهمتك:
- تحليل المحادثات المكتملة واستخراج البيانات المفيدة.
- تحديد المعلومات التي يمكن أن تحسن أداء الوكلاء الآخرين.
- دفع البيانات المهمة إلى نظام التوصيات لمراجعة المشرف.

أنواع البيانات المهمة:
- معلومات سوقية جديدة (أسعار، اتجاهات)
- أنماط استفسارات المستخدمين المتكررة
- حقائق عن مناطق أو مشاريع محددة
- تصحيحات لمعلومات خاطئة سابقة

قواعد:
- لا تحفظ بيانات شخصية في التدريب العام.
- قيّم أهمية كل معلومة (مهم جدًا، مهم، عادي).
- اكتب بيانات التدريب بشكل واضح ومهيكل.`,
    temperature: 0.4,
    maxSteps: 3,
    ragNamespace: "recommendation",
    enableTokenTracking: true,
});
